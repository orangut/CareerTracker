import {Router} from "express";
import jobApplicationRoute from "./jobApplication";
import stageRouter from "./stage";
import notificationRuleRouter from "./notificationRule";
import userRouter from "./user";
import authRouter from "./auth";

const apiRouter = Router();

apiRouter.use("/job-application", jobApplicationRoute);
apiRouter.use("/stage", stageRouter);
apiRouter.use("/notification-rule", notificationRuleRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/auth", authRouter)

export default apiRouter;
