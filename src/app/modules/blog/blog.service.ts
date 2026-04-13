import { StatusCodes } from "http-status-codes";


type BlogFilterPayload = {
    page?: number;
    limit?: number;
    skip?: number;
    search?: string;
    userId?: string;
    sortBy?: "title" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
};

const getAllBlogs = async (payload: BlogFilterPayload = {}) => {
    const page = Number(payload.page) || 1;
    const limit = Number(payload.limit) || 10;
    const skip = Number(payload.skip) || (page - 1) * limit;
    const search =
        typeof payload.search === "string" &&
            payload.search.trim() &&
            payload.search !== "undefined" &&
            payload.search !== "null"
            ? payload.search.trim()
            : undefined;
    const userId =
        typeof payload.userId === "string" &&
            payload.userId.trim() &&
            payload.userId !== "undefined" &&
            payload.userId !== "null"
            ? payload.userId.trim()
            : undefined;

    const whereCondition = buildBlogQueryCondition({
        ...(search ? { search } : {}),
        ...(userId ? { userId } : {}),
    });

    const blogPosts = await prisma.blogs.findMany({
        take: limit,
        skip,
        where: whereCondition,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            [payload.sortBy || "createdAt"]: payload.sortOrder || "desc",
        },
    });

    const total = await prisma.blogs.count({
        where: whereCondition,
    });

    if (!blogPosts || blogPosts.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No blog posts found");
    }

    const totalPages = Math.ceil(total / limit);

    return {
        data: blogPosts,
        pagination: {
            total,
            page: payload.page || 1,
            limit: payload.limit || 10,
            totalPages,
        },
    };
};

const getAllForAdmin = async (payload: BlogFilterPayload = {}) => {
    const page = Number(payload.page) || 1;
    const limit = Number(payload.limit) || 10;
    const skip = Number(payload.skip) || (page - 1) * limit;

    const blogPosts = await prisma.blogs.findMany({
        take: limit,
        skip,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            [payload.sortBy || "createdAt"]: payload.sortOrder || "desc",
        },
    });

    const total = await prisma.blogs.count();

    if (!blogPosts || blogPosts.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No blog posts found");
    }

    const totalPages = Math.ceil(total / limit);

    return {
        data: blogPosts,
        pagination: {
            total,
            page: payload.page || 1,
            limit: payload.limit || 10,
            totalPages,
        },
    };
};

const getBlogBySlug = async (slug: string) => {
    const blog = await prisma.blogs.findUnique({
        where: {
            slug,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    return blog;
};

const deleteBlogById = async (id: number) => {
    const deletedBlog = await prisma.blogs.delete({
        where: {
            id: Number(id),
        },
    });

    return deletedBlog;
};
export const BlogService = {
    getAllBlogs,
    getAllForAdmin,
    getBlogBySlug,
    deleteBlogById,
};