import axiosClient from './axiosClient';

interface UserData {
    _id: string;
    username: string;
    notifications: object[];
}

const BASE_URL = "/user"

export const fetchCurrentUser = async (): Promise<UserData> => {
    const response = await axiosClient.get(`${BASE_URL}/me`);
    console.log('notifications: ', response.data.notifications)
    return response.data;
};