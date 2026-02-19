import { envVars } from "../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";

const createToken = (payload: any) => {
    const token = jwt.sign(payload, envVars.JWT_SECRET, { expiresIn: "1d" });
    return token;
};

const verifyToken = async (token: string, secret: string) => {
    try {
        const decoded = await jwt.verify(token, secret) as JwtPayload;
        return {
            success: true,
            data: decoded
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
};

const decodedToken = (token: string) => {
    return jwt.decode(token) as JwtPayload;
};


export const JwtHelpers = {
    verifyToken,
    decodedToken,
    createToken
}