const FRESHNESS_COLORS = {
    Fresh: '#22c55e',
    Good: '#3b82f6',
    'Last Sale': '#f97316',
    Expired: '#ef4444',
};

export const getFreshnessColor = (status) =>
    FRESHNESS_COLORS[status] || '#6b7280';
