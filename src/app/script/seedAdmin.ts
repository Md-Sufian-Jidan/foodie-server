import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
    try {
        const adminData = {
            name: "Admin 1",
            email: envVars.ADMIN_EMAIL,
            password: envVars.ADMIN_PASSWORD,
            role: Role.ADMIN
        };
        console.log(adminData);
        if (!adminData.email || !adminData.password) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined");
        }

        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: adminData.email
            },
        });

        if (existingAdmin) {
            throw new Error("Admin already exists");
        }

        const response = await fetch(
            `${envVars.BETTER_AUTH_URL}/api/auth/sign-up/email`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    origin: envVars.BETTER_AUTH_URL!,
                },
                body: JSON.stringify({
                    name: "Admin",
                    email: adminData.email,
                    password: adminData.password,
                    role: Role.ADMIN,
                }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to create admin: ${errorBody}`);
        }

        if (response.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true,
                }
            });
        };
        console.log("🚀 Admin seeded successfully.");
    } catch (error) {
        console.error("❌ Failed to seed admin:", error);
        process.exit(1); // optional but common in seed scripts
    }

};

seedAdmin();