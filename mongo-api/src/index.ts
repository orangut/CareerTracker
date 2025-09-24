import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "./config/mongoClient";
import notificationsRulesRouter from "./routes/notificationRule";

// Import your custom routes
import apiRouter from './routes/index';

import swaggerUi from 'swagger-ui-express';

import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
app.use(express.json());

app.use("/notification-rules", notificationsRulesRouter);

const PORT = process.env.PORT || 4000;

connectMongo().then(() => {
    app.listen(PORT, () => console.log(`Mongo API running on port ${PORT}`));
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

// This console.log will confirm the resolved path. Check your terminal!
console.log('Resolved Swagger API path:', path.join(__dirname, './routes/swagger/*.yaml'));

// Serve Swagger UI on the /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API Routes ---
app.use('/api', apiRouter);



export default app;
