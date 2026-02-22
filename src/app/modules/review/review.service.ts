import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewData, UpdateReviewData } from "./review.interface";
import { OrderStatus } from "../../../generated/prisma/enums";
import { APIError } from "better-auth";

const createReviewIntoDB = async (payload: CreateReviewData) => {
    const { userId, mealId, rating, comment } = payload;

    if (rating < 1 || rating > 5) {
        throw new AppError(status.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    const meal = await prisma.meal.findUnique({
        where: {
            id: mealId
        }
    });

    if (!meal) {
        throw new AppError(status.NOT_FOUND, "Meal not found");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            userId,
            mealId
        }
    });

    if (existingReview) {
        throw new AppError(status.BAD_REQUEST, "You have already reviewed this meal");
    }

    const hasOrder = await prisma.order.findFirst({
        where: {
            userId,
            status: OrderStatus.DELIVERED,
            items: {
                some: {
                    mealId
                }
            }
        }
    });

    if (!hasOrder) {
        throw new AppError(status.BAD_REQUEST, "You have not ordered this meal");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            mealId,
            rating,
            comment
        },
        include: {
            user: true,
            meal: true
        }
    });

    return review;
};

const getMealReviewsFromDB = async (mealId: string) => {
    const result = await prisma.review.findMany({
        where: {
            mealId
        },
        include: {
            user: true,
        },
        orderBy: {
            createdAt: "desc"
        },
    });

    const averageRating = result.length > 0 ?
        result.reduce((acc, review) => acc + review.rating, 0) / result.length : 0;

    return { averageRating, result, totalReviews: result.length };
};

const getUserReviewsFromDB = async (userId: string) => {
    const result = await prisma.review.findMany({
        where: {
            userId
        },
        include: {
            meal: true
        },
        orderBy: {
            createdAt: "desc"
        },
    });
    return result;
};

const getProviderReviewsFromDB = async (providerId: string) => {
    const providerMeals = await prisma.meal.findMany({
        where: {
            providerId
        },
        select: {
            id: true
        },
    });

    const mealIds = providerMeals.map((meal) => meal.id);

    const reviews = await prisma.review.findMany({
        where: {
            mealId: {
                in: mealIds
            }
        },
        include: {
            user: true,
            meal: true
        },
        orderBy: {
            createdAt: "desc"
        },
    });

    const totalReviews = reviews.length;

    const averageRating = totalReviews > 0 ?
        reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews : 0;

    const ratingDistribution = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    };

    return { reviews, totalReviews, averageRating, ratingDistribution };
};

const updateReviewIntoDB = async (reviewId: string, userId: string, payload: UpdateReviewData) => {

    const isExistReview = await prisma.review.findUnique({
        where: {
            id: reviewId
        }
    });

    if (!isExistReview) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (isExistReview.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update this review");
    }

    if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
        throw new AppError(status.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    const result = await prisma.review.update({
        where: {
            id: reviewId
        },
        data: payload,
        include: {
            user: true,
            meal: true
        }
    });
    return result;
};

const deleteReviewFromDB = async (reviewId: string, userId: string) => {
    const isExistReview = await prisma.review.findUnique({
        where: {
            id: reviewId
        }
    });

    if (!isExistReview) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (isExistReview.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to delete this review");
    }

    await prisma.review.delete({
        where: {
            id: reviewId
        }
    });
    return { message: "Review deleted successfully" };
}

export const ReviewService = {
    createReviewIntoDB,
    getMealReviewsFromDB,
    getUserReviewsFromDB,
    getProviderReviewsFromDB,
    updateReviewIntoDB,
    deleteReviewFromDB
}