import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {addItemToCart, fetchCart, removeItemFromCart, updateCartItem} from '@/src/redux/thunks/cartThunks';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '@/src/redux/store';
import {RootState} from "@/src/types/store";
import {Listing} from "@/src/types/api/listing/model";
import {lightHaptic} from "@/src/utils/Haptics";
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {addDays, format} from 'date-fns';

// Import our context
import {ScrollContext} from "@/src/features/RestaurantScreen/RestaurantDetails";

const {width} = Dimensions.get('window');

interface ListingCardProps {
    listingList?: Listing[];
    viewType?: 'cube' | 'rectangle';
}

export const ListingCard: React.FC<ListingCardProps> = ({
                                                            listingList,
                                                            viewType = 'cube'
                                                        }) => {
    const {scrollY, headerHeight} = useContext(ScrollContext);

    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    const dispatch = useDispatch<AppDispatch>();
    const storeListings = useSelector((state: RootState) => state.restaurant.selectedRestaurantListings);
    const listings = listingList || storeListings;
    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
        dispatch(fetchCart());
    }, []);

    const isPickup = useSelector((state: RootState) => state.restaurant.isPickup);

    const getDisplayPrice = useCallback((item: Listing) => {
        return isPickup ? item.pick_up_price : item.delivery_price;
    }, [isPickup]);

    const getFreshScoreColor = (score: number) => {
        if (score >= 80) return '#059669';
        if (score >= 50) return '#F59E0B';
        return '#DC2626';
    };

    const handleListingPress = useCallback((listing: Listing) => {
        lightHaptic();
        setSelectedListing(listing);
        setTimeout(() => {
            bottomSheetRef.current?.present();
        }, 0);
    }, []);

    const handleAddToCart = async (item: Listing) => {
        lightHaptic();
        const existingCartItems = cart.cartItems;
        const cartItem = cart.cartItems.find(
            (cartItem) => cartItem.listing_id === item.id
        );
        const countInCart = cartItem ? cartItem.count : 0;

        if (existingCartItems.length > 0) {
            const existingRestaurantId = existingCartItems[0].restaurant_id;
            if (existingRestaurantId !== item.restaurant_id) {
                alert('You can only add items from the same restaurant to your cart.');
                return;
            }
        }

        if (countInCart >= item.count) {
            alert('Maximum quantity reached for this item');
            return;
        }

        if (countInCart === 0) {
            dispatch(addItemToCart({payload: {listing_id: item.id}}));
        } else {
            dispatch(updateCartItem({payload: {listing_id: item.id, count: countInCart + 1}}));
        }
    };

    const handleRemoveFromCart = (item: Listing) => {
        lightHaptic();
        const cartItem = cart.cartItems.find(
            (cartItem) => cartItem.listing_id === item.id
        );
        const countInCart = cartItem ? cartItem.count : 0;

        if (countInCart === 1) {
            dispatch(removeItemFromCart({listing_id: item.id}));
        } else {
            dispatch(updateCartItem({payload: {listing_id: item.id, count: countInCart - 1}}));
        }
    };

    const renderBottomSheet = () => {
        if (!selectedListing) return null;

        const displayPrice = getDisplayPrice(selectedListing);
        const cartItem = cart.cartItems.find(
            (item) => item.listing_id === selectedListing.id
        );
        const countInCart = cartItem ? cartItem.count : 0;
        const expiryDate = addDays(new Date(), selectedListing.consume_within || 1);

        return (
            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                index={1}
                enableHandlePanningGesture={true}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.bottomSheetIndicator}
                android_keyboardInputMode="adjustResize"
                keyboardBehavior="extend"
                enableOverDrag={false}
                enableContentPanningGesture={true}
            >
                <BottomSheetScrollView contentContainerStyle={styles.modalContent}>
                    <Image
                        source={{uri: selectedListing.image_url}}
                        style={styles.modalImage}
                        resizeMode="cover"
                    />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{selectedListing.title}</Text>
                        <View
                            style={[styles.freshScoreBadge, {
                                backgroundColor: getFreshScoreColor(selectedListing.fresh_score) === '#059669' ? '#ECFDF5' : getFreshScoreColor(selectedListing.fresh_score) === '#F59E0B' ? '#FEF3C7' : '#FEE2E2',
                                borderColor: getFreshScoreColor(selectedListing.fresh_score)
                            }]}>
                            <Icon
                                name="leaf"
                                size={16}
                                color={getFreshScoreColor(selectedListing.fresh_score)}
                                style={styles.freshScoreIcon}
                            />
                            <Text
                                style={[styles.freshScoreText, {color: getFreshScoreColor(selectedListing.fresh_score)}]}>
                                {Math.round(selectedListing.fresh_score)}% Fresh
                            </Text>
                        </View>
                        <View style={styles.consumeWithinBadge}>
                            <Icon name="clock-outline" size={20} color="#DC2626"/>
                            <Text style={styles.consumeWithinText}>
                                Consume within {selectedListing.consume_within} days
                            </Text>
                            <Text style={styles.expiryDate}>
                                Before {format(expiryDate, 'MMM dd, yyyy')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.priceSection}>
                        {selectedListing.original_price && displayPrice && (
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsText}>
                                    Save {Math.round(((selectedListing.original_price - displayPrice) / selectedListing.original_price) * 100)}%
                                </Text>
                            </View>
                        )}
                        <Text style={styles.modalOriginalPrice}>
                            {selectedListing.original_price} TL
                        </Text>
                        <Text style={styles.modalPrice}>{displayPrice} TL</Text>
                    </View>

                    <Text style={styles.modalDescription}>
                        {selectedListing.description}
                    </Text>
                </BottomSheetScrollView>

                <View style={styles.modalCartSection}>
                    {countInCart > 0 ? (
                        <View style={styles.cartControls}>
                            <TouchableOpacity
                                style={styles.cartButton}
                                onPress={() => handleRemoveFromCart(selectedListing)}
                            >
                                <Icon name="minus" size={24} color="#DC2626"/>
                            </TouchableOpacity>
                            <Text style={styles.cartCount}>{countInCart}</Text>
                            <TouchableOpacity
                                style={styles.cartButton}
                                onPress={() => handleAddToCart(selectedListing)}
                            >
                                <Icon name="plus" size={24} color="#059669"/>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={() => handleAddToCart(selectedListing)}
                        >
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                            <Text style={styles.cartPriceText}>{displayPrice} TL</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </BottomSheetModal>
        );
    };

    const renderListingItem = ({item}: { item: Listing }) => {
        const displayPrice = getDisplayPrice(item);
        const cartItem = cart.cartItems.find(
            (cartItem) => cartItem.listing_id === item.id
        );
        const countInCart = cartItem ? cartItem.count : 0;

        const discountPercentage = item.original_price ? Math.round(((item.original_price - displayPrice) / item.original_price) * 100) : 0;

        return (
            <TouchableOpacity
                style={[
                    styles.listingCard,
                    viewType === 'rectangle' && styles.listingCardRectangle
                ]}
                onPress={() => handleListingPress(item)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.cardContainer,
                    viewType === 'rectangle' && styles.cardContainerRectangle
                ]}>
                    <Image
                        source={{uri: item.image_url}}
                        style={[
                            styles.cardImage,
                            viewType === 'rectangle' && styles.cardImageRectangle
                        ]}
                        resizeMode="cover"
                    />
                    <View
                        style={[styles.freshScoreBadgeSmall, {
                            backgroundColor: getFreshScoreColor(item.fresh_score) === '#059669' ? '#ECFDF5' : getFreshScoreColor(item.fresh_score) === '#F59E0B' ? '#FEF3C7' : '#FEE2E2',
                            borderColor: getFreshScoreColor(item.fresh_score)
                        }]}>
                        <Icon
                            name="leaf"
                            size={10}
                            color={getFreshScoreColor(item.fresh_score)}
                            style={styles.freshScoreIconSmall}
                        />
                        <Text style={[styles.freshScoreSmallText, {
                            color: getFreshScoreColor(item.fresh_score),
                            fontWeight: '700'
                        }]}>
                            {Math.round(item.fresh_score)}% Fresh
                        </Text>
                    </View>
                    <View style={[
                        styles.cardContent,
                        viewType === 'rectangle' && styles.cardContentRectangle
                    ]}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {item.title}
                        </Text>

                        <View style={styles.priceAndCartContainer}>
                            <View style={styles.priceContainer}>
                                {item.original_price > displayPrice && (
                                    <Text style={styles.originalPrice}>
                                        {item.original_price} TL
                                    </Text>
                                )}
                                <Text style={styles.currentPrice}>
                                    {displayPrice} TL
                                </Text>
                                {item.original_price > displayPrice && viewType === 'rectangle' && (
                                    <Text style={styles.savingsText}>
                                        Save {discountPercentage}%
                                    </Text>
                                )}
                            </View>

                            <View style={styles.itemCartControls}>
                                {countInCart > 0 ? (
                                    <View style={styles.itemCartButtonsContainer}>
                                        <TouchableOpacity
                                            style={styles.itemCartButton}
                                            onPress={() => handleRemoveFromCart(item)}
                                        >
                                            <Icon name="minus" size={16} color="#DC2626"/>
                                        </TouchableOpacity>
                                        <Text style={styles.itemCartCount}>{countInCart}</Text>
                                        <TouchableOpacity
                                            style={styles.itemCartButton}
                                            onPress={() => handleAddToCart(item)}
                                        >
                                            <Icon name="plus" size={16} color="#059669"/>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.itemAddButton}
                                        onPress={() => handleAddToCart(item)}
                                    >
                                        <Icon name="plus" size={20} color="#059669"/>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.FlatList
                contentContainerStyle={{
                    paddingTop: headerHeight || 0,
                }}
                data={listings}
                renderItem={renderListingItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={viewType === 'cube' ? 2 : 1}
                columnWrapperStyle={viewType === 'cube' ? styles.columnWrapper : undefined}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: true}
                )}
                scrollEventThrottle={16}
            />
            {renderBottomSheet()}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomSheetModal: {
        zIndex: 999,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        paddingBottom: 0,
    },
    modalCartSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    modalDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4B5563',
        marginBottom: 16,
    },
    bottomSheetBackground: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    listingCard: {
        width: (width - 36) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 12,
        flex: 1,
    },
    priceAndCartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        flexWrap: 'nowrap',
    },
    priceContainer: {
        flex: 1,
        marginRight: 8,
    },
    itemCartControls: {
        flexShrink: 0,
    },
    itemCartButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    itemCartButton: {
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    freshScoreBadgeSmall: {
        position: 'absolute',
        right: 8,
        top: 8,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
    },
    freshScoreIconSmall: {
        marginRight: 2,
    },
    freshScoreSmallText: {
        fontSize: 12,
        fontWeight: '600',
    },
    freshScoreIcon: {
        marginRight: 4,
    },
    bottomSheetContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        flex: 1,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
    },
    originalPrice: {
        fontSize: 14,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    savingsText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    itemCartCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginHorizontal: 6,
        minWidth: 20,
        textAlign: 'center',
    },
    itemAddButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    listingCardRectangle: {
        width: '100%',
        marginBottom: 12,
    },
    cardContainer: {
        flexDirection: 'column',
    },
    cardContainerRectangle: {
        flexDirection: 'row',
    },
    cardImageRectangle: {
        width: 120,
        height: 120,
    },
    cardContentRectangle: {
        flex: 1,
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 12,
        position: 'relative',
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cardImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#F3F4F6',
    },
    cartBadge: {
        position: 'absolute',
        right: 8,
        top: 8,
        backgroundColor: '#059669',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    consumeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    consumeText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    bottomSheetIndicator: {
        backgroundColor: '#CBD5E1',
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
    },
    modalHeader: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    freshScoreContainer: {
        marginBottom: 8,
    },
    freshScorePill: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    freshScoreValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    freshScoreBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 8,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    freshScoreText: {
        fontSize: 14,
        fontWeight: '700',
    },
    consumeWithinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    consumeWithinText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    expiryDate: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
    },
    savingsBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#059669',
    },
    modalOriginalPrice: {
        fontSize: 16,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    modalPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#059669',
    },
    cartControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    cartButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    cartCount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: 'center',
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#059669',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    addToCartText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    cartPriceText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ListingCard;