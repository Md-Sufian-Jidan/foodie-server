import { Server } from "http";
import app from "./app";
import { prisma } from "./app/lib/prisma";
import { envVars } from "./app/config/env";

process.on("uncaughtException", (error) => {
    console.log(error);
    process.exit(1);
});

let server: Server;

async function connection() {
    try {
        await prisma.$connect();
        server = app.listen(envVars.PORT, () => {
            console.log(`FOODIE server is running on port ${envVars.PORT}`);
        });
    } catch (err) {
        console.log("server connection error", err);
    }
    process.on("unhandledRejection", (error) => {
        if (server) {
            server.close(() => {
                console.log(error);
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    });
}
connection();