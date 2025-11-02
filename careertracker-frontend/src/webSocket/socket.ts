

// Need a better way to initialize WebSocket server URL.
// Using import.meta.env.VITE_SERVER_URL won't work for WebSocket connections because
// the WebSocket protocol uses ws:// or wss://, while the environment variable may
// contain http:// or https://
const SERVER_URL = 'ws://localhost:3000/api';

export function connectSocket(operations: {
    onOpen?: () => void;
    onNotification?: (payload: Object) => void;
    onClose?: (ev?: CloseEvent) => void;
    onError?: (err: Event) => void;
}) {
    const { onOpen, onNotification, onClose, onError } = operations;

    try {
        const socket: WebSocket = new WebSocket(SERVER_URL);

        socket.onopen = () => {
            onOpen?.();
            console.log("Connected to WebSocket server");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "notification") {
                onNotification?.(data.message);
            }
        };

        socket.onclose = () => {
            onClose?.();
        };

        socket.onerror = (error) => {
            onError?.(error);
        }

        function disconnectSocket() {
            socket.close();
        }

        return { socket, disconnectSocket: disconnectSocket };
    } catch (error) {
        console.error("WebSocket connection error:", error);
        return {};
    }
}
