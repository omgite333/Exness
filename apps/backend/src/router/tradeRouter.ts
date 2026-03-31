import { Router } from "express";
import {
  closeTradeController,
  fetchClosedTrades,
  fetchOpenTrades,
  openTradeController,
} from "../controller/tradeController.js";
import { guestMiddleware } from "../middleware/guestMiddleware.js";
import { guestTradeLimiter } from "../middleware/guestRateLimiter.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const tradeRouter: Router = Router();

tradeRouter.use(guestMiddleware);
tradeRouter.post("/open", guestTradeLimiter, asyncHandler(openTradeController));
tradeRouter.get("/open", asyncHandler(fetchOpenTrades));
tradeRouter.post("/close", guestTradeLimiter, asyncHandler(closeTradeController));
tradeRouter.get("/closed", asyncHandler(fetchClosedTrades));

export default tradeRouter;