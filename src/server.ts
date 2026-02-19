import { Server } from 'http';
import app from "./app";
import { envVars } from "./app/config/env";
import { prisma } from './app/lib/prisma';

let server: Server;

async function main() {
    try {
        await prisma.$connect();

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        await prisma.$disconnect();
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();

process.on('unhandledRejection', (err) => {
    console.error(`😈 unhandledRejection is detected , shutting down ...`, err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on('uncaughtException', () => {
    console.error(`😈 uncaughtException is detected , shutting down ...`);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM is received');
    if (server) {
        server.close(() => {
            process.exit(0);
        });
    }
});

process.on('SIGINT', () => {
    console.log('SIGINT is received');
    if (server) {
        server.close(() => {
            process.exit(0);
        });
    }
});
