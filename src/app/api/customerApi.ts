// ─── Response Interfaces ──────────────────────────────────────────────────────
export interface FlowerCategory {
    id:   number;
    name: string;
}

export interface Flower {
    id:              number;
    name:            string;
    category:        string;
    price:           number;
    discountPrice:   number | null;
    stockQuantity:   number;
    freshnessStatus: string;
    status:          string;
    supplier?:       string;
    dateReceived?:   string;
    expiryDate?:     string;
}

export interface ReservationItem {
    flowerId:   number;
    flowerName: string;
    quantity:   number;
    unitPrice:  number;
}

export interface Reservation {
    id:                number;
    reservationStatus: string;
    paymentStatus:     string;
    totalAmount:       number;
    pickupDate?:       string;
    dateReserved?:     string;
    items:             ReservationItem[];
}

export interface CustomerProfile {
    id:          number;
    username:    string;
    fullName:    string;
    email:       string;
    phone?:      string;
    address?:    string;
    roles:       string[];
    memberSince?: string;
}

export interface Notification {
    id:        number;
    message:   string;
    isRead:    boolean;
    createdAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────
import apiClient from './client';
import { ENDPOINTS } from './config';

export const getMyProfile = async (): Promise<CustomerProfile> => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_ME);
    return response.data;
};

export const updateMyProfile = async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    const response = await apiClient.put(ENDPOINTS.CUSTOMER_ME, data);
    return response.data;
};

export const getCustomerFlowers = async (params: Record<string, unknown> = {}): Promise<Flower[]> => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_FLOWERS, { params });
    return response.data.flowers || [];
};

export const getCustomerFlowerDetail = async (id: number): Promise<Flower> => {
    const response = await apiClient.get(`${ENDPOINTS.CUSTOMER_FLOWERS}/${id}`);
    return response.data;
};

export const getFlowerCategories = async (): Promise<string[]> => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_CATEGORIES);
    return response.data.categories || [];
};

export const getMyReservations = async (): Promise<Reservation[]> => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_RESERVATIONS);
    return response.data.reservations || [];
};

export const getMyReservationDetail = async (id: number): Promise<Reservation> => {
    const response = await apiClient.get(`${ENDPOINTS.CUSTOMER_RESERVATIONS}/${id}`);
    return response.data;
};

export const getMyNotifications = async (): Promise<Notification[]> => {
    const response = await apiClient.get(ENDPOINTS.CUSTOMER_NOTIFICATIONS);
    return response.data.notifications || [];
};
