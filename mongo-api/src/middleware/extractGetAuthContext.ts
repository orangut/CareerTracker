import {NextFunction, Response} from 'express';
import {MyRequestType} from "../types";
import {Filter, ObjectId} from "mongodb";
import {convertStringIdsToObjectId} from "../utils";
import logger from "../config/logger";


export const extractAuthContext = <F>(req: MyRequestType<F>, res: Response, next: NextFunction) => {
    // req.method will be 'GET', 'POST', 'PUT', 'DELETE', etc.
    const httpMethod = req.method;
    let userId, data, filters;

    if (httpMethod === 'GET') {
        userId = req.query.userId;
        try {
            // Attempt to parse the stringified filters
            filters = JSON.parse(req.query.filters as string) as Filter<F>;

        } catch (error) {
            logger.error('Failed to parse filters from query string:', error);
            return res.status(400).json({
                message: 'Invalid filters format. Filters must be a valid JSON string.'
            });
        }
    } else if (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'DELETE') {
        userId = req.body.userId;
        filters = req.body.filters;
        data = req.body.data
    } else {
        // Handle other or unsupported methods
        return res.status(405).json({message: 'Method Not Allowed'});
    }

    if (!userId || typeof userId !== "string" || !ObjectId.isValid(userId)) {
        // userId is mandatory for all your functions
        logger.error(`Invalid userId format. UserId: ${userId}`);

        return res.status(401).json({
            message: 'Authentication context (userId) is missing or invalid in query parameters.'
        });
    }

    filters = convertStringIdsToObjectId(filters)

    // Inject the extracted and parsed values into a custom property
    req.authContext = {
        userId,
        filters,
        data
    };

    next();
};
