import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth'
import status from "http-status";
import { Role } from "../../generated/prisma/enums";
import { sendResponse } from "../shared/sendResponse";

export const auth = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            });

            if (!session) {
                return sendResponse(res, {
                    statusCode: status.UNAUTHORIZED,
                    success: false,
                    message: "You are not authorized!"
                })
            }

            if (!session.user.emailVerified) {
                return sendResponse(res, {
                    statusCode: status.FORBIDDEN,
                    success: false,
                    message: "Email verification required. Please verfiy your email!"
                })
            }

            req.user = {
                userId: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
                emailVerified: session.user.emailVerified
            }

            if (roles.length && !roles.includes(req.user.role as Role)) {
                return sendResponse(res, {
                    statusCode: status.FORBIDDEN,
                    success: false,
                    message: "Forbidden! You don't have permission to access this resources!"
                })
            }

            next()
        } catch (err: any) {
            return sendResponse(res, {
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                success: false,
                message: err.message || "Something went wrong while authenticating the user.",
                data: err,
            })
        }
    }
};
