import {Router} from "express";
import jobApplicationRoute from "./jobApplication";
import stageRouter from "./stage";
import notificationRuleRouter from "./notificationRule";
import userRouter from "./user";
import authRouter from "./auth";
import {extractAuthContext} from "../middleware/extractGetAuthContext";

const apiRouter = Router();

apiRouter.use("/job-application", extractAuthContext, jobApplicationRoute);
apiRouter.use("/stage", extractAuthContext, stageRouter);
apiRouter.use("/notification-rule", extractAuthContext, notificationRuleRouter);
apiRouter.use("/user", extractAuthContext, userRouter);
apiRouter.use("/auth", authRouter)

export default apiRouter;
