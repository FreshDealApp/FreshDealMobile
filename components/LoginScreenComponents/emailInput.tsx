// components/LoginScreenComponents/EmailLoginField.tsx

import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {scaleFont} from "@/components/utils/ResponsiveFont";
import {useDispatch, useSelector} from 'react-redux';
import {setEmail} from '../../store/userSlice'; // Adjust the path as needed
import {RootState} from '../../store/store'; // Adjust the path as needed

const EmailLoginField: React.FC = () => {
    const dispatch = useDispatch();
    const email = useSelector((state: RootState) => state.user.email);
    const phoneNumber = useSelector((state: RootState) => state.user.phoneNumber);

    const [isTyping, setIsTyping] = useState<boolean>(!!email);

    const handleEmailChange = (text: string) => {
        dispatch(setEmail(text));

        if (text.length === 0) {
            setIsTyping(false);
        } else {
            setIsTyping(true);
        }

        // PasswordInput visibility is handled in RegisterScreen
    };

    const handleClearText = () => {
        dispatch(setEmail(''));
        setIsTyping(false);
    };

    return (
        <View>
            <View style={[styles.inputContainer, isTyping && {borderColor: 'gray'}]}>
                <TextInput
                    style={styles.inputText}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={handleEmailChange}
                    onFocus={() => console.log("Email Input Focused")}
                />
                {isTyping && (
                    <TouchableOpacity onPress={handleClearText} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>X</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
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
    inputText: {

        marginLeft: scaleFont(10),
        flex: 1,
        fontSize: scaleFont(17),
        color: '#1a1818',
        fontFamily: 'Poppins-Regular',
    },
    clearButton: {
        paddingHorizontal: scaleFont(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#999',
        fontSize: scaleFont(16),
    },
});

export default EmailLoginField;
