/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth'
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { fromNodeHeaders } from "better-auth/node";
import AppError from "../errorHelpers/AppError";

export const auth = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            const headers = fromNodeHeaders(req.headers);
            const session = await betterAuth.api.getSession({
                headers
            });

            if (!session || !session.user) {
                throw new AppError(
                    status.UNAUTHORIZED,
                    "Unauthorized! Please log in to access this resource.",
                );
            }

            if (!session.user.emailVerified) {
                throw new AppError(
                    status.FORBIDDEN,
                    "Email verification required to access this resource. Please verfiy your email!",
                );
            }

            if (session.user.status === UserStatus.BLOCKED || session.user.status === UserStatus.INACTIVE || session.user.status === UserStatus.DELETED) {
                throw new AppError(
                    status.FORBIDDEN,
                    "Your account is not active. Please contact the admin for assistance.",
                );
            }

            req.user = {
                userId: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role as Role,
                phone: session.user.phone as string,
                status: session.user.status as UserStatus,
                emailVerified: session.user.emailVerified as boolean,
                createdAt: session.user.createdAt,
                updatedAt: session.user.updatedAt
            }

            if (roles.length && !roles.includes(req?.user?.role as Role)) {
                throw new AppError(
                    status.FORBIDDEN,
                    "Forbidden! You don't have permission to access this resources!",
                );
            }

            next()
        } catch (err: any) {
            next(err)
        }
    }
};
