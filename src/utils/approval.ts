type ApprovalResponse = Record<string, any>;

const APPROVED_STATUSES = ['approved', 'active', 'enabled', 'confirmed', 'ok'];
const DENIED_STATUSES = ['pending', 'rejected', 'denied', 'inactive', 'disabled', 'blocked'];

export const getApprovalIdentifier = ({
    username,
    email,
    displayName,
    fallback,
}: {
    username?: string | null;
    email?: string | null;
    displayName?: string | null;
    fallback?: string | null;
}) => {
    const normalizedUsername = username?.trim();
    if (normalizedUsername) {
        return normalizedUsername;
    }

    const emailCandidate = email?.trim() || fallback?.trim() || '';
    if (emailCandidate.includes('@')) {
        const localPart = emailCandidate.split('@')[0]?.trim();
        if (localPart) {
            return localPart;
        }
    }

    if (emailCandidate) {
        return emailCandidate;
    }

    const normalizedDisplayName = (displayName || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_.-]/g, '');

    return normalizedDisplayName;
};

export const isApprovedByAdmin = (response: ApprovalResponse | null | undefined) => {
    const status = String(
        response?.status ??
            response?.approvalStatus ??
            response?.state ??
            response?.data?.status ??
            response?.data?.approvalStatus ??
            '',
    )
        .trim()
        .toLowerCase();

    if (APPROVED_STATUSES.includes(status)) {
        return true;
    }

    if (DENIED_STATUSES.includes(status)) {
        return false;
    }

    const booleanCandidates = [
        response?.approved,
        response?.isApproved,
        response?.data?.approved,
        response?.data?.isApproved,
        response?.user?.approved,
        response?.user?.isApproved,
        response?.result?.approved,
        response?.result?.isApproved,
    ];

    const explicitBoolean = booleanCandidates.find((value) => typeof value === 'boolean');
    if (typeof explicitBoolean === 'boolean') {
        return explicitBoolean;
    }

    // Fail closed when the API shape is unknown.
    return false;
};

export const getApprovalDeniedMessage = (response: ApprovalResponse | null | undefined) => {
    const status = String(
        response?.status ??
            response?.approvalStatus ??
            response?.state ??
            response?.data?.status ??
            response?.data?.approvalStatus ??
            '',
    )
        .trim()
        .toLowerCase();

    if (status === 'rejected' || status === 'denied' || status === 'blocked') {
        return 'Your account was not approved. Please contact the admin team.';
    }

    return 'Your account is pending admin approval. Please wait for confirmation.';
};
