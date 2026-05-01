export const formatCurrency = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return '₱0.00';
    return `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};
