import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from '../config/logger';
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// --- Singleton State ---
// These are private to the module and instantiated only once.
let wss: WebSocketServer | undefined;
const userSockets: Map<string, Set<WebSocket>> = new Map();

// --- Private Helper Function ---
const verifyTokenFromCookie = (cookieHeader?: string): string | null => {
    if (!cookieHeader) { return null; }
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;
    if (!token) { return null; }
    try {
        const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (typeof user === 'object' && user.userId) {
            return user.userId as string;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Initializes the WebSocket server.
 * This function is safe to call multiple times; it will only run once.
 */
export function initWebSocketServer(server: http.Server) {
    // Run-once guard: This ensures it only ever initializes one server.
    if (wss) {
        return;
    }

    wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
        const userId = verifyTokenFromCookie(request.headers.cookie);
        if (!userId) {
            logger.warn("WebSocket connection rejected due to invalid token.");
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        // We know 'wss' is defined inside this callback
        wss!.handleUpgrade(request, socket, head, (ws) => {
            wss!.emit("connection", ws, request, userId);
        });
    });

    wss.on("connection", (ws: WebSocket, req: http.IncomingMessage, userId: string) => {
        logger.info(`WebSocket connection established for userId: ${userId}`);

        let userSocketSet = userSockets.get(userId);

        if (!userSocketSet) {
            userSocketSet = new Set();
            userSockets.set(userId, userSocketSet);
        }
        userSocketSet.add(ws);
        logger.info(`User ${userId} now has ${userSocketSet.size} open connections.`);

        const cleanup = () => {
            const userSocketSet = userSockets.get(userId);
            if (userSocketSet) {
                userSocketSet.delete(ws);
                logger.info(`Socket closed for user ${userId}. ${userSocketSet.size} connections remaining.`);

                if (userSocketSet.size === 0) {
                    userSockets.delete(userId);
                    logger.info(`User ${userId} has no more connections. Removing from map.`);
                }
            }
        };

        ws.on("close", () => {
            logger.warn(`Closing WebSocket for: ${userId}`);
            cleanup();
        });
        ws.on("error", (err) => {
            logger.error(`WebSocket error for user ${userId}: ${err.message}`);
            cleanup(); // Ensure cleanup on error as well
        });
    });

    logger.info("WebSocketServerManager initialized.");
}

/**
 * Sends a notification to all open sockets for a specific user.
 */
export function sendNotification(userId: string, notification: any) {
    const userSocketSet = userSockets.get(userId);

    if (userSocketSet && userSocketSet.size > 0) {
        logger.info(`Sending notification to user ${userId} (${userSocketSet.size} sockets)`);
        const payload = JSON.stringify({ type: "notification", message: notification });

        userSocketSet.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(payload);
                } catch (err: any) {
                    logger.error(`Failed to send to one socket for userId: ${userId}, Error: ${err.message}`);
                }
            }
        });
    } else {
        logger.warn(`No open WebSocket for userId: ${userId}, sockets not found or set is empty`);
    }
}

/**
 * Returns the raw WebSocketServer instance.
 */
export function getWss(): WebSocketServer | undefined {
    return wss;
}

/**
 * Shuts down the server, closes all connections, and clears the map.
 */
export function shutdownWebSocketServer() {
    logger.info("Shutting down WebSocket server...");
    userSockets.forEach((socketSet) => {
        socketSet.forEach(ws => {
            try {
                ws.close(1001, "Server shutdown");
            } catch { /* ignore */ }
        });
    });

    userSockets.clear();
    try { wss?.close(); } catch { }
    wss = undefined; // Allow re-initialization
    logger.info("WebSocket server shut down complete.");
}