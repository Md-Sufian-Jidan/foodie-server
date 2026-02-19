import { prisma } from "../../lib/prisma"

const getAllusers = async () => {
    const result = await prisma.user.findMany();
    return result;
};