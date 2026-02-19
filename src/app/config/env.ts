import dotenv from "dotenv";

dotenv.config();

interface envConfig {
    PORT: string;
    NODE_ENV: string;
    DATABASE_URL: string;
    FRONTEND_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    JWT_SECRET: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    APP_USER: string;
    APP_PASS: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
};

const loadEnvVariable = (): envConfig => {
    const requiredVariable = [
        "PORT",
        "NODE_ENV",
        "DATABASE_URL",
        "FRONTEND_URL",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "JWT_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "APP_USER",
        "APP_PASS",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET"
    ];

    requiredVariable.forEach((variable) => {
        if (process.env[variable] === undefined) {
            throw new Error(`Environment variable ${variable} is not defined`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        NODE_ENV: process.env.NODE_ENV as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        JWT_SECRET: process.env.JWT_SECRET as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        APP_PASS: process.env.APP_PASS as string,
        APP_USER: process.env.APP_USER as string,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    };
};

export const envVars = loadEnvVariable();