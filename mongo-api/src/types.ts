import {Request} from "express";
import {Filter} from "mongodb";


export interface MyRequestType<F = undefined, D = undefined> extends Request {
    authContext?: {
        userId: string,
        data?: D,
        filters?: Filter<F>,
    }
}