# COA Lookup API

Express 5 + PostgreSQL backend for the COA Lookup site. The public part of the
API lets anyone find a Certificate of Analysis by the LOT number printed on a
product and open its PDF.

This document covers the **public** endpoints only. Routes under `/admin`
require `Authorization: Bearer <ADMIN_API_KEY>` and are not described here.

- Local base URL: `http://localhost:3001` (port comes from `PORT`)

## Conventions

- **JSON everywhere.** Successful responses and errors are JSON, except the PDF
  endpoint, which answers with a redirect.
- **Error shape.** Errors are returned as `{ "error": "<message>" }`. Validation
  errors also include `details` (the list of problems found in the request).
- **Request id.** Every response carries an `X-Request-Id` header. If the client
  sends its own `X-Request-Id`, the same value is echoed back; otherwise the
  server generates a UUID. The id appears in the server logs, so include it
  when reporting a problem with a specific request.
- **CORS.** Browsers may call the API only from the origin configured in
  `CORS_ORIGIN` (`http://localhost:3000` by default).
- **Security headers.** Responses include the standard headers set by
  [helmet](https://helmetjs.github.io/) (`Content-Security-Policy`,
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, ...).
  `X-Powered-By` is not sent.

## Endpoints

| Method | Path                      | Purpose                                  |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/health`                 | Service and database health              |
| GET    | `/coa?lot=<lot>`          | Find certificates by LOT number          |
| GET    | `/coa/:accession/pdf`     | Open the PDF of a certificate (redirect) |

### `GET /health`

Checks that the service is up and can reach the database. Meant for load
balancers and uptime monitors: rely on the status code.

| Status | Body                | Meaning                              |
| ------ | ------------------- | ------------------------------------ |
| `200`  | `{"health":true}`   | Service and database are available   |
| `503`  | `{"health":false}`  | Service is up, database is unreachable |

```bash
curl -i http://localhost:3001/health
```

### `GET /coa?lot=<lot>`

Returns all certificates for a LOT number.

**Query parameters**

| Name  | Required | Description |
| ----- | -------- | ----------- |
| `lot` | yes      | LOT number as printed on the product |

**Matching rules.** The value is trimmed and upper-cased before the lookup, so
`" 64003 "` and `64003` are the same query. Apart from that the match is exact:
punctuation is significant, so `62195` does **not** find `#62195`.

**Responses**

| Status | When |
| ------ | ---- |
| `200`  | Always for a valid query, including when nothing matches (`found: false`, `results: []`) |
| `400`  | `lot` is missing |

```bash
curl "http://localhost:3001/coa?lot=64003"
```

```json
{
  "found": true,
  "results": [
    {
      "id": 3,
      "accessionNumber": "2601270227",
      "lotNumber": "64003",
      "productName": "5 Amino 1MQ 10mg",
      "pdfFilename": "5 Amino 1MQ_10 1_27.pdf",
      "pdfUrl": "https://<store>.public.blob.vercel-storage.com/5%20Amino%201MQ_10%201_27.pdf",
      "createdAt": "2026-09-01T21:55:05.645Z"
    }
  ]
}
```

Missing `lot`:

```json
{
  "error": "Invalid request",
  "details": [
    {
      "expected": "string",
      "code": "invalid_type",
      "path": ["lot"],
      "message": "Invalid input: expected string, received undefined"
    }
  ]
}
```

**Certificate object**

| Field             | Type             | Description |
| ----------------- | ---------------- | ----------- |
| `id`              | number           | Internal database id. Not used in any URL |
| `accessionNumber` | string           | Lab accession number; identifies the certificate in URLs |
| `lotNumber`       | string           | LOT number, stored upper-cased |
| `productName`     | string           | Product name as it appears on the certificate |
| `pdfFilename`     | string \| null   | Original file name of the PDF. Informational only |
| `pdfUrl`          | string \| null   | Direct URL of the PDF in storage, `null` if no PDF has been uploaded |
| `createdAt`       | string (ISO 8601)| When the record was created |

To link to a PDF, use `GET /coa/:accession/pdf` rather than `pdfUrl`: the
redirect always points to the current file, while a stored `pdfUrl` changes
whenever the PDF is replaced.

### `GET /coa/:accession/pdf`

Redirects to the PDF of a certificate. Browsers follow the redirect
automatically; with `curl`, add `-L`. URL-encode the accession number if it
contains spaces or special characters.

| Status | Response | When |
| ------ | -------- | ---- |
| `302`  | `Location: <pdfUrl>` | The PDF is in storage (normal case) |
| `302`  | `Location: /pdfs/<file>` | No storage URL yet, a local copy exists (local development) |
| `404`  | `{"error":"COA not found"}` | No certificate with this accession number |
| `404`  | `{"error":"COA PDF file not available yet"}` | The certificate exists but has no PDF |

```bash
curl -i  http://localhost:3001/coa/2601270227/pdf             # see the redirect
curl -L -o coa.pdf http://localhost:3001/coa/2601270227/pdf   # download the file
```

## Errors common to all endpoints

| Status | Body | When |
| ------ | ---- | ---- |
| `400`  | `{"error": "...", "details": [...]}` or `{"error": "..."}` | The request is malformed |
| `404`  | `{"error":"Not found","message":"Not found"}` | No such route |
| `500`  | `{"error":"Internal server error"}` | Unexpected server error. Details are only in the server logs; use `X-Request-Id` to find them |
