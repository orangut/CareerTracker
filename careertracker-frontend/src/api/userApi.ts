import axiosClient from './axiosClient';

interface UserData {
    id: string;
    username: string;
}

const BASE_URL = "/user"

export const fetchCurrentUser = async (): Promise<UserData> => {
    const response = await axiosClient.get(`${BASE_URL}/me`);
    return response.data;
};