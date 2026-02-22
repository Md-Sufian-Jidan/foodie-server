import { Router } from "express";
import { ProviderController } from "./provider.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ProviderValidation } from "./provider.validation";

const router = Router();

router.get(
    "/",
    ProviderController.getAllProviders
);
router.get(
    "/:id",
    ProviderController.getProviderWithId
);
router.post(
    "/create-profile",
    auth(Role.PROVIDER),
    validateRequest(ProviderValidation.createProviderProfileZodSchema),
    ProviderController.createProviderProfile
);

export const ProviderRoutes = router;