// components/LoginScreenComponents/AddressSelectorScreen.tsx

import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Button,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {addAddress, setCurrentAddress} from '@/store/userSlice';
import MapView, {Region} from 'react-native-maps';
import * as Location from 'expo-location';
import {MaterialIcons} from '@expo/vector-icons';
import LoginButton from '@/components/LoginScreenComponents/loginButton';
import debounce from 'lodash.debounce';
import {scaleFont} from '@/components/utils/ResponsiveFont';
import {router} from "expo-router"; // Adjust the import path as needed

// Define the Address interface
interface Address {
    id?: string; // Optional, can be generated upon adding to Redux
    street: string;
    neighborhood: string;
    district: string;
    province: string;
    country: string;
    postalCode: string;
    apartmentNo: string;
}

const AddressSelectorScreen: React.FC = () => {
    const dispatch = useDispatch();
    const mapRef = useRef<MapView>(null);

    const [isMapInteracted, setIsMapInteracted] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [locationLoading, setLocationLoading] = useState<boolean>(false);
    const [activateAddressDetails, setActivateAddressDetails] = useState<boolean>(false);

    const [address, setAddress] = useState<Address>({
        street: '',
        neighborhood: '',
        district: '',
        province: '',
        country: '',
        postalCode: '',
        apartmentNo: '',
    });

    const [region, setRegion] = useState<Region>({
        latitude: 37.7749, // Default to San Francisco
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // New state for reverse geocoding loading
    const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

    // Retrieve screen dimensions
    const {height, width} = Dimensions.get('window');

    // Initialize Animated Value
    const mapAnimation = useRef(new Animated.Value(0)).current;

    // Animate when activateAddressDetails changes
    useEffect(() => {
        Animated.timing(mapAnimation, {
            toValue: activateAddressDetails ? 1 : 0,
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
        }).start();
    }, [activateAddressDetails]);

    // Interpolations
    const animatedMapTranslateY = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height * 0.55], // Adjust as needed
    });

    const animatedFormTranslateY = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height * 0.55], // Sync with map movement
    });

    // Function to handle fetching location and reverse geocoding
    const fetchLocation = async () => {
        try {
            const {status: existingStatus} = await Location.getForegroundPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const {status} = await Location.requestForegroundPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
                setInitialLoading(false);
                setLocationLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            const {latitude, longitude} = location.coords;

            const newRegion: Region = {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);

            await handleAddressUpdate(latitude, longitude); // Fetch address details

            setInitialLoading(false);
            setLocationLoading(false);
        } catch (error) {
            console.error('Error fetching location:', error);
            Alert.alert('Error', 'An error occurred while fetching the location.');
            setInitialLoading(false);
            setLocationLoading(false);
        }
    };

    const getUserLocation = async () => {
        if (locationLoading) return;
        setLocationLoading(true);
        await fetchLocation();
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    const handleAddressChange = (field: keyof Address, value: string) => {
        setAddress(prevAddress => ({
            ...prevAddress,
            [field]: value,
        }));
    };

    const handleAddressConfirm = () => {
        const {street, district, country} = address;

        // Validate required fields; adjust as necessary
        if (street.trim() === '' || district.trim() === '' || country.trim() === '') {
            Alert.alert('Error', 'Please fill in at least Street, City, and Country.');
            return;
        }

        dispatch(addAddress(JSON.stringify({...address, id: Date.now().toString()}))); // Assign a unique ID
        dispatch(setCurrentAddress(JSON.stringify({...address, id: Date.now().toString()})));

        Alert.alert('Success', 'Address has been set!');
        router.push('/home'); // Navigate to the home screen or desired screen
    };

    /**
     * Updated handleAddressUpdate function to handle both map press and drag end
     * @param latitude
     * @param longitude
     */
    const handleAddressUpdate = async (latitude: number, longitude: number) => {
        try {
            setIsReverseGeocoding(true); // Start loading
            const [addressData] = await Location.reverseGeocodeAsync({latitude, longitude});
            if (addressData) {
                setAddress({
                    street: addressData.street || '',
                    neighborhood: addressData.subregion || '',
                    district: addressData.city || '',
                    province: addressData.region || '',
                    country: addressData.country || '',
                    postalCode: addressData.postalCode || '',
                    apartmentNo: '', // Typically not available via reverse geocoding
                });
            } else {
                Alert.alert('No Address Found', 'Unable to retrieve address for the selected location.');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            Alert.alert('Error', 'An error occurred while fetching the address.');
        } finally {
            setIsReverseGeocoding(false); // End loading
        }
    };

    /**
     * Debounced version of handleAddressUpdate to improve performance
     */
    const debouncedHandleAddressUpdate = useRef(
        debounce(async (latitude: number, longitude: number) => {
            await handleAddressUpdate(latitude, longitude); // Reset on map interaction
        }, 500) // 500ms delay
    ).current;

    /**
     * Cleanup debounce on unmount
     */
    useEffect(() => {
        return () => {
            debouncedHandleAddressUpdate.cancel();
        };
    }, []);

    const toggleAddressDetails = () => {
        setActivateAddressDetails(prevState => !prevState);
    };

    const mapOntouchEvent = () => {
        setIsMapInteracted(true);
        setActivateAddressDetails(false);
    };

    // Handle selecting an address from the list
    const handleSelectAddress = (addressId: string) => {
        dispatch(setCurrentAddress(addressId));
        Alert.alert('Address Selected', `Address ID: ${addressId} has been selected.`);
        router.push('/home'); // Adjust the path as needed
    };

    // Render a single address item (if multiple addresses are allowed)
    const renderAddressItem = ({item}: { item: Address }) => (
        <View style={styles.addressItem}>
            <Text style={styles.addressText}>{`${item.street}, ${item.district} ${item.postalCode}`}</Text>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectAddress(item.id || '')}
            >
                <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },
        mapContainer: {
            borderBottomLeftRadius: 20,
            height: height * 0.805, // Pushes the formWrapper further down; adjust if needed
            borderWidth: 0,
            borderBottomRightRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#000',
        },
        formWrapper: {
            backgroundColor: "#ffffff",
            flex: 1,
            paddingHorizontal: scaleFont(20),
            paddingTop: scaleFont(20),
        },
        belowMap: {
            backgroundColor: "#ffffff",
            flex: 1,
            paddingBottom: scaleFont(50),
            justifyContent: 'center',
            alignItems: 'center',
        },
        map: {
            ...StyleSheet.absoluteFillObject,
        },
        centerMarker: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: scaleFont(-23.5),
            marginTop: scaleFont(-13),
        },
        myLocationButton: {
            position: 'absolute',
            bottom: 15,
            right: 15,
            backgroundColor: '#007AFF',
            padding: scaleFont(12),
            borderRadius: scaleFont(30),
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: scaleFont(4),
            elevation: 5,
        },
        addressPreviewContainer: {
            marginHorizontal: scaleFont(20),
            position: 'relative',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
        },
        addressText: {
            fontSize: scaleFont(16),
            color: '#333',
            flex: 1,
            marginRight: scaleFont(10),
        },
        addressSubText: {
            color: 'gray',
            fontWeight: '300',
            fontSize: scaleFont(12),
        },
        addressLoadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
        },
        loadingText: {
            marginTop: 5,
            fontSize: scaleFont(14),
            color: '#000',
        },
        input: {
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            padding: scaleFont(12),
            marginBottom: scaleFont(12),
            fontSize: scaleFont(16),
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
        },
        reverseGeocodingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        selectButton: {
            backgroundColor: '#007AFF',
            paddingVertical: scaleFont(6),
            paddingHorizontal: scaleFont(12),
            borderRadius: scaleFont(4),
        },
        selectButtonText: {
            color: '#fff',
            fontSize: scaleFont(14),
        },
        addButton: {
            marginTop: scaleFont(20),
            backgroundColor: '#34C759',
            paddingVertical: scaleFont(12),
            paddingHorizontal: scaleFont(20),
            borderRadius: scaleFont(8),
            alignItems: 'center',
        },
        addButtonText: {
            color: '#fff',
            fontSize: scaleFont(16),
        },
        addressItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: scaleFont(10),
            marginBottom: scaleFont(10),
            backgroundColor: '#fff',
            borderRadius: scaleFont(8),
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: scaleFont(4),
            shadowOffset: {width: 0, height: 2},
            elevation: 2,
        },
        listContent: {
            paddingBottom: scaleFont(20),
        },
    });

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF"/>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.mapContainer,
                    {
                        width: width,
                        transform: [{translateY: animatedMapTranslateY}],
                    },
                ]}
            >
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={region}
                    onRegionChangeComplete={(newRegion: Region) => {
                        if (isMapInteracted) {
                            setRegion(newRegion);
                            const {latitude, longitude} = newRegion;
                            debouncedHandleAddressUpdate(latitude, longitude);
                        }
                    }}
                    onTouchStart={mapOntouchEvent}
                    mapType="terrain"
                    showsUserLocation={true}
                    followsUserLocation={false}
                />
                <View style={styles.centerMarker}>
                    <MaterialIcons name="place" size={48} color="#FF0000"/>
                </View>

                <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={getUserLocation}
                    accessibilityLabel="Use My Location"
                    accessibilityHint="Centers the map on your current location and fills in your address"
                    disabled={locationLoading}
                >
                    {locationLoading ? (
                        <ActivityIndicator size="small" color="#fff"/>
                    ) : (
                        <MaterialIcons name="my-location" size={24} color="#fff"/>
                    )}
                </TouchableOpacity>
            </Animated.View>
            <KeyboardAvoidingView
                style={styles.formWrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                {!activateAddressDetails ? (
                    <View style={styles.belowMap}>
                        <View style={styles.addressPreviewContainer}>
                            <View>
                                <Text style={styles.addressText}>
                                    {`${address.street}, ${address.district} ${address.postalCode}`}
                                </Text>
                                <Text style={styles.addressSubText}>
                                    {`${address.province}, ${address.country}`}
                                </Text>
                            </View>
                            {isReverseGeocoding && (
                                <View style={styles.addressLoadingOverlay}>
                                    <ActivityIndicator size="small" color="#007AFF"/>
                                    <Text style={styles.loadingText}>Fetching address...</Text>
                                </View>
                            )}
                            <View>
                                <LoginButton
                                    onPress={toggleAddressDetails}
                                    title={'Edit'}
                                />
                            </View>
                        </View>
                        <View style={{marginTop: scaleFont(20), width: '100%'}}>
                            <LoginButton
                                onPress={handleAddressConfirm}
                                title={'Confirm Address'}
                            />
                        </View>
                    </View>
                ) : (
                    <Animated.View
                        style={[
                            styles.formWrapper,
                            {
                                transform: [{translateY: animatedFormTranslateY}],
                            },
                        ]}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder="Street"
                            value={address.street}
                            onChangeText={(text) => handleAddressChange('street', text)}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Neighborhood"
                            value={address.neighborhood}
                            onChangeText={(text) => handleAddressChange('neighborhood', text)}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            value={address.district}
                            onChangeText={(text) => handleAddressChange('district', text)}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Region"
                            value={address.province}
                            onChangeText={(text) => handleAddressChange('province', text)}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Country"
                            value={address.country}
                            onChangeText={(text) => handleAddressChange('country', text)}
                            returnKeyType="next"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Postal Code"
                            value={address.postalCode}
                            onChangeText={(text) => handleAddressChange('postalCode', text)}
                            keyboardType="numeric"
                            returnKeyType="next"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Apartment Number"
                            value={address.apartmentNo}
                            onChangeText={(text) => handleAddressChange('apartmentNo', text)}
                            returnKeyType="done"
                        />
                        <Button title="Confirm Address" onPress={handleAddressConfirm}/>
                    </Animated.View>
                )}
            </KeyboardAvoidingView>
        </View>
    );

};

export default AddressSelectorScreen;
