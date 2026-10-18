// Vercel entrypoint.
//
// Vercel looks for the Express app in app.*, index.*, server.* at the project
// root before falling back to src/, so this file is picked up instead of
// src/app.ts. It loads the output of `npm run build` (tsc), which Vercel runs
// first, so Vercel never compiles our TypeScript itself: its own compiler
// resolves some dual ESM/CJS packages (helmet) to their CommonJS types and
// fails the build.
//
// Vercel turns the default-exported app into a function, so src/index.ts
// (app.listen, signal handling, graceful shutdown) is only used when the
// server runs as a long-lived process: `npm start`, `npm run dev`, Docker.

// Vercel only accepts a candidate entrypoint whose source imports "express";
// without this line it skips this file and falls back to src/app.ts.
import "express";

export { app as default } from "./dist/app.js";
