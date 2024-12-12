import React, {useState} from 'react';
import {Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {scaleFont} from "@/components/utils/ResponsiveFont";
import {useDispatch} from "react-redux";
import {setPassword} from "@/store/userSlice"; // Redux action to set the password

const PasswordInput: React.FC<{ password: string }> = ({password}) => {
    const dispatch = useDispatch();
    const [isTyping, setIsTyping] = useState<boolean>(password.length > 0); // Track if user is typing

    // Handle changes in the password input
    const handlePasswordChange = (value: string) => {
        dispatch(setPassword(value)); // Update password in Redux
        setIsTyping(value.length > 0); // Set typing state based on input length
    };

    // Clear the password input
    const handleClearPassword = () => {
        dispatch(setPassword('')); // Clear Redux state
        setIsTyping(false); // Update typing state
    };

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={handlePasswordChange} // Update input on text change
                autoCapitalize="none"
            />
            {isTyping && (
                <TouchableOpacity onPress={handleClearPassword} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginTop: scaleFont(10),
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: scaleFont(16),
        paddingHorizontal: scaleFont(15),
        backgroundColor: '#fff',
        width: '100%',
        height: scaleFont(50),
    },
    passwordInput: {
        flex: 1,
        fontSize: scaleFont(16),
        color: '#333',
        fontFamily: Platform.OS === 'android' ? 'Poppins' : 'Poppins-Regular',
        paddingVertical: scaleFont(10),
        
    },
    clearButton: {
        paddingHorizontal: scaleFont(10),
        paddingVertical: scaleFont(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#999',
        fontSize: scaleFont(16),
    },
});

export default PasswordInput;
