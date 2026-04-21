import axios from 'axios';
import { BASE_URL, ENDPOINTS, TIMEOUT } from './config';
import apiClient from './client';

const publicHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const authLogin = async (payload) => {
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.LOGIN}`,
        payload,
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};

export const getMe = async () => {
    const response = await apiClient.get(ENDPOINTS.ME);
    return response.data;
};

export const register = async (data) => {
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.REGISTER}`,
        data,
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};

export const checkApproval = async (username) => {
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.CHECK_APPROVAL}`,
        { username },
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};
