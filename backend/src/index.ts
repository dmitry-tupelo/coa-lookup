import { app } from "./app.js";
import { sql } from "./db.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

// Docker sends SIGKILL 10 s after SIGTERM, so give up a little earlier and
// exit on our own terms (with a log line and a meaningful exit code).
const SHUTDOWN_TIMEOUT_MS = 8_000;

const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server started");
});

let isShuttingDown = false;

function handleSignal(signal: string) {
    if (isShuttingDown) {
        logger.info({ signal }, "Received signal again, shutdown already in progress");
        return;
    }
    isShuttingDown = true;
    logger.info({ signal }, "Received signal, shutting down");

    setTimeout(() => {
        logger.error({ timeoutMs: SHUTDOWN_TIMEOUT_MS }, "Shutdown timed out, forcing exit");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    server.close(async (closeError) => {
        if (closeError) {
            logger.error(closeError, "Server close error");
            process.exitCode = 1;
            return;
        }
        logger.info('Server successfully closed');

        try {
            await sql.end({ timeout: 5 });
            logger.info('DB closed successfully');
        } catch (dbError) {
            logger.error(dbError, 'DB close error');
            process.exitCode = 1;
        }
    });
}

process.on("SIGINT", handleSignal);
process.on("SIGTERM", handleSignal);
