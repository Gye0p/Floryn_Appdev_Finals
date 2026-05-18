const FRESHNESS_COLORS: Record<string, string> = {
    Fresh: '#22c55e',
    Good: '#3b82f6',
    'Last Sale': '#f97316',
    Expired: '#ef4444',
};

export const getFreshnessColor = (status: string): string =>
    FRESHNESS_COLORS[status] ?? '#6b7280';
