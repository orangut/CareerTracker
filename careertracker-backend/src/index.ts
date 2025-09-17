import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

// Import Sequelize and the database configuration
import sequelize from './config/sequelize';

// Import Swagger libraries
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import your custom routes
import authRoutes from './routes/auth';
import jobApplicationRoutes from './routes/jobApplication';
import userRoutes from './routes/user';

// Import your custom middleware
import authenticateToken from './middleware/authenticateToken';

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
            {
                url: 'http://localhost:3000',
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

// Public routes (for authentication)
app.use('/api/auth', authRoutes);

// Protected routes (require a JWT token)
app.use('/api/jobapplications', authenticateToken, jobApplicationRoutes);
app.use('/api/user', authenticateToken, userRoutes);

// --- Database Sync and Server Start ---

// Use sequelize.sync() to create tables if they don't exist
sequelize.sync()
    .then(() => {
        console.log('Database and tables synced!');
        // Now start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to sync database:', error);
    });