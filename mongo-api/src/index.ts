import express from "express";
import dotenv from "dotenv";
import {connectMongo} from "./config/mongoClient";
import notificationsRulesRouter from "./routes/notificationRule";

// Import your custom routes
import apiRouter from './routes/index';

// Import logger
import logger from './config/logger';

import swaggerUi from 'swagger-ui-express';

import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
app.use(express.json());

app.use("/notification-rules", notificationsRulesRouter);

const PORT = process.env.PORT || 4000;

connectMongo().then(() => {
    app.listen(PORT, () => logger.info(`Mongo API running on port ${PORT}`));
});

// --- Swagger/OpenAPI configuration ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Career Tracker API',
            version: '1.0.0',
            description: 'API for tracking job applications',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // Fix: Use __dirname to build a path relative to the current file (index.ts)
    apis: [
        path.join(__dirname, './routes/swagger/*.yaml')
    ],
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

// This logger.info will confirm the resolved path. Check your log file!
logger.info(`Resolved Swagger API path: ${path.join(__dirname, './routes/swagger/*.yaml')}`);

// Serve Swagger UI on the /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// --- API Routes ---
app.use('/api', apiRouter);

try {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
} catch (error) {
    logger.error('Failed to start server:', error);
}
