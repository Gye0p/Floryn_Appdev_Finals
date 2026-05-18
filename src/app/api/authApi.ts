import axios from 'axios';
import { BASE_URL, ENDPOINTS, TIMEOUT } from './config';
import apiClient from './client';

// ─── Request / Response Interfaces ───────────────────────────────────────────
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id:       number;
        username: string;
        fullName: string;
        email:    string;
        roles:    string[];
    };
}

export interface RegisterData {
    username:  string;
    password:  string;
    fullName:  string;
    email:     string;
    phone?:    string;
    address?:  string;
}

export interface RegisterResponse {
    message: string;
    user: {
        id:       number;
        username: string;
        email:    string;
    };
}

export interface ApprovalResponse {
    approved:       boolean;
    status?:        string;
    pendingMessage?: string;
}

// ─── Public Headers ───────────────────────────────────────────────────────────
const publicHeaders = {
    Accept:         'application/json',
    'Content-Type': 'application/json',
};

// ─── API Functions ────────────────────────────────────────────────────────────
export const authLogin = async (payload: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.LOGIN}`,
        payload,
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};

export const getMe = async (): Promise<LoginResponse['user']> => {
    const response = await apiClient.get(ENDPOINTS.ME);
    return response.data;
};

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
    // Symfony controller expects snake_case field names
    const payload = {
        username:  data.username,
        password:  data.password,
        email:     data.email,
        full_name: data.fullName,
        phone:     data.phone,
        address:   data.address,
    };
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.REGISTER}`,
        payload,
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};

export const checkApproval = async (username: string): Promise<ApprovalResponse> => {
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.CHECK_APPROVAL}`,
        { username },
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};

export const authFirebaseLogin = async (firebaseToken: string): Promise<LoginResponse> => {
    const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.FIREBASE_LOGIN}`,
        { firebase_token: firebaseToken },
        { timeout: TIMEOUT, headers: publicHeaders },
    );
    return response.data;
};

