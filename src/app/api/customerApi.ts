import apiClient from './client';
import { ENDPOINTS } from './config';

export const getMyProfile = async () => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_ME);
    return response.data;
};

export const updateMyProfile = async (data) => {
    const response = await apiClient.put(ENDPOINTS.CUSTOMER_ME, data);
    return response.data;
};

export const getCustomerFlowers = async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_FLOWERS, { params });
    return response.data.flowers || [];
};

export const getCustomerFlowerDetail = async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.CUSTOMER_FLOWERS}/${id}`);
    return response.data;
};

export const getFlowerCategories = async () => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_CATEGORIES);
    return response.data.categories || [];
};

export const getMyReservations = async () => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_RESERVATIONS);
    return response.data.reservations || [];
};

export const getMyReservationDetail = async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.CUSTOMER_RESERVATIONS}/${id}`);
    return response.data;
};

export const getMyNotifications = async () => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_NOTIFICATIONS);
    return response.data.notifications || [];
};
