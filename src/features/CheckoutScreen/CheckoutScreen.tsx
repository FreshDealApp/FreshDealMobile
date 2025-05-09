import React, {useEffect, useState} from 'react';
import {Alert, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/src/types/store';
import {AppDispatch} from '@/src/redux/store';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import {differenceInMinutes, format, isAfter, isBefore, setHours, setMinutes} from 'date-fns';
import {GoBackIcon} from "@/src/features/homeScreen/components/goBack";
import {complexHaptic, lightHaptic} from "@/src/utils/Haptics";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/src/utils/navigation";
import {useNavigation} from "@react-navigation/native";
import {createPurchaseOrderAsync, serializeAddressForDelivery} from "@/src/redux/thunks/purchaseThunks";
import {fetchCart} from "@/src/redux/thunks/cartThunks";
import {getRestaurantsByProximity} from "@/src/redux/thunks/restaurantThunks";
import CheckoutSuccess from "@/src/features/CheckoutScreen/components/CheckoutSuccess";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CheckoutScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();

    const {
        selectedRestaurant: restaurant,
    } = useSelector((state: RootState) => ({
        selectedRestaurant: state.restaurant.selectedRestaurant,
    }));

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | null>(null);
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [isCardAdded, setIsCardAdded] = useState(false);
    const [flashDealsEnabled, setFlashDealsEnabled] = useState(false);
    const fadeAnim = new Animated.Value(0);

    const currentDate = new Date();
    const currentDay = format(currentDate, 'EEEE');

    const selectedAddressId = useSelector((state: RootState) => state.address.selectedAddressId);
    const selectedAddress = useSelector((state: RootState) => state.address.addresses.find(address => address.id === selectedAddressId));

    const [startHours, startMinutes] = restaurant.workingHoursStart?.split(':') || ['0', '0'];
    const [endHours, endMinutes] = restaurant.workingHoursEnd?.split(':') || ['0', '0'];

    const todayStart = setHours(setMinutes(new Date(), parseInt(startMinutes)), parseInt(startHours));
    const todayEnd = setHours(setMinutes(new Date(), parseInt(endMinutes)), parseInt(endHours));

    const isWorkingDay = restaurant.workingDays.includes(currentDay);
    const minutesToOpen = differenceInMinutes(todayStart, currentDate);
    const minutesToClose = differenceInMinutes(todayEnd, currentDate);
    const hoursToOpen = Math.floor(Math.abs(minutesToOpen) / 60);
    const hoursToClose = Math.floor(Math.abs(minutesToClose) / 60);
    const minutesRemainderToOpen = Math.abs(minutesToOpen) % 60;
    const minutesRemainderToClose = Math.abs(minutesToClose) % 60;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = daysOfWeek.indexOf(currentDay);
    const nextWorkingDay = restaurant.workingDays.find(day =>
        daysOfWeek.indexOf(day) > currentDayIndex
    ) || restaurant.workingDays[0];

    const {cartItems, selectedRestaurantListings} = useSelector((state: RootState) => ({
        cartItems: state.cart.cartItems,
        selectedRestaurantListings: state.restaurant.selectedRestaurantListings,
    }));
    useEffect(() => {
        dispatch(fetchCart());
        dispatch(getRestaurantsByProximity());
    }, [dispatch]);

    const ListingsInCart = selectedRestaurantListings.filter(listing =>
        cartItems.some(cartItem => cartItem.listing_id === listing.id)
    );

    const isPickup = useSelector((state: RootState) => state.restaurant.isPickup);
    const [showSuccess, setShowSuccess] = useState(false);

    const totalPickUpPrice = ListingsInCart.reduce((sum, item) => {
        const cartItem = cartItems.find(ci => ci.listing_id === item.id);
        const quantity = cartItem?.count || 1;
        return sum + (item.pick_up_price || 0) * quantity;
    }, 0);

    const totalDeliveryPrice = ListingsInCart.reduce((sum, item) => {
        const cartItem = cartItems.find(ci => ci.listing_id === item.id);
        const quantity = cartItem?.count || 1;
        return sum + (item.delivery_price || 0) * quantity;
    }, 0);

    const currentTotal = isPickup ? totalPickUpPrice : totalDeliveryPrice;
    const deliveryFee = !isPickup ? restaurant?.deliveryFee || 0 : 0;
    const subtotal = currentTotal + deliveryFee;

    // Calculate Flash Deal discount
    const calculateFlashDealDiscount = () => {
        if (!flashDealsEnabled || !restaurant.flash_deals_available) return 0;

        if (subtotal >= 400) return 150;
        if (subtotal >= 250) return 100;
        if (subtotal >= 200) return 75;
        if (subtotal >= 150) return 50;

        return 0;
    };

    const flashDealDiscount = calculateFlashDealDiscount();
    const finalTotal = subtotal - flashDealDiscount;

    const toggleFlashDeals = () => {
        if (restaurant.flash_deals_available) {
            setFlashDealsEnabled(!flashDealsEnabled);
        }
    };

    const handlePaymentMethodSelect = (method: 'card' | 'cash') => {
        lightHaptic().then(r => console.log(r));
        setPaymentMethod(method);
        if (method === 'card') {
            setIsCardAdded(true);
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(1000),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const handleCompletePurchase = async () => {
        if (!paymentMethod) {
            Alert.alert('Error', 'Please select a payment method');
            return;
        }

        if (!isWorkingDay || isBefore(currentDate, todayStart) || isAfter(currentDate, todayEnd)) {
            Alert.alert('Error', 'Restaurant is currently closed');
            return;
        }

        try {
            await dispatch(createPurchaseOrderAsync({
                isDelivery: !isPickup,
                notes: deliveryNotes ? deliveryNotes : " ",
                flashDealsActivated: flashDealsEnabled
            }));

            await complexHaptic();
            setShowSuccess(true);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
        await complexHaptic();
    }

    const handleAnimationComplete = () => {
        navigation.reset({
            index: 0,
            routes: [{name: 'HomeScreen'}],
        })
    };

    if (showSuccess) {
        return <CheckoutSuccess onAnimationComplete={handleAnimationComplete}/>;
    }

    const renderRestaurantStatus = () => {
        if (!isWorkingDay) {
            return (
                <View style={styles.statusContainer}>
                    <MaterialIcons name="error" size={24} color="#DC2626"/>
                    <Text style={styles.errorText}>
                        Restaurant is closed today. Next open on {nextWorkingDay}
                    </Text>
                </View>
            );
        }

        const isBeforeOpening = isBefore(currentDate, todayStart);
        const isAfterClosing = isAfter(currentDate, todayEnd);

        if (isBeforeOpening) {
            return (
                <View style={[styles.statusContainer, minutesToOpen <= 120 && styles.soonContainer]}>
                    <MaterialIcons
                        name="access-time"
                        size={24}
                        color={minutesToOpen <= 120 ? "#50703C" : "#666"}
                    />
                    <Text style={[styles.statusText, minutesToOpen <= 120 && styles.soonText]}>
                        {minutesToOpen <= 120
                            ? `Opening soon (${hoursToOpen}h ${minutesRemainderToOpen}m)`
                            : `Opens at ${restaurant.workingHoursStart}`
                        }
                    </Text>
                </View>
            );
        }

        if (isAfterClosing) {
            return (
                <View style={styles.statusContainer}>
                    <MaterialIcons name="error" size={24} color="#DC2626"/>
                    <Text style={styles.errorText}>
                        Restaurant is closed. Opens {nextWorkingDay} at {restaurant.workingHoursStart}
                    </Text>
                </View>
            );
        }

        if (minutesToClose <= 120) {
            return (
                <View style={[styles.statusContainer, styles.soonContainer]}>
                    <MaterialIcons name="access-time" size={24} color="#DC2626"/>
                    <Text style={[styles.statusText, styles.closingSoonText]}>
                        Closing soon ({hoursToClose}h {minutesRemainderToClose}m)
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.statusContainer}>
                <MaterialIcons name="check-circle" size={24} color="#50703C"/>
                <Text style={styles.statusText}>
                    Open until {restaurant.workingHoursEnd}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, {paddingTop: insets.top}]}>
            <View style={styles.header}>
                <GoBackIcon/>
                <Text style={styles.title}>Checkout</Text>
                <View style={{width: 32}}/>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderRestaurantStatus()}

                <View style={styles.orderSummary}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>

                    <View style={styles.restaurantInfo}>
                        <MaterialIcons name="store" size={20} color="#50703C"/>
                        <Text style={styles.restaurantName}>
                            {restaurant.restaurantName || 'Restaurant'}
                        </Text>
                    </View>

                    <View style={styles.orderTypeTag}>
                        <MaterialIcons
                            name={isPickup ? "shopping-bag" : "delivery-dining"}
                            size={16}
                            color="#FFF"
                        />
                        <Text style={styles.orderTypeText}>
                            {isPickup ? 'Pickup' : 'Delivery'}
                        </Text>
                    </View>

                    <View style={styles.summaryContainer}>
                        {ListingsInCart.map(listing => {
                            const cartItem = cartItems.find(ci => ci.listing_id === listing.id);
                            const quantity = cartItem?.count || 1;
                            const price = isPickup ?
                                listing.pick_up_price || 0 :
                                listing.delivery_price || 0;

                            return (
                                <View key={listing.id} style={styles.summaryRow}>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemQuantity}>{quantity}x</Text>
                                        <Text style={styles.summaryLabel}>{listing.title}</Text>
                                    </View>
                                    <Text style={styles.summaryValue}>
                                        {(price * quantity).toFixed(2)} TL
                                    </Text>
                                </View>
                            );
                        })}

                        <View style={styles.divider}/>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{currentTotal.toFixed(2)} TL</Text>
                        </View>

                        {!isPickup && restaurant && restaurant.deliveryFee && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                <Text style={styles.summaryValue}>{restaurant.deliveryFee.toFixed(2)} TL</Text>
                            </View>
                        )}

                        {restaurant.flash_deals_available && (
                            <>
                                <View style={styles.flashDealsContainer}>
                                    <View style={styles.flashDealsHeader}>
                                        <MaterialCommunityIcons name="flash" size={24} color="#FF5252"/>
                                        <Text style={styles.flashDealsTitle}>Flash Deals</Text>
                                        <TouchableOpacity
                                            style={[styles.flashDealsToggle, flashDealsEnabled && styles.flashDealsToggleActive]}
                                            onPress={toggleFlashDeals}
                                        >
                                            <Text
                                                style={[styles.flashDealsToggleText, flashDealsEnabled && styles.flashDealsToggleTextActive]}>
                                                {flashDealsEnabled ? 'ON' : 'OFF'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.flashDealsDescription}>
                                        Flash Deals provide discounts based on order total:
                                    </Text>
                                    <View style={styles.flashDealsDiscountList}>
                                        <Text style={styles.flashDealsDiscountItem}>• 150+ TL: 50 TL off</Text>
                                        <Text style={styles.flashDealsDiscountItem}>• 200+ TL: 75 TL off</Text>
                                        <Text style={styles.flashDealsDiscountItem}>• 250+ TL: 100 TL off</Text>
                                        <Text style={styles.flashDealsDiscountItem}>• 400+ TL: 150 TL off</Text>
                                    </View>

                                    {flashDealsEnabled && flashDealDiscount > 0 && (
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.discountLabel}>Flash Deal Discount</Text>
                                            <Text style={styles.discountValue}>-{flashDealDiscount.toFixed(2)} TL</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalAmount}>{finalTotal.toFixed(2)} TL</Text>
                    </View>
                </View>

                {!isPickup && selectedAddress && (
                    <View style={styles.deliveryAddressSection}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <View style={styles.addressCard}>
                            <MaterialIcons name="location-on" size={24} color="#50703C"/>
                            <Text style={styles.addressText}>
                                {serializeAddressForDelivery(selectedAddress)}
                            </Text>
                        </View>
                    </View>
                )}

                {!isPickup && (
                    <View style={styles.notesSection}>
                        <Text style={styles.sectionTitle}>Delivery Notes</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add delivery instructions..."
                            value={deliveryNotes}
                            onChangeText={setDeliveryNotes}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}

                <View style={styles.paymentSection}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    {isPickup ? (
                        <>
                            <TouchableOpacity
                                style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPayment]}
                                onPress={() => handlePaymentMethodSelect('card')}
                            >
                                <MaterialIcons name="credit-card" size={24} color="#50703C"/>
                                <Text style={styles.paymentText}>Pay Now</Text>
                                {isCardAdded && paymentMethod === 'card' && (
                                    <MaterialIcons name="check-circle" size={24} color="#50703C"/>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedPayment]}
                                onPress={() => handlePaymentMethodSelect('cash')}
                            >
                                <MaterialIcons name="money" size={24} color="#50703C"/>
                                <Text style={styles.paymentText}>Pay at Pickup</Text>
                                {paymentMethod === 'cash' && (
                                    <MaterialIcons name="check-circle" size={24} color="#50703C"/>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPayment]}
                                onPress={() => handlePaymentMethodSelect('card')}
                            >
                                <MaterialIcons name="credit-card" size={24} color="#50703C"/>
                                <Text style={styles.paymentText}>Credit Card</Text>
                                {isCardAdded && paymentMethod === 'card' && (
                                    <MaterialIcons name="check-circle" size={24} color="#50703C"/>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedPayment]}
                                onPress={() => handlePaymentMethodSelect('cash')}
                            >
                                <MaterialIcons name="money" size={24} color="#50703C"/>
                                <Text style={styles.paymentText}>Cash on Delivery</Text>
                                {paymentMethod === 'cash' && (
                                    <MaterialIcons name="check-circle" size={24} color="#50703C"/>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={[
                        styles.completeButton,
                        (!isWorkingDay || !paymentMethod || isBefore(currentDate, todayStart) || isAfter(currentDate, todayEnd)) && styles.disabledButton
                    ]}
                    onPress={handleCompletePurchase}
                    disabled={!isWorkingDay || !paymentMethod || isBefore(currentDate, todayStart) || isAfter(currentDate, todayEnd)}
                >
                    <Text style={styles.completeButtonText}>
                        Complete Purchase
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'Poppins-Bold',
    },
    content: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    orderSummary: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    restaurantName: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Poppins-SemiBold',
    },
    orderTypeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#50703C',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    orderTypeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
        fontFamily: 'Poppins-SemiBold',
    },
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemQuantity: {
        fontSize: 15,
        color: '#50703C',
        fontWeight: '600',
        marginRight: 8,
        fontFamily: 'Poppins-SemiBold',
        minWidth: 24,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Poppins-SemiBold',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#50703C',
        fontFamily: 'Poppins-Bold',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    soonContainer: {
        backgroundColor: '#F0F9EB',
    },
    statusText: {
        marginLeft: 8,
        fontSize: 15,
        color: '#4B5563',
        fontFamily: 'Poppins-Regular',
    },
    soonText: {
        color: '#50703C',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    closingSoonText: {
        color: '#DC2626',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    errorText: {
        marginLeft: 8,
        fontSize: 15,
        color: '#DC2626',
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
    },
    deliveryAddressSection: {
        marginBottom: 16,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addressText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
        fontFamily: 'Poppins-Regular',
    },
    notesSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        fontFamily: 'Poppins-SemiBold',
    },
    notesInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        fontFamily: 'Poppins-Regular',
        fontSize: 15,
        color: '#4B5563',
    },
    paymentSection: {
        marginBottom: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedPayment: {
        backgroundColor: '#F0F9EB',
        borderColor: '#50703C',
        borderWidth: 1,
    },
    paymentText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#4B5563',
        flex: 1,
        fontFamily: 'Poppins-Medium',
    },
    bottomSection: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    completeButton: {
        backgroundColor: '#50703C',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    summaryContainer: {
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#4B5563',
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
    summaryValue: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    flashDealsContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFF9F9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFEEEE',
    },
    flashDealsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    flashDealsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF5252',
        marginLeft: 8,
        flex: 1,
        fontFamily: 'Poppins-SemiBold',
    },
    flashDealsToggle: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    flashDealsToggleActive: {
        backgroundColor: '#FFD7D7',
    },
    flashDealsToggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#777',
        fontFamily: 'Poppins-SemiBold',
    },
    flashDealsToggleTextActive: {
        color: '#FF5252',
    },
    flashDealsDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        fontFamily: 'Poppins-Regular',
    },
    flashDealsDiscountList: {
        marginBottom: 8,
    },
    flashDealsDiscountItem: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        fontFamily: 'Poppins-Regular',
    },
    discountLabel: {
        fontSize: 15,
        color: '#FF5252',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
        flex: 1,
    },
    discountValue: {
        fontSize: 15,
        color: '#FF5252',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default CheckoutScreen;