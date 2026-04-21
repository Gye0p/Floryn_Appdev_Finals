import axios from 'axios';
import { BASE_URL, TIMEOUT } from './config';
import { getToken, clearToken } from '../../utils/tokenStorage';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await clearToken();

        }
        return Promise.reject(error);
    },
);

export default apiClient;
