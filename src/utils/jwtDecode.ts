// ─── Types ────────────────────────────────────────────────────────────────────
export interface JwtPayload {
    sub?:      string;
    exp?:      number;
    iat?:      number;
    username?: string;
    roles?:    string[];
    [key: string]: unknown;
}

// ─── Decode ───────────────────────────────────────────────────────────────────
export const decodeJwt = (token: string): JwtPayload | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        return JSON.parse(atob(payload)) as JwtPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

// ─── Expiry Check ─────────────────────────────────────────────────────────────
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
};
