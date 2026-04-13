import express from "express";
import { CategoryRoutes } from "../modules/category/category.route";
import { MealRoutes } from "../modules/meal/meal.route";
import { OrderRoutes } from "../modules/order/order.route";
import { ProviderRoutes } from "../modules/provider/provider.route";
import { UserRoutes } from "../modules/user/user.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { aiRoutes } from "../modules/ai/ai.route";
import { BlogRoutes } from "../modules/blog/blog.route";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/users",
        routes: UserRoutes,
    },
    {
        path: "/providers",
        routes: ProviderRoutes,
    },
    {
        path: "/categories",
        routes: CategoryRoutes,
    },
    {
        path: "/meals",
        routes: MealRoutes,
    },
    {
        path: "/orders",
        routes: OrderRoutes,
    },
    {
        path: "/reviews",
        routes: ReviewRoutes,
    },
    {
        path: "/ai",
        routes: aiRoutes,
    },
    {
        path: "/blogs",
        routes: BlogRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.routes));
export default router;