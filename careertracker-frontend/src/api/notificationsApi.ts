import axiosClient from "./axiosClient";
import { type Notification } from '../models/notification.ts'

const BASE_URL = "/scheduled-notification";

export const deleteNotification = async (id: string) => {
    return await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const editNotificationReadStatus = async (id: string, isRead: boolean) :  Promise<Notification> => {
    const data = { isRead };
    const res = await axiosClient.put(`${BASE_URL}/${id}/toggle-read`, data);
    return res.data as Notification;
}