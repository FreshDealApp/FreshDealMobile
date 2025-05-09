import React, {useEffect, useState} from 'react';
import {Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/src/types/store';
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import {getFlashDealsThunk} from '@/src/redux/thunks/restaurantThunks';
import {AppDispatch} from '@/src/redux/store';
import RestaurantList from '@/src/features/homeScreen/components/RestaurantCard';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

const {height} = Dimensions.get('window');

interface FlashDealsBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onFloatingBadgePress: () => void;
}

const FlashDealsBottomSheet = ({
                                   isVisible,
                                   onClose,
                                   onFloatingBadgePress
                               }: FlashDealsBottomSheetProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const {flashDealsRestaurants, flashDealsLoading} = useSelector((state: RootState) => state.restaurant);
    const [isFloatingBadgeVisible, setIsFloatingBadgeVisible] = useState(false);
    const badgeOpacity = useSharedValue(0);
    const badgeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.value
    }));

    useEffect(() => {
        if (isVisible) {
            dispatch(getFlashDealsThunk());
            setIsFloatingBadgeVisible(false);
            badgeOpacity.value = withTiming(0, {duration: 200});
        } else {
            setTimeout(() => {
                setIsFloatingBadgeVisible(true);
                badgeOpacity.value = withTiming(1, {duration: 300});
            }, 500);
        }
    }, [isVisible]);

    const availableRestaurants = flashDealsRestaurants.filter(r => r.flash_deals_available);
    const hasAvailableDeals = availableRestaurants.length > 0;

    return (
        <>
            <Modal
                isVisible={isVisible}
                onBackdropPress={onClose}
                onSwipeComplete={onClose}
                swipeDirection={['down']}
                style={styles.modal}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
            >
                <View style={styles.container}>
                    <View style={styles.handle}/>
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="flash" size={32} color="#FF5252"/>
                        <Text style={styles.title}>Flash Deals</Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.discountBox}>
                            <Text style={styles.discountTitle}>Available Discounts:</Text>
                            <Text style={styles.discountItem}>• Spend 150+ TL: Get 50 TL off</Text>
                            <Text style={styles.discountItem}>• Spend 200+ TL: Get 75 TL off</Text>
                            <Text style={styles.discountItem}>• Spend 250+ TL: Get 100 TL off</Text>
                            <Text style={styles.discountItem}>• Spend 400+ TL: Get 150 TL off</Text>
                        </View>

                        <View style={styles.restaurantsSection}>
                            <Text style={styles.sectionTitle}>
                                {hasAvailableDeals
                                    ? 'Restaurants with Flash Deals Near You'
                                    : 'No restaurants with Flash Deals available nearby'}
                            </Text>

                            {flashDealsLoading ? (
                                <View style={styles.loadingContainer}>
                                    <MaterialCommunityIcons name="loading" size={24} color="#50703C"/>
                                    <Text style={styles.loadingText}>Loading Flash Deals...</Text>
                                </View>
                            ) : hasAvailableDeals ? (
                                <View style={styles.listContainer}>
                                    <RestaurantList restaurants={availableRestaurants}/>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {isFloatingBadgeVisible && (
                <Animated.View style={[styles.floatingBadge, badgeAnimatedStyle]}>
                    <TouchableOpacity
                        style={styles.floatingBadgeButton}
                        onPress={onFloatingBadgePress}
                    >
                        <Feather name="zap" size={16} color="#fff" style={styles.badgeIcon}/>
                        <Text style={styles.badgeText}>Flash Deals</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 30,
        maxHeight: height * 0.8,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'Poppins-Bold',
    },
    content: {
        marginBottom: 20,
    },
    discountBox: {
        backgroundColor: '#FFF9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFEEEE',
    },
    discountTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF5252',
        marginBottom: 10,
        fontFamily: 'Poppins-SemiBold',
    },
    discountItem: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        fontFamily: 'Poppins-Regular',
    },
    restaurantsSection: {
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        fontFamily: 'Poppins-SemiBold',
    },
    listContainer: {
        maxHeight: height * 0.4,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        flexDirection: 'row',
    },
    loadingText: {
        fontSize: 16,
        color: '#50703C',
        marginLeft: 10,
        fontFamily: 'Poppins-Regular',
    },
    closeButton: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    floatingBadge: {
        position: 'absolute',
        bottom: 80,
        right: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    floatingBadgeButton: {
        flexDirection: 'row',
        backgroundColor: '#50703C',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        alignItems: 'center',
    },
    badgeIcon: {
        marginRight: 6,
    },
    badgeText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: '#FFFFFF',
    },
});

export default FlashDealsBottomSheet;
