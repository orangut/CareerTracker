import dbApiClient from "@monorepo/db-api-client/src";
import dotenv from 'dotenv';
import logger from "./logger";

dotenv.config();


const db_api_url = `http://${process.env.DB_API_HOST}:${process.env.DB_API_PORT}/api` || 'http://localhost:4000/api';

export const dbClient = dbApiClient(db_api_url, logger);
export {Stage, User, NotificationRule} from "@monorepo/db-api-client/src/interfaces";
