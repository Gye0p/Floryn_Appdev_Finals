const formatMeta = (meta?: unknown) => {
    if (meta == null) {
        return '';
    }

    if (typeof meta === 'string') {
        return meta;
    }

    return meta;
};

export const logInteraction = (event: string, meta?: unknown) => {
    const timestamp = new Date().toISOString();
    console.log(`[Interaction][${timestamp}] ${event}`, formatMeta(meta));
};

export const logError = (event: string, error: unknown) => {
    const timestamp = new Date().toISOString();
    const message =
        typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message ?? 'Unknown error')
            : String(error);
    console.log(`[Interaction][${timestamp}] ${event} (error)`, message);
};
