export const decodeJwt = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export const isTokenExpired = (token) => {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
};
