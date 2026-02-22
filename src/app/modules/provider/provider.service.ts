import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { IProviderProfile } from "./provider.interface";

const createProviderProfileIntoDB = async (payload: IProviderProfile) => {
    const { userId, shopName, description, address, phone, isOpen } = payload;

    const result = await prisma.$transaction(async (tx) => {
        const isExistProvider = await tx.providerProfile.findUnique({
            where: {
                userId
            }
        });

        if (isExistProvider) {
            throw new AppError(status.NOT_FOUND, "Provider already exists");
        }

        const user = await tx.user.findUnique({
            where: {
                id: userId
            }
        });

        const providerProfile = await tx.providerProfile.create({
            data: {
                userId,
                shopName,
                description,
                address,
                phone,
                isOpen
            },
            include: {
                user: true
            }
        });
        if (user && !isExistProvider) {
            await tx.user.update({
                where: {
                    id: userId
                },
                data: {
                    role: Role.PROVIDER
                },
            });
        }
        return providerProfile;
    });

    return result;
};

const getAllProvidersFromDB = async () => {
    const result = await prisma.providerProfile.findMany({
        include: {
            user: true,
            meals: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "No providers found");
    }

    return result;
};

const getProviderWithIdFromDB = async (id: string) => {

    const provider = await prisma.providerProfile.findUnique({
        where: {
            userId: id
        },
        include: {
            user: true,
            meals: true,
        }
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }

    return provider;
}

export const ProviderServices = {
    createProviderProfileIntoDB,
    getAllProvidersFromDB,
    getProviderWithIdFromDB
}