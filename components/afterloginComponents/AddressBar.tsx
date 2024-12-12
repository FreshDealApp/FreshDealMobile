// components/LoginScreenComponents/AddressBar.tsx

import React, {useEffect, useState} from 'react';
import {FlatList, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '@/store/store'; // Ensure this path is correct based on your project structure
import {scaleFont} from '@/components/utils/ResponsiveFont';
import {Ionicons} from '@expo/vector-icons';
import LoginButton from "@/components/LoginScreenComponents/loginButton";
import {useRouter} from 'expo-router'; // Use the useRouter hook for navigation

interface Address {
    id: string; // Ensure each address has a unique ID
    street: string;
    neighborhood: string;
    district: string;
    province: string;
    country: string;
    postalCode: string;
    apartmentNo: string;
}

const AddressBar: React.FC = () => {
    const addresses = useSelector((state: RootState) => state.user.addresses) as unknown as Address[];
    const router = useRouter();

    const [selectedAddress, setSelectedAddress] = useState<Address | null>(
        addresses.length > 0 ? addresses[0] : null
    );
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [textWidth, setTextWidth] = useState<number>(0);

    // Update selectedAddress if addresses change
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0]);
        } else if (addresses.length === 0) {
            setSelectedAddress(null);
        }
    }, [addresses, selectedAddress]);

    const handleAddressSelect = (address: Address) => {
        setSelectedAddress(address);
        setModalVisible(false);
    };

    // Improved address rendering logic
    const renderAddressContent = () => {
        if (!selectedAddress) return 'No address selected';

        // Optional: Adjust based on actual screen sizes and font scaling
        if (textWidth <= scaleFont(120)) {
            return selectedAddress.street;
        } else if (textWidth > scaleFont(120) && textWidth <= scaleFont(220)) {
            return `${selectedAddress.street}, ${selectedAddress.district}`;
        } else {
            return `${selectedAddress.street}, ${selectedAddress.district}, ${selectedAddress.province}`;
        }
    };

    const switchToAddAddress = () => {
        router.push('/addressSelection'); // Use absolute path
    };

    const handleAddNewAddress = () => {
        setModalVisible(false);
        switchToAddAddress();
    };

    // Render each address item in the FlatList
    const renderAddressItem = ({item}: { item: Address }) => (
        <TouchableOpacity
            onPress={() => handleAddressSelect(item)}
            style={styles.addressOption}
            accessibilityLabel="Select Address"
            accessibilityHint={`Select the address at ${item.street}, ${item.district}`}
        >
            <Text style={styles.addressOptionText}>
                {`${item.street}, ${item.district}, ${item.province}`}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.addressBar,
                    {minWidth: textWidth + scaleFont(40)} // Ensure minWidth doesn't break layout
                ]}
            >
                <Ionicons name="location-sharp" size={scaleFont(20)} color="#666" style={styles.icon}/>
                <Text
                    style={styles.addressText}
                    onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
                >
                    {renderAddressContent()}
                </Text>

                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.touchableOverlay}
                    activeOpacity={1} // Ensure touchable area
                />
            </View>

            {modalVisible && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPressOut={() => setModalVisible(false)} // Close modal when tapping outside
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Select Address</Text>
                            {addresses.length > 0 ? (
                                <FlatList
                                    data={addresses}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderAddressItem}
                                    contentContainerStyle={styles.flatListContent}
                                />
                            ) : (
                                <Text style={styles.noAddressesText}>No addresses available.</Text>
                            )}
                            <TouchableOpacity
                                onPress={handleAddNewAddress}
                                style={styles.addAddressButton}
                                accessibilityLabel="Add New Address"
                                accessibilityHint="Navigate to add a new address screen"
                            >
                                <Ionicons name="add-circle-outline" size={scaleFont(20)} color="#007AFF"/>
                                <Text style={styles.addAddressText}>Add New Address</Text>
                            </TouchableOpacity>
                            <LoginButton
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                                title="Close"
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Ensure the AddressBar is positioned correctly within its parent
        padding: scaleFont(10),
    },
    addressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleFont(10),
        paddingHorizontal: scaleFont(15),
        borderRadius: scaleFont(20),
        backgroundColor: '#f1f1f1',
        borderColor: '#ccc',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 2,
        maxHeight: scaleFont(60),
        minWidth: scaleFont(120),
    },
    icon: {
        marginRight: scaleFont(8),
    },
    addressText: {
        fontSize: scaleFont(16),
        color: '#333',
        flexShrink: 1, // Prevent text overflow
    },
    touchableOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: scaleFont(10),
        padding: scaleFont(15),
    },
    modalTitle: {
        fontSize: scaleFont(18),
        fontWeight: 'bold',
        marginBottom: scaleFont(10),
        textAlign: 'center',
    },
    flatListContent: {
        paddingBottom: scaleFont(10),
    },
    addressOption: {
        paddingVertical: scaleFont(10),
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    addressOptionText: {
        fontSize: scaleFont(16),
        color: '#333',
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleFont(10),
        marginTop: scaleFont(10),
    },
    addAddressText: {
        fontSize: scaleFont(16),
        color: '#007AFF',
        marginLeft: scaleFont(5),
    },
    closeButton: {
        marginTop: scaleFont(10),
        alignItems: 'center',
        padding: scaleFont(10),
        backgroundColor: '#ccc',
        borderRadius: scaleFont(5),
    },
    noAddressesText: {
        fontSize: scaleFont(16),
        color: '#555',
        textAlign: 'center',
        marginVertical: scaleFont(10),
    },
});

export default AddressBar;
