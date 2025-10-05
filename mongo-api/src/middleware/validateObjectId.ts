import {NextFunction, Request, Response} from "express";
import {ObjectId} from "mongodb";
import logger from "../config/logger";

export const validateObjectId = async (req: Request, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        logger.warn(`Id: ${req.params.id} is invalid.`);
        return res.status(400).json({error: `Invalid id: ${req.params.id}`});
    }
    next()
}
