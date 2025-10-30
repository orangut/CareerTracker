
// Need a better way to initialize WebSocket server URL.
// Using import.meta.env.VITE_SERVER_URL won't work for WebSocket connections because
// the WebSocket protocol uses ws:// or wss://, while the environment variable may
// contain http:// or https://
const SERVER_URL = 'ws://localhost:3000/api';

export function connectSocket() {
    try {
        const socket: WebSocket = new WebSocket(SERVER_URL);

        socket.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "notification") {
                console.log("New notification:", data.message);
                // Todo: Handle the notification - show on the bell icon
                // e.g., add to a notification context or state
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        function disconnectSocket() {
            socket.close();
        }

        return { socket, disconnectSocket };
    } catch (error) {
        console.error("WebSocket connection error:", error);
    }
}
