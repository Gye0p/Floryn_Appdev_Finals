export const BASE_URL    = 'http://192.168.137.186:8000/api';
export const UPLOADS_URL = 'http://192.168.137.186:8000/uploads/flowers';

export const TIMEOUT = 15000;

export const ENDPOINTS = {

  LOGIN:           '/login',
  FIREBASE_LOGIN:  '/firebase-login',
  REGISTER:        '/register',
  CHECK_APPROVAL:  '/check-approval',

  ME:              '/me',

  CUSTOMER_ME:            '/customer/me',
  CUSTOMER_FLOWERS:       '/customer/flowers',
  CUSTOMER_CATEGORIES:    '/customer/categories',
  CUSTOMER_RESERVATIONS:  '/customer/reservations',
  CUSTOMER_NOTIFICATIONS: '/customer/notifications',
  CUSTOMER_FCM_TOKEN:     '/customer/fcm-token',
  CUSTOMER_MERCURE_TOKEN: '/customer/mercure-token',
};
