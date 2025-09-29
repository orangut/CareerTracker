import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

// Import Swagger libraries
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import your custom routes
import apiRouter from './routes';

// Import logger
import logger from './config/logger';


// Import cookie middleware
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from your frontend's origin
const corsOptions = {
    origin: process.env.frontendUrl || 'http://localhost:5173', // <--- Your frontend's URL
    credentials: true, // <--- This allows cookies to be sent
};
app.use(cors(corsOptions)); // <--- Use the CORS middleware

app.use(express.json());

// Middleware for push token auth with cookie to the frontend
app.use(cookieParser());

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
            { url: 'http://localhost:3000' },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'userId',
                },
            },
        },
        // Apply globally to all paths
        security: [
            { cookieAuth: [] }
        ],
    },
    apis: [
        path.join(__dirname, './routes/swagger/*.yaml'),
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
