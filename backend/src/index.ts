import { app } from "./app.js";
import { sql } from "./db.js";
import { env } from "./env.js";

// Docker sends SIGKILL 10 s after SIGTERM, so give up a little earlier and
// exit on our own terms (with a log line and a meaningful exit code).
const SHUTDOWN_TIMEOUT_MS = 8_000;

const server = app.listen(env.PORT, () => {
    console.log(`API on :${env.PORT}`)
});

let isShuttingDown = false;

function handleSignal(signal: string) {
    if (isShuttingDown) {
        console.log(`Received ${signal} again, shutdown already in progress`);
        return;
    }
    isShuttingDown = true;
    console.log(`Received signal ${signal}, shutting down`);

    setTimeout(() => {
        console.error(`Shutdown took longer than ${SHUTDOWN_TIMEOUT_MS} ms, forcing exit`);
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    server.close(async (closeError) => {
        if (closeError) {
            console.error(`Server can't be closed because of error ${closeError}`);
            process.exitCode = 1;
            return;
        }
        console.log('Server successfully closed');

        try {
            await sql.end({ timeout: 5 });
            console.log('DB closed successfully');
        } catch (dbError) {
            console.error('DB close error', dbError);
            process.exitCode = 1;
        }
    });
}

process.on("SIGINT", handleSignal);
process.on("SIGTERM", handleSignal);
