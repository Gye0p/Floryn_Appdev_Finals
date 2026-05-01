import { useEffect, useState } from 'react';
import { AuthUser, onAuthStateChanged } from '../utils/firebase';

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged((nextUser) => {
            setUser(nextUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return { user, loading };
};
