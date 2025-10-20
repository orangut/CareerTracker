import axiosClient from './axiosClient';

interface UserData {
    _id: string;
    username: string;
}

const BASE_URL = "/user"

export const fetchCurrentUser = async (): Promise<UserData> => {
    const response = await axiosClient.get(`${BASE_URL}/me`);
    return response.data;
};