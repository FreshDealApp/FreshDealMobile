import React, {useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RestaurantList from "@/src/features/homeScreen/components/RestaurantCard";
import {Feather} from '@expo/vector-icons';
import {AppDispatch, RootState} from "@/src/redux/store";
import {useDispatch, useSelector} from "react-redux";
import {getRestaurantsByProximity} from "@/src/redux/thunks/restaurantThunks";
import FavoriteRestaurantList from "@/src/features/homeScreen/components/FavoriteRestaurantCard";
import Slider from '@react-native-community/slider';
import {setRadius} from "@/src/redux/slices/restaurantSlice";

interface HomeCardViewProps {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onRestaurantPress?: (restaurantId: string) => void;
}

const MIN_LOADING_DURATION = 200; // main loading duration (redux)
const FILTER_LOADING_DURATION = 200; // duration for filter toggling/loading

const HomeCardView: React.FC<HomeCardViewProps> = ({onScroll, onRestaurantPress}) => {
    const {restaurantsProximity, restaurantsProximityLoading, restaurantsProximityStatus} = useSelector(
        (state: RootState) => state.restaurant
    );

    // For the main loading animation from redux's `loading`
    const [showMainLoading, setShowMainLoading] = useState(restaurantsProximityLoading);

    const dispatch = useDispatch<AppDispatch>();
    // For filtering transition loading animation
    const [filterLoading, setFilterLoading] = useState(false);
    const reduxRadius = useSelector((state: RootState) => state.restaurant.radius);
    const [localRadius, setLocalRadius] = useState(reduxRadius);

    useEffect(() => {
        dispatch(getRestaurantsByProximity());
    }, [dispatch, reduxRadius]);
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (restaurantsProximityLoading) {
            setShowMainLoading(true);
        } else {
            timer = setTimeout(() => {
                setShowMainLoading(false);
            }, MIN_LOADING_DURATION);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [restaurantsProximityLoading]);

    // Combined overall loading state: either main loading or filter transition loading.
    const isLoading = showMainLoading || filterLoading;

    // State for filters
    const [filters, setFilters] = useState({
        pickup: true,
        delivery: false,
        under30: false,
    });

    const [isPriceExpanded, setIsPriceExpanded] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<'$' | '$$' | '$$$' | null>(null);

    // Helper to trigger the filter loading (200ms delay) every time a filter is toggled.
    const triggerFilterLoading = () => {
        setFilterLoading(true);
        setTimeout(() => {
            setFilterLoading(false);
        }, FILTER_LOADING_DURATION);
    };

    const handleToggleFilter = (filterId: 'pickup' | 'delivery' | 'under30') => {
        triggerFilterLoading();
        setFilters((prevFilters) => {
            // When toggling either pickup or delivery, ensure at least one remains true.
            if (filterId === 'pickup' || filterId === 'delivery') {
                const isCurrentlySelected = prevFilters[filterId];
                const otherFilter = filterId === 'pickup' ? 'delivery' : 'pickup';
                if (isCurrentlySelected && !prevFilters[otherFilter]) {
                    return {
                        ...prevFilters,
                        [filterId]: false,
                        [otherFilter]: true,
                    };
                }
            }
            return {
                ...prevFilters,
                [filterId]: !prevFilters[filterId],
            };
        });
    };

    const togglePriceDropdown = () => {
        // Trigger the filter loading animation when opening/closing the price dropdown.
        triggerFilterLoading();
        setIsPriceExpanded((prev) => !prev);
    };

    const handlePriceSelect = (price: '$' | '$$' | '$$$') => {
        triggerFilterLoading();
        setSelectedPrice(price);
        setIsPriceExpanded(false); // Collapse the dropdown after selection
    };

    // Filter restaurant data based on filters.
    // For the "Under 30 min" filter, we assume that 3km or less is reachable in 30 minutes.
    const filteredRestaurants = useMemo(() => {
        if (!restaurantsProximity) return [];
        console.log('restaurantsProximity in HomeCardView:', restaurantsProximity);

        return restaurantsProximity.filter((restaurant) => {
            if (filters.delivery && !filters.pickup && !restaurant.delivery) return false;
            if (filters.pickup && !filters.delivery && !restaurant.pickup) return false;
            if (filters.under30 && restaurant.distance_km > 3) return false;
            // Add debug logs for each step
            console.log('Filtering restaurant:', restaurant.restaurantName);
            return true;
        });

    }, [restaurantsProximity, filters]);


    const setRadiusAction = (value: number) => {
        console.log('Setting radius:', value);
        dispatch(setRadius(value));
    };
    return (
        <View style={styles.safeArea}>

            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.title}>Restaurants Near You</Text>

            </View>

            {/* Filter Bar */}
            <ScrollView
                horizontal
                style={styles.filterBar}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContentContainer}
            >
                {/* Icon Button */}
                <TouchableOpacity style={styles.iconButton}>
                    <Feather name="sliders" size={16} color="#333"/>
                </TouchableOpacity>


                {/* Pick Up Button */}
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filters.pickup && styles.filterButtonSelected,
                    ]}
                    onPress={() => handleToggleFilter('pickup')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filters.pickup && styles.filterTextSelected,
                        ]}
                    >
                        Pick Up
                    </Text>
                </TouchableOpacity>

                {/* Delivery Button */}
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filters.delivery && styles.filterButtonSelected,
                    ]}
                    onPress={() => handleToggleFilter('delivery')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filters.delivery && styles.filterTextSelected,
                        ]}
                    >
                        Delivery
                    </Text>
                </TouchableOpacity>

                {/* Price Button */}
                <TouchableOpacity
                    style={[styles.filterButton, isPriceExpanded && styles.filterButtonSelected]}
                    onPress={togglePriceDropdown}
                >
                    <Text
                        style={[
                            styles.filterText,
                            isPriceExpanded && styles.filterTextSelected,
                        ]}
                    >
                        Price
                    </Text>
                    <Feather
                        name={isPriceExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={isPriceExpanded ? '#FFF' : '#333'}
                        style={styles.dropdownIcon}
                    />
                </TouchableOpacity>

                {/* Under 30 min Button */}
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filters.under30 && styles.filterButtonSelected,
                    ]}
                    onPress={() => handleToggleFilter('under30')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filters.under30 && styles.filterTextSelected,
                        ]}
                    >
                        Under 30 min
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Expandable Price Section */}
            {isPriceExpanded && (
                <View style={styles.priceDropdown}>
                    {['$', '$$', '$$$'].map((price) => (
                        <TouchableOpacity
                            key={price}
                            style={[
                                styles.priceOption,
                                selectedPrice === price && styles.filterButtonSelected,
                            ]}
                            onPress={() => handlePriceSelect(price as '$' | '$$' | '$$$')}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedPrice === price && styles.filterTextSelected,
                                ]}
                            >
                                {price}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Main Content */}
            <View style={styles.container}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#50703C"/>
                        <Text style={styles.loadingText}>Finding the best restaurants...</Text>
                    </View>
                ) : restaurantsProximityStatus !== 'succeeded' || filteredRestaurants.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <View style={styles.noDataIconContainer}>
                            <Feather name="coffee" size={48} color="#50703C"/>
                        </View>
                        <Text style={styles.noDataTitle}>No Restaurants Found</Text>
                        <Text style={styles.noDataMessage}>
                            Try adjusting your filters or expanding your search area
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        onScroll={onScroll}
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                        decelerationRate="normal"
                        scrollEventThrottle={16}
                        renderToHardwareTextureAndroid
                        overScrollMode="never"
                        bounces={false}
                    >
                        <View style={styles.radiusContainer}>
                            <Text style={styles.radiusText}>Search Radius: {localRadius}km</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={100}
                                step={1} // Add step prop for whole numbers
                                value={localRadius}
                                onValueChange={(value) => setLocalRadius(Math.round(value))} // Update local state while sliding
                                onSlidingComplete={(value) => {
                                    const roundedValue = Math.round(value);
                                    setLocalRadius(roundedValue);
                                    dispatch(setRadius(roundedValue)); // Update Redux only when sliding ends
                                }}
                                minimumTrackTintColor="#50703C"
                                maximumTrackTintColor="#E5E7EB"
                                thumbTintColor="#50703C"
                            />
                        </View>

                        <FavoriteRestaurantList
                            restaurants={filteredRestaurants}
                            onRestaurantPress={onRestaurantPress}
                        />
                        <RestaurantList
                            restaurants={filteredRestaurants}
                            onRestaurantPress={onRestaurantPress}
                        />
                    </ScrollView>
                )}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    topBar: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        fontFamily: 'Poppins-SemiBold',
    },
    filterBar: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        maxHeight: 60,

    },
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    filterContentContainer: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterButtonSelected: {
        backgroundColor: '#50703C',
        borderColor: '#50703C',
    },
    filterIcon: {
        marginRight: 6,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#50703C',
        fontFamily: 'Poppins-Regular',

    },
    filterTextSelected: {
        color: '#FFFFFF',
    },
    dropdownIcon: {
        marginLeft: 4,
    },
    priceDropdown: {
        margin: 16,
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    priceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 2,
        borderRadius: 8,
    },
    priceOptionSelected: {
        backgroundColor: '#50703C',
    },
    priceOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        fontFamily: 'Poppins-Regular',

    },
    priceDescription: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Poppins-Regular',

    },
    priceOptionTextSelected: {
        color: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
        fontFamily: 'Poppins-Regular',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    noDataIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    noDataTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',

    },
    noDataMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'Poppins-Regular',

    },
    radiusContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    radiusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        fontFamily: 'Poppins-Regular',
    },
    slider: {
        height: 40,
        width: '100%',
    },
});

export default HomeCardView;
