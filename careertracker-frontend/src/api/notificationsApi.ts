import axiosClient from "./axiosClient";
import { type Notification } from '../models/notification.ts'

const BASE_URL = "/scheduled-notification";

export const deleteNotification = async (id: string) => {
    return await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const editNotificationReadStatus = async (id: string, isRead: boolean) :  Promise<Notification> => {
    const res = await axiosClient.patch(`${BASE_URL}/${id}/toggle-read/${isRead}`);
    return res.data as Notification;
}