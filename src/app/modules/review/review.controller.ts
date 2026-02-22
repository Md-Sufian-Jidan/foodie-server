import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import { prisma } from "../../lib/prisma";

const createReview = async () => catchAsync(
    async (req, res) => {
        const userId = req.user?.userId as string;
        const payload = req.body;

        if (!userId) {
            return sendResponse(res, {
                statusCode: status.UNAUTHORIZED,
                success: false,
                message: "Unauthorized",
                data: null,
            });
        }

        const result = await ReviewService.createReviewIntoDB({ ...payload, userId });
        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Review created successfully",
            data: result
        });
    }
);

const getMealReviews = async () => catchAsync(
    async (req, res) => {
        const mealId = req.params.mealId as string;
        const result = await ReviewService.getMealReviewsFromDB(mealId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal reviews fetched successfully",
            data: result
        });
    }
);

const getUserReviews = async () => catchAsync(
    async (req, res) => {
        const userId = req.user?.userId as string;

        if (!userId) {
            return sendResponse(res, {
                statusCode: status.UNAUTHORIZED,
                success: false,
                message: "Unauthorized",
                data: null,
            });
        }

        const result = await ReviewService.getUserReviewsFromDB(userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "User reviews fetched successfully",
            data: result
        });
    }
);

const getProviderReviews = async () => catchAsync(
    async (req, res) => {
        const userId = req.user?.userId as string;
        if (!userId) {
            return sendResponse(res, {
                statusCode: status.BAD_REQUEST,
                success: false,
                message: "Provider ID is required",
                data: null,
            });
        }

        const provider = await prisma.providerProfile.findUnique({
            where: {
                userId
            }
        });

        if (!provider) {
            return sendResponse(res, {
                statusCode: status.NOT_FOUND,
                success: false,
                message: "Provider not found",
                data: null,
            });
        }

        const result = await ReviewService.getProviderReviewsFromDB(provider.id);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Provider reviews fetched successfully",
            data: result
        });
    }
)

const updateReview = async () => catchAsync(
    async (req, res) => {
        const reviewId = req.params.reviewId as string;
        const userId = req.user?.userId as string;
        const payload = req.body;

        if (!userId) {
            return sendResponse(res, {
                statusCode: status.UNAUTHORIZED,
                success: false,
                message: "Unauthorized",
                data: null,
            });
        }

        const result = await ReviewService.updateReviewIntoDB(reviewId, userId, payload);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Review updated successfully",
            data: result
        });
    }
)

const deleteReview = async () => catchAsync(
    async (req, res) => {
        const reviewId = req.params.reviewId as string;
        const userId = req.user?.userId as string;

        if (!userId) {
            return sendResponse(res, {
                statusCode: status.UNAUTHORIZED,
                success: false,
                message: "Unauthorized",
                data: null,
            });
        }

        const result = await ReviewService.deleteReviewFromDB(reviewId, userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Review deleted successfully",
            data: result
        });
    }
)

export const ReviewController = {
    createReview,
    getMealReviews,
    getUserReviews,
    getProviderReviews,
    updateReview,
    deleteReview
}