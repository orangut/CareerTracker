// ...existing code...
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from '../config/logger';
import cookie from "cookie";


const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // prefer setting process.env.JWT_SECRET

class WebSocketServerManager {
    private static instance: WebSocketServerManager | null = null;
    private wss?: WebSocketServer;
    private userSockets = new Map<string, WebSocket>();

    private constructor() { }

    static getInstance(): WebSocketServerManager {
        if (!WebSocketServerManager.instance) {
            WebSocketServerManager.instance = new WebSocketServerManager();
        }
        return WebSocketServerManager.instance;
    }

    init(server: http.Server) {
        if (this.wss) {
            return { sendNotification: this.sendNotification.bind(this), wss: this.wss };
        }

        this.wss = new WebSocketServer({ noServer: true });

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

        server.on("upgrade", (request, socket, head) => {
            const userId = verifyTokenFromCookie(request.headers.cookie);
            if (!userId) {
                logger.warn("WebSocket connection rejected due to invalid token.");
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            this.wss!.handleUpgrade(request, socket, head, (ws) => {
                this.wss!.emit("connection", ws, request, userId);
            });
        });

        this.wss.on("connection", (ws: WebSocket, req: Request, userId: string) => {
            logger.info(`WebSocket connection established for userId: ${userId}`);

            this.userSockets.set(userId, ws);

            const cleanup = () => {
                this.userSockets.delete(userId);
                try { ws.terminate(); } catch { /* ignore */ }
                logger.info(`WebSocket connection closed for userId: ${userId}`);
            };

            ws.on("close", cleanup);
            ws.on("error", cleanup);
        });

        return { sendNotification: this.sendNotification.bind(this), wss: this.wss };
    }

    sendNotification(userId: string, message: any) {
        const socket = this.userSockets.get(userId);
        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify({ type: "notification", message }));
                logger.info(`Sending notification to userId: ${userId}`);
            } catch {
                logger.error(`Failed to send notification to userId: ${userId}`);
            }
        }
        else {
            logger.warn(`No open WebSocket for userId: ${userId}, socket ${socket ? 'closed' : 'not found'}`); 
        }
    }

    getWss(): WebSocketServer | undefined {
        return this.wss;
    }

    shutdown() {
        this.userSockets.forEach((s) => {
            try { s.close(1001, "Server shutdown"); } catch { }
        });
        this.userSockets.clear();
        try { this.wss?.close(); } catch { }
        this.wss = undefined;
    }
}

export function attachWebSocketServer(server: http.Server) {
    return WebSocketServerManager.getInstance().init(server);
}

export default WebSocketServerManager.getInstance();