import { Router } from "express";
import { ProviderController } from "./provider.controller";

const router = Router();

router.get("/", ProviderController.getAllProvidersFromDB);
router.get("/:id", ProviderController.getProviderWithMenuFromDB);

export const ProviderRoutes = router;