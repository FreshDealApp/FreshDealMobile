import React, {useCallback} from "react";
import {FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Restaurant} from "@/src/types/api/restaurant/model";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/src/redux/store";
import {RootState} from "@/src/types/store";
import {Ionicons} from "@expo/vector-icons";
import {addFavoriteThunk, removeFavoriteThunk} from "@/src/redux/thunks/userThunks";
import {useHandleRestaurantPress} from "@/src/hooks/handleRestaurantPress";
import {tokenService} from "@/src/services/tokenService";

interface RestaurantListProps {
    restaurants: Restaurant[];
}


const RestaurantList: React.FC<RestaurantListProps> = ({restaurants}) => {
    const dispatch = useDispatch<AppDispatch>();
    const favoriteRestaurantsIDs = useSelector((state: RootState) => state.restaurant.favoriteRestaurantsIDs);
    const handleRestaurantPress = useHandleRestaurantPress();
    const selectedAddressID = useSelector((state: RootState) => state.address.selectedAddressId);
    const selectedAddress = useSelector((state: RootState) => state.address.addresses.find((address) => address.id === selectedAddressID));
    if (!selectedAddress) {
        console.error('Selected address is missing.');
        return null;
    }
    const selectedAddressCoordinates = selectedAddress.latitude && selectedAddress.longitude && {
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
    }

    const handleFavoritePress = useCallback((id: number) => {
        const token = tokenService.getToken();
        if (!token) {
            console.error('Authentication token is missing.');
            return;
        }
        if (favoriteRestaurantsIDs.includes(id)) {
            dispatch(removeFavoriteThunk({restaurant_id: id}));
        } else {
            dispatch(addFavoriteThunk({restaurant_id: id}));
        }
    }, [dispatch, favoriteRestaurantsIDs]);

    const renderRestaurantItem = ({item}: { item: Restaurant }) => {
        const isFavorite = favoriteRestaurantsIDs.includes(item.id);

        return (
            <TouchableOpacity
                onPress={() => handleRestaurantPress(item.id)}
                activeOpacity={0.95}
                style={styles.touchableContainer}
            >
                <View style={styles.restaurantCard}>
                    <Image
                        source={{
                            uri: item.image_url?.replace('127.0.0.1', '192.168.1.3') ||
                                'https://via.placeholder.com/400x200',
                        }}
                        style={styles.image}
                    />

                    {/* Favorite Button */}
                    <TouchableOpacity
                        style={styles.heartButton}
                        onPress={() => handleFavoritePress(item.id)}
                    >
                        <View style={styles.heartBackground}>
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite ? "#FF4081" : "#757575"}
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title} numberOfLines={1}>
                                {item.restaurantName || 'Unnamed Restaurant'}
                            </Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color="#4CAF50"/>
                                <Text style={styles.rating}>{(item.rating ?? 0).toFixed(1)}</Text>
                                <Text style={styles.reviewCount}>({item.ratingCount ?? 0}+)</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.locationContainer}>
                                <Ionicons name="location-outline" size={16} color="#666"/>
                                <Text style={styles.locationText}>
                                    Within {(item.distance_km ?? 0).toFixed(0)} meters
                                </Text>
                            </View>
                        </View>

                        <View style={styles.deliveryInfoContainer}>
                            <View style={styles.timeAndPrice}>
                                <Ionicons name="time-outline" size={16} color="#666"/>
                                <Text style={styles.deliveryText}>35 min</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.priceText}>
                                    {item.deliveryFee ? `${item.deliveryFee.toFixed(2)}TL` : 'Free Delivery'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={restaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        backgroundColor: "#fff",
    },
    touchableContainer: {

        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    restaurantCard: {

        overflow: "hidden",
        borderRadius: 12,
    },
    image: {
        position: "relative",
        width: "100%",
        height: 160,
        resizeMode: "cover",
    },
    heartButton: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
    },
    heartBackground: {
        backgroundColor: "white",
        borderRadius: 50,
        padding: 8,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    contentContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginRight: 8,
        fontFamily: "Poppins-SemiBold",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    reviewCount: {
        fontSize: 14,
        color: "#666",
    },
    infoRow: {
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: "#666",
    },
    deliveryInfoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    timeAndPrice: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    deliveryText: {
        fontSize: 14,
        color: "#666",
    },
    dot: {
        fontSize: 14,
        color: "#666",
        marginHorizontal: 4,
    },
    priceText: {
        fontSize: 14,
        color: "#666",
    },

});

export default RestaurantList;