import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// --- Configure the Logger ---
// Create a Winston logger instance with a rotating file transport
const logger = winston.createLogger({
    level: 'info', // Set the default logging level
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        // Daily rotating file transport
        new DailyRotateFile({
            dirname: path.join(__dirname, '..', 'logs'), // Log files will be saved in a 'logs' directory
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m', // Log file size before rotation
            maxFiles: '14d' // Keep logs for 14 days
        })
    ]
});

export default logger;
