// screens/AfterLoginScreen.tsx

import React from 'react';
import {Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useRouter} from 'expo-router';
import {RootState} from '@/store/store'; // Adjust the path based on your project structure
import {scaleFont} from "@/components/utils/ResponsiveFont";

// Define the type for an address if it's an object
interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

const AfterLoginScreen: React.FC = () => {
    const router = useRouter();

    // Select addresses from Redux store
    const addresses = useSelector((state: RootState) => state.user.addresses) as unknown as Address[];

    // Handle navigation to address selection screen
    const handleAddressSelection = () => {
        router.push('./addressSelection'); // Ensure the path is correct based on your routing setup
    };

    // Render a single address item
    const renderAddressItem = ({item}: { item: Address }) => (
        <View style={styles.addressItem}>
            <Text style={styles.addressText}>{`${item.street}, ${item.city}, ${item.state} ${item.zipCode}`}</Text>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectAddress(item.id)}
            >
                <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
        </View>
    );

    // Handle selecting an address
    const handleSelectAddress = (addressId: string) => {
        // Dispatch an action or perform any necessary logic to set the selected address,
        // For example,
        // dispatch(setCurrentAddress(addressId));
        Alert.alert('Address Selected', `Address ID: ${addressId} has been selected.`);

        // Navigate to the desired screen after selection
        router.push('/home'); // Adjust the path as needed
    };

    return (
        <View style={styles.container}>
            {!addresses.length ? (
                <View style={styles.noAddressContainer}>
                    <Text style={styles.messageText}>No address found. Please select your address.</Text>
                    <Button title="Select Address" onPress={handleAddressSelection}/>
                </View>
            ) : (
                <View style={styles.addressListContainer}>
                    <Text style={styles.welcomeText}>Welcome back!</Text>
                    <Text style={styles.subText}>Your saved addresses:</Text>
                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => item.id}
                        renderItem={renderAddressItem}
                        contentContainerStyle={styles.listContent}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddressSelection}
                    >
                        <Text style={styles.addButtonText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: scaleFont(16),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    noAddressContainer: {
        alignItems: 'center',
    },
    messageText: {
        fontSize: scaleFont(18),
        marginBottom: scaleFont(20),
        color: '#333',
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: scaleFont(24),
        fontWeight: 'bold',
        marginBottom: scaleFont(10),
        color: '#000',
    },
    subText: {
        fontSize: scaleFont(16),
        marginBottom: scaleFont(20),
        color: '#555',
    },
    addressListContainer: {
        width: '100%',
        paddingHorizontal: scaleFont(20),
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
    addressText: {
        fontSize: scaleFont(16),
        color: '#333',
        flex: 1,
        marginRight: scaleFont(10),
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
    },
    addButtonText: {
        color: '#fff',
        fontSize: scaleFont(16),
    },
    listContent: {
        paddingBottom: scaleFont(20),
    },
});

export default AfterLoginScreen;
