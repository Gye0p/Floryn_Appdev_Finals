import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCustomerFlowers, getFlowerCategories } from '../../app/api/customerApi';
import { ROUTES } from '../../utils';
import FlowerCard from '../../components/FlowerCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorRetry from '../../components/ErrorRetry';
import COLORS from '../../theme/colors';
import EmptyState from '../../components/EmptyState';
import { logScreenView } from '../../utils/firebase';
import { logError, logInteraction } from '../../utils/logger';

const FlowerCatalogScreen = ({ navigation }) => {
    const [flowers, setFlowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);

    const refresh = useCallback(async () => {
        logInteraction('Flower catalog: refresh started');
        setLoading(true);
        setError(null);
        try {
            const [flowersData, cats] = await Promise.all([
                getCustomerFlowers(),
                getFlowerCategories(),
            ]);
            setFlowers(flowersData);
            setCategories(['All', ...cats]);
            logInteraction('Flower catalog: refresh success', {
                flowers: flowersData.length,
                categories: cats.length,
            });
        } catch (err) {
            setError(err.message || 'Failed to load flowers');
            logError('Flower catalog: refresh failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useFocusEffect(
        useCallback(() => {
            void logScreenView('FlowerCatalog');
        }, []),
    );

    const filteredFlowers = useMemo(() => {
        let result = flowers;
        if (selectedCategory !== 'All') {
            result = result.filter((f) => f.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (f) =>
                    f.name.toLowerCase().includes(query) ||
                    f.category.toLowerCase().includes(query) ||
                    f.supplier?.toLowerCase().includes(query),
            );
        }
        return result;
    }, [flowers, selectedCategory, searchQuery]);

    if (loading && flowers.length === 0) {
        return <LoadingSpinner message="Loading flowers..." />;
    }

    if (error && flowers.length === 0) {
        return <ErrorRetry message={error} onRetry={refresh} />;
    }

    const handleFlowerPress = (flower) => {
        logInteraction('Flower catalog: open detail', {
            flowerId: flower?.id,
            name: flower?.name,
        });
        navigation.navigate(ROUTES.FLOWER_DETAIL, { flower });
    };

    const handleSearchChange = (text) => {
        if (text.length === 0 || text.length >= 3) {
            logInteraction('Flower catalog: search changed', { query: text });
        }
        setSearchQuery(text);
    };

    const handleCategorySelect = (category) => {
        logInteraction('Flower catalog: category selected', { category });
        setSelectedCategory(category);
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search flowers..."
                    placeholderTextColor={COLORS.muted}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            logInteraction('Flower catalog: clear search');
                            setSearchQuery('');
                        }}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === item && styles.categoryChipActive,
                        ]}
                        onPress={() => handleCategorySelect(item)}>
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === item && styles.categoryChipTextActive,
                            ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <FlatList
                data={filteredFlowers}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <FlowerCard flower={item} onPress={handleFlowerPress} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        colors={[COLORS.navy]}
                        tintColor={COLORS.navy}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        message={
                            searchQuery || selectedCategory !== 'All'
                                ? 'No flowers match your filters'
                                : 'No flowers available right now'
                        }
                    />
                }
                ListHeaderComponent={
                    <Text style={styles.resultCount}>
                        {filteredFlowers.length} flower
                        {filteredFlowers.length !== 1 ? 's' : ''} found
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    clearButton: {
        paddingLeft: 8,
        paddingVertical: 4,
    },
    clearButtonText: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
    },
    categoryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 6,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: COLORS.navy,
        borderColor: COLORS.navy,
    },
    categoryChipText: {
        fontSize: 13,
        color: COLORS.muted,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 24,
    },
    resultCount: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '400',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
});

export default FlowerCatalogScreen;
