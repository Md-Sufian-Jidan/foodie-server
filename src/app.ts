import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import status from "http-status";
import { sendResponse } from "./app/shared/sendResponse";
import { auth } from "./app/lib/auth";
import router from "./app/routes";
import { envVars } from "./app/config/env";

const app: Application = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = envVars.FRONTEND_URL?.replace(/\/$/, "");
            console.log("Allowed origin:", allowed);
            console.log("Origin:", origin);
            if (!origin || origin.replace(/\/$/, "") === allowed) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    }),
);

app.all("/api/auth/*any", toNodeHandler(auth));

app.get("/", (req, res) => {
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Server is running",
        data: {
            author: "Md. Abu Sufian Jidan",
            version: "1.0.0",
            host: req.hostname,
            time: new Date().toISOString(),
        },
    });
});

app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use(notFound);

export default app;