import { NextFunction, Request, Response } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from '../lib/auth'
import status from "http-status";

export const checkAuth = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get user session
            const session = await auth.api.getSession({
                headers: req.headers as any
            })

            if (!session) {
                return res.status(status.UNAUTHORIZED).json({
                    success: false,
                    message: "You are not authorized!"
                })
            }

            if (!session.user.emailVerified) {
                return res.status(status.FORBIDDEN).json({
                    success: false,
                    message: "Email verification required. Please verfiy your email!"
                })
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified
            }

            if (roles.length && !roles.includes(req.user.role as Role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resources!"
                })
            }

            next()
        } catch (err) {
            next(err);
        }

    }
};
