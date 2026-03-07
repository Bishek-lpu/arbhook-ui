export const BASE_URL = 'https://hp.bishek.in';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        SIGNUP: `${BASE_URL}/auth/signup`,
        SEND_OTP: `${BASE_URL}/auth/sendOtp`,
    },
    USER: {
        REFERRAL_CODE: `${BASE_URL}/user/referralCode`,
        PAYMENT_LIST: `${BASE_URL}/user/paymentList`,
    },
    ORDER: {
        EXECUTE: `${BASE_URL}/order/execute`,
    },
    PAYMENTS: {
        CREATE: `${BASE_URL}/payments/create`,
    }
};
