// Define the TypeScript Interface for a Notification
export interface Notification {
    id: string | number;
    userId: string;
    jobApplicationId: string;
    message: string;
    isRead: boolean;
    createdAt: string,
    expireAt: number
}
