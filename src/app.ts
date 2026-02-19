import cors from "cors";
import express, { Application, Request, Response } from "express";
import { envVars } from "./app/config/env";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { IndexRoutes } from "./app/routes";
import { auth } from "./app/lib/auth";
import { toNodeHandler } from "better-auth/node";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [envVars.FRONTEND_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
}));

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/v1", IndexRoutes);

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: 'API is working',
    })
});

app.use(globalErrorHandler);
app.use(notFound);


export default app;