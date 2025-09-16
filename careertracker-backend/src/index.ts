// src/index.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Import Sequelize and the database configuration
import sequelize from './config/sequelize';

// Import Swagger libraries
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import your custom routes
import authRoutes from './routes/auth';
// import jobApplicationRoutes from './routes/jobApplications';

// Import your custom middleware
import authenticateToken from './middleware/authenticateToken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
                url: 'http://localhost:3000',
            },
        ],
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

// Public routes (for authentication)
app.use('/api/auth', authRoutes);

// Protected routes (require a JWT token)
// app.use('/api/jobapplications', authenticateToken, jobApplicationRoutes);

// --- Database Sync and Server Start ---

// Sync all models with the database and start the server
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronized');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((error) => {
        console.error('Failed to synchronize database:', error);
    });