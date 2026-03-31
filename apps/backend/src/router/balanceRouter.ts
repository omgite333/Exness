import { Router } from "express";
import { guestMiddleware } from "../middleware/guestMiddleware.js";
import { getAssetBalanceController, getUsdBalanceController } from "../controller/balanceController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const balanceRouter: Router = Router();

balanceRouter.use(guestMiddleware);
balanceRouter.get("/", asyncHandler(getAssetBalanceController));
balanceRouter.get("/usd", asyncHandler(getUsdBalanceController));

export default balanceRouter;