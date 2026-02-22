import { Router } from "express";
import { ReviewController } from "./review.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/",
    auth(Role.CUSTOMER),
    ReviewController.createReview
);
router.get(
    "/:mealId",
    ReviewController.getMealReviews
);
router.get(
    "/user",
    auth(Role.CUSTOMER),
    ReviewController.getUserReviews
);
router.get(
    "/provider",
    auth(Role.PROVIDER),
    ReviewController.getProviderReviews
);
router.patch(
    "/:reviewId",
    auth(Role.CUSTOMER),
    ReviewController.updateReview
);
router.delete(
    "/:reviewId",
    auth(Role.CUSTOMER),
    ReviewController.deleteReview
);

export const ReviewRoutes = router;