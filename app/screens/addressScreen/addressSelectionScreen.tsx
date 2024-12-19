import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import MapView, {Region} from 'react-native-maps';
import * as Location from 'expo-location';
import {MaterialIcons} from '@expo/vector-icons';
import LoginButton from '@/components/LoginScreenComponents/loginButton'; // Keep only one import
import debounce from 'lodash.debounce';
import {scaleFont} from '@/components/utils/ResponsiveFont';
import {addAddressAsync, Address} from "@/store/userSlice";
import InputField from "@/components/defaultInput";
import {AppDispatch} from "@/store/store";
import {router} from "expo-router";
import {useNavigationState} from "@react-navigation/core";


const AddressSelectionScreen: React.FC = () => {
    const navigationState = useNavigationState((state) => state);

    const dispatch = useDispatch<AppDispatch>();
    const mapRef = useRef<MapView>(null);
    const [isMapInteracted, setIsMapInteracted] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [locationLoading, setLocationLoading] = useState<boolean>(false);
    const [activateAddressDetails, setActivateAddressDetails] = useState<boolean>(false);
    //
    const [selectedAddress, setSelectedAddress] = useState<Address>({
        id: '', // Initialize id
        street: '',
        neighborhood: '',
        district: '',
        province: '',
        country: '',
        postalCode: '',
        apartmentNo: '',
        doorNo: '',
    });
    const [region, setRegion] = useState<Region>({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // New state for reverse geocoding loading
    const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

    // Retrieve screen dimensions
    const {height, width} = Dimensions.get('window');

    // Initialize Animated Value
    const [mapAnimation] = useState(new Animated.Value(0));

    // Existing interpolation for the map's translateY
    const animatedMapTranslateY = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height * 0.55], // Adjust as needed
    });

    // New interpolation for the formWrapper's translateY
    const animatedFormTranslateY = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height * 0.55], // The same value to sync movement
    });

    // Animate when activateAddressDetails changes
    useEffect(() => {
        Animated.timing(mapAnimation, {
            toValue: activateAddressDetails ? 1 : 0,
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
        }).start();
    }, [activateAddressDetails]);

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

            await handleAddressUpdate(latitude, longitude); // Reset is desired on initial fetch

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
        setSelectedAddress(prevAddress => ({
            ...prevAddress,
            [field]: value,
        }));
    };


    const handleAddressConfirm = async () => {
        // Extract the necessary fields from the address state
        const {id, ...addressPayload} = selectedAddress;

        // Basic validation to check required fields
        if (!addressPayload.street || !addressPayload.district || !addressPayload.postalCode) {
            Alert.alert('Error', 'Please fill in all required fields (Street, City, Postal Code).');
            return;
        }

        try {
            console.log('Submitting address:', addressPayload);
            try {
                const result = await dispatch(addAddressAsync(addressPayload)).unwrap();
                if (result) { // Check if the result was successfully returned
                    console.log('Address added successfully:', result);
                }
            } catch (error) {
                console.error('Failed to add address:', error);
                // Handle rejection (e.g., display error message)
                setSelectedAddress({
                    id: '',
                    street: '',
                    neighborhood: '',
                    district: '',
                    province: '',
                    country: '',
                    postalCode: '',
                    apartmentNo: '',
                    doorNo: '',

                });
            }

            // Optional: Reset form or navigate

            setActivateAddressDetails(false); // Collapse form
        } catch (error) {
            setSelectedAddress({
                id: '',
                street: '',
                neighborhood: '',
                district: '',
                province: '',
                country: '',
                postalCode: '',
                apartmentNo: '',
                doorNo: '',

            });
            console.error('Address submission failed:', error);
            // @ts-ignore
            Alert.alert('Error', error || 'Failed to add the address. Please try again.');
        }
        handleBack()

    };
    const handleBack = () => {
        // Get the previous screen name
        const prevScreen = navigationState.routes[navigationState.index - 1]?.name;
        console.log('Previous screen:', prevScreen);
        // Check if the previous screen is NOT 'Login'
        if (prevScreen && prevScreen !== 'screens/preLogin') {
            router.back();
        } else {
            console.log('Already at LoginPage, cannot go back.');
            // Optionally navigate to a safe page
        }
    };
    /**
     * Updated handleAddressUpdate function to handle both map press and drag end
     * @param latitude
     * @param longitude
     */
    const handleAddressUpdate = async (latitude: number, longitude: number,) => {
        try {
            setIsReverseGeocoding(true); // Start loading
            const [addressData] = await Location.reverseGeocodeAsync({latitude, longitude});
            if (addressData) {
                setSelectedAddress({
                    id: '', // Clear or keep existing id
                    street: addressData.street || '',
                    neighborhood: addressData.subregion || '',
                    district: addressData.city || '', // same thing as province
                    province: addressData.region || '',
                    country: addressData.country || '',
                    postalCode: addressData.postalCode || '',
                    apartmentNo: '', // not available via reverse geocoding
                    doorNo: '',
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'rgb(239,235,235)',
            //
        },
        mapContainer: {
            flex: 0.85,
            borderBottomLeftRadius: 20,
            borderWidth: 0,
            borderBottomRightRadius: 20,
            overflow: 'hidden',
            // backgroundColor: 'rgba(136,136,136,0.4)',

        },
        formWrapper: {
            marginVertical: scaleFont(16),
            flex: 0.1,
            // marginBottom: scaleFont(20),
            // alignSelf: 'center',
            paddingHorizontal: scaleFont(16),
            gap: scaleFont(16),
        },
        belowMap: {

            paddingVertical: scaleFont(8),

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
            padding: 12,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            // shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 5,
        },

        title: {
            fontSize: 20,
            fontWeight: 'bold',
            // marginBottom: 12,
            textAlign: 'center',
        },
        addressPreviewContainer: {
            marginHorizontal: scaleFont(16),
            // position: 'relative',
            // marginBottom: 16,
            // flex: 1, // Take available space
            // marginRight: 8, // Add some margin to separate from the loading overlay or button
            flexDirection: 'row', // Arrange children in a row
            alignItems: 'center', // Vertically center the items
            justifyContent: 'space-between', // Optional: Adjust spacing between items if needed
            // backgroundColor: 'rgba(136,136,136,0.4)',

        },
        addressText: {
            // color: 'white',
        },
        addressSubText: {
            color: 'gray',
            fontWeight: '300',
            fontSize: 12,
        },
        addressLoadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(136,136,136,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            marginLeft: 8, // Space between address preview and loading overlay
        },
        loadingText: {
            marginTop: 5,
            fontSize: 14,
            // color: '#000',
        },
        input: {
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 16,
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
        loginButton: {
            // flex: 2/3,
            width: '35%',
            borderWidth: 1,
            marginLeft: scaleFont(8)
        }
    });

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
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
                ]}>

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
                    onTouchStart={() => mapOntouchEvent()}
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
                        <ActivityIndicator size="small" color="#0000ff"/>
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
                {!activateAddressDetails && (
                    <View style={styles.belowMap}>
                        <View style={styles.addressPreviewContainer}>
                            <View>
                                <Text
                                    style={styles.addressText}>{`${selectedAddress.street}, ${selectedAddress.district} ${selectedAddress.postalCode}`}</Text>
                                <Text
                                    style={styles.addressSubText}>{`${selectedAddress.province}, ${selectedAddress.country}`}</Text>
                            </View>
                            {isReverseGeocoding && (
                                <View style={styles.addressLoadingOverlay}>
                                    <ActivityIndicator size="small" color="#0000ff"/>
                                    <Text style={styles.loadingText}>Fetching address...</Text>
                                </View>
                            )}
                            <View style={styles.loginButton}>
                                <LoginButton
                                    onPress={toggleAddressDetails}
                                    title={'Select'}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {activateAddressDetails && (
                    <Animated.View
                        style={[
                            styles.formWrapper,
                            {
                                transform: [{translateY: animatedFormTranslateY}],
                            },
                        ]}
                    >
                        <InputField
                            value={selectedAddress.street}
                            onChange={(text) => handleAddressChange('street', text)}
                            placeholder="Street"
                        />
                        <InputField
                            value={selectedAddress.neighborhood}
                            onChange={(text) => handleAddressChange('neighborhood', text)}
                            placeholder="Neighborhood"
                        />
                        <InputField
                            value={selectedAddress.district}
                            onChange={(text) => handleAddressChange('district', text)}
                            placeholder="City"
                        />
                        <InputField
                            value={selectedAddress.province}
                            onChange={(text) => handleAddressChange('province', text)}
                            placeholder="Region"
                        />
                        <InputField
                            value={selectedAddress.country}
                            onChange={(text) => handleAddressChange('country', text)}
                            placeholder="Country"
                        />
                        <InputField
                            value={selectedAddress.postalCode}
                            onChange={(text) => handleAddressChange('postalCode', text)}
                            placeholder="Postal Code"
                            keyboardType="numeric"
                        />
                        <InputField
                            value={selectedAddress.apartmentNo}
                            onChange={(text) => handleAddressChange('apartmentNo', text)}
                            placeholder="Apartment Number"
                        />
                        <LoginButton onPress={handleAddressConfirm} title={'Confirm Address'}/>
                    </Animated.View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

export default AddressSelectionScreen;
