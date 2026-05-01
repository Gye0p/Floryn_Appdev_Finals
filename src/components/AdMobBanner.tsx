import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from '../utils/adMob';

const adUnitId = getBannerAdUnitId();

const AdMobBanner = () => {
    if (adUnitId == null) {
        return null;
    }

    return (
        <View style={styles.container}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        alignItems: 'center',
    },
});

export default AdMobBanner;
