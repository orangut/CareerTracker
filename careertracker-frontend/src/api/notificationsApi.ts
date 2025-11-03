import axiosClient from "./axiosClient";

const BASE_URL = "/scheduled-notification";

export const deleteNotification = async (id: string) => {
    return await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const toggleNotificationReadStatus = async (id: string, isRead: boolean) => {
    return await axiosClient.patch(`${BASE_URL}/${id}/toggle-read/ ${isRead}`);
}