// Define the TypeScript Interface for a Notification
export interface Notification {
    id: string | number;
    message: string;
    isRead: boolean;
    jobApplicationId: string;
    // ... other properties
}