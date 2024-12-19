import React from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '@/store/store';
import {Feather} from '@expo/vector-icons'; // For the gear icon
import {useRouter} from 'expo-router';

const AccountScreen: React.FC = () => {
    const {name_surname, email, phoneNumber} = useSelector((state: RootState) => state.user);
    const router = useRouter();

    // Function to handle password reset
    const handlePasswordReset = () => {
        Alert.alert(
            'Reset Password',
            'Are you sure you want to reset your password?',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Yes', onPress: () => console.log('Password reset initiated')},
            ]
        );
    };

    // Function to navigate to Edit Information
    const handleEditInfo = () => {
        router.push('/screens/tabs/account/editAccountInformation'); // Replace with your edit screen route
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar with Gear Icon */}
                <View style={styles.topBar}>
                    <Text style={styles.title}>Account</Text>
                    <TouchableOpacity onPress={handleEditInfo}>
                        <Feather name="settings" size={24} color="black"/>
                    </TouchableOpacity>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <Image
                        source={{uri: 'https://via.placeholder.com/100'}} // Replace with actual PFP
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>{name_surname}</Text>
                </View>

                {/* User Information */}
                <View style={styles.infoSection}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoTitle}>Email</Text>
                        <Text style={styles.infoText}>{email || 'No email provided'}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoTitle}>Phone Number</Text>
                        <Text style={styles.infoText}>{phoneNumber || 'No phone number provided'}</Text>
                    </View>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
        color: '#333',
    },
    infoSection: {
        width: '100%',
    },
    infoItem: {
        marginBottom: 15,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    infoText: {
        fontSize: 14,
        color: '#333',
    },
    resetButton: {
        marginTop: 30,
        backgroundColor: '#50703C',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AccountScreen;
