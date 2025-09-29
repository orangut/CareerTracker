import {NextFunction, Request, Response} from "express";
import {AuthenticatedRequest} from "./authenticateToken";
import logger from "../config/logger";
import {Filters} from "@monorepo/db-api-client/src/interfaces"

export interface FilterMiddlewareRequest<F> extends AuthenticatedRequest {
    filters?: Filters<F>
}

export const userIdForeignKeyFiltersHandler = (req: FilterMiddlewareRequest<any>, res: Response, next: NextFunction) => {
    // FIXME: placeholder, should be removed.
    req.role = 'admin';

    const role = req.role;
    const userId = req.userId;

    if (!role || !userId) {
        logger.error("No role found for authentication. There is error in authenticate middleware");
    }

    // If the user is 'user', restrict access to their stages.
    if (role === 'user') {
        req.filters = {userId: userId};
    }
    // If the user is 'admin' or any other role, no extra filter is applied.
    req.filters = {}
    next()
}

export const userFiltersHandler = (req: FilterMiddlewareRequest<any>, res: Response, next: NextFunction) => {
    // FIXME: placeholder, should be removed.
    req.role = 'admin';

    const role = req.role;
    const userId = req.userId;

    if (!role || !userId) {
        logger.error("No role found for authentication. There is error in authenticate middleware");
    }

    // If the user is 'user', restrict access to their stages.
    if (role === 'user') {
        req.filters = {_id: userId};
    }
    // If the user is 'admin' or any other role, no extra filter is applied.
    req.filters = {}
    next()
}
