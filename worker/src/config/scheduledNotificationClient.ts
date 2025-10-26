import axios, {InternalAxiosRequestConfig} from 'axios';
import dotenv from "dotenv";
import logger from "./logger"; // Assuming this is a custom logger object with .info(), .error() methods

dotenv.config();

// --- Configuration ---
// Define the base URL for your API.
const BASE_URL = `http://${process.env.NOTIFICATION_CLIENT_HOST}:${process.env.NOTIFICATION_CLIENT_PORT}/api/scheduled-notification` || 'http://localhost:3000/api/scheduled-notification';

// Create an Axios instance configured with the base URL and default headers.
export const ScheduledNotificationClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // Request timeout in ms
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Request Interceptor for Global Logging and Configuration ---
ScheduledNotificationClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Log the outgoing request
        logger.info(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        // Log request setup errors (e.g., config error before sending)
        logger.error(`[API Request Error] ${error.message}`);
        return Promise.reject(error);
    }
);

// --- Response Interceptor for Global Error Handling and Logging ---
ScheduledNotificationClient.interceptors.response.use(
    // Successful response (2xx status codes)
    (response) => {
        // Log the successful response
        const {config, status} = response;
        logger.info(`[API Response] ${config.method?.toUpperCase()} ${config.url} - Status: ${status}`);
        return response;
    },
    // Failed response (e.g., 4xx or 5xx status codes)
    (error) => {
        let errorMessage = 'An unexpected error occurred.';

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx.
            const status = error.response.status;
            const data = error.response.data;
            const url = error.config.url;
            const method = error.config.method?.toUpperCase();

            if (status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (status === 404) {
                errorMessage = `Resource not found: ${url}`;
            } else if (data && data.message) {
                // If the API sends back a specific error message
                errorMessage = data.message;
            } else {
                errorMessage = `Server Error: Status ${status}`;
            }

            // Log the detailed server error
            logger.error(`[API Server Error] ${method} ${url} - Status: ${status} - Message: ${errorMessage}`, data);
            console.error('API Error Response:', errorMessage, data);

        } else if (error.request) {
            // The request was made but no response was received (e.g., network issue, server offline)
            errorMessage = 'No response received from the server.';
            // Log the network error
            logger.error(`[API Network Error] ${error.config.method?.toUpperCase()} ${error.config.url} - Message: ${errorMessage}`);
            console.error('API Error Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = `Request Setup Error: ${error.message}`;
            // Log the setup error
            logger.error(`[API Setup Error] Message: ${errorMessage}`);
            console.error('API Error Setup:', error.message);
        }

        // Return a rejected promise with a standardized Error object
        return Promise.reject(new Error(errorMessage));
    }
);


// --- API Call Functions ---

/**
 * Executes a GET request to the specified URI.
 * @param {string} uri - The endpoint URI (e.g., '/users/1').
 * @param {object} [params={}] - Optional query parameters.
 * @returns {Promise<any>} The response data.
 */
export const get = async (uri: string, params = {}) => {
    // The URI is appended to the BASE_URL
    const response = await ScheduledNotificationClient.get(uri, {params});
    return response.data;
};

/**
 * Executes a POST request to the specified URI with data.
 * @param {string} uri - The endpoint URI (e.g., '/users').
 * @param {object} [data={}] - The payload to send in the request body.
 * @returns {Promise<any>} The response data.
 */
export const post = async (uri: string, data: object = {}) => {
    // The URI is appended to the BASE_URL
    const response = await ScheduledNotificationClient.post(uri, data);
    return response.data;
};

// You can add other methods like put, delete, etc. here as well.
// export const put = (uri, data = {}) => ScheduledNotificationClient.put(uri, data).then(res => res.data);