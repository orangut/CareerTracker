import {Request} from "express";
import {Filter} from "mongodb";

interface MyRequestBody<F, D> {
    filters?: Filter<F>[];
    data?: D;
    userId: string;
}

export type MyRequestType<F=undefined, D=undefined> = Request<any, any, MyRequestBody<F, D>>
