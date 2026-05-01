import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Set your real Ad Unit IDs here before releasing to production.
const PROD_BANNER_AD_UNIT_IDS = {
    android: 'ca-app-pub-7765081406118752/8847141694',
    ios: '',
};

const looksLikePlaceholder = (value: string) => {
    return value.includes('XXXX') || value.includes('ca-app-pub-XXXXXXXXXXXXXXXX');
};

const isValidProductionId = (value: string) => {
    return value.length > 0 && !looksLikePlaceholder(value);
};

export const getBannerAdUnitId = () => {
    if (__DEV__) {
        return TestIds.BANNER;
    }

    const productionId = Platform.select({
        android: PROD_BANNER_AD_UNIT_IDS.android,
        ios: PROD_BANNER_AD_UNIT_IDS.ios,
        default: '',
    }) ?? '';

    if (!isValidProductionId(productionId)) {
        return null;
    }

    return productionId;
};
