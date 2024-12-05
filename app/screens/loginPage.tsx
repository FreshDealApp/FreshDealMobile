import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import LoginButton from "@/components/LoginScreenComponents/loginButton";
import { useRouter } from 'expo-router';
import AppleOTP from "@/components/LoginScreenComponents/AppleOTPLogin";
import EmailLoginField from "@/components/LoginScreenComponents/emailInput";
import PhoneInput from '@/components/LoginScreenComponents/PhoneInput';
import { GoogleSignInButton, EmailSignInButton, PhoneSignInButton } from '@/components/LoginScreenComponents/loginButtons';
import {scaleFont} from "@/utils/ResponsiveFont";
import {UserModel} from "@/models/UserModel";import { useDispatch } from 'react-redux';
import { setUserDetails, setLocation } from '@/slices/userSlice';
import passwordInputSingleton from "@/components/LoginScreenComponents/passwordInputSingleton";
const LoginPage: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = UserModel.getInstance(); // Use the singleton instance here
    const passwordInputInstance = passwordInputSingleton.getInstance();
    const PasswordInput = passwordInputInstance.getComponent();

    const [phoneLogin, setPhoneLogin] = useState<boolean>(true);

    const handleLoginButton = (): void => {
        if (phoneLogin) {
            const phoneNumber = user.getPhoneNumber();
            const selectedCode = user.getSelectedCode();
            const password = user.getPassword(); // Fetch the password from the UserModel

            if (!phoneNumber) {
                Alert.alert('Error', 'Phone number cannot be empty.');
                return;
            }

            if (!user.isValidPhone()) {
                Alert.alert('Error', 'Please enter a valid phone number.');
                return;
            }

            if (!password) {
                Alert.alert('Error', 'Password cannot be empty.');
                return;
            }

            const loginData = {
                phoneNumber,
                selectedCode,
                password, // Include password in the login data
            };

            fetch('http://192.168.1.3:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('API Response:', data);
                    if (data.success && data.userData) {
                        user.setName(data.userData.name);
                        user.setSurname(data.userData.surname);
                        user.setEmail(data.userData.email);

                        dispatch(setUserDetails({
                            name: data.userData.name,
                            surname: data.userData.surname,
                            email: data.userData.email,
                            phoneNumber: data.userData.phoneNumber,
                        }));

                        if (data.userData.location) {
                            dispatch(setLocation(data.userData.location));
                        }
                        router.push('../screensAfterLogin/afterlogin');
                        Alert.alert('Success', 'Login successful!');
                    } else {
                        Alert.alert('Error', 'Login failed.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Alert.alert('Error', 'An error occurred during login.');
                });

        } else {
            handleEmailSubmit();
        }
    };

    function handleEmailSubmit(): void {
        Alert.alert('Info', 'Email login is not yet implemented.');
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.bottomContainer}>
                <Text style={styles.welcomeText}>Last Call,</Text>
                <Text style={styles.welcomeText2}>Tasty Deals Await!</Text>

                {phoneLogin ? (
                    <PhoneInput />
                ) : (
                    <EmailLoginField />
                )}
                <PasswordInput></PasswordInput>
                <View style={{ flexDirection: 'row', marginTop: scaleFont(10), marginBottom: scaleFont(0), justifyContent: 'space-between' }}>
                    <View style={{ flex: 0.5, marginRight: scaleFont(5) }}>
                        <LoginButton onPress={() => router.push('./RegisterPage')} title={'Sign in'} />
                    </View>
                    <View style={{ flex: 0.5, marginLeft: scaleFont(5) }}>
                        <LoginButton onPress={handleLoginButton} />
                    </View>
                </View>

                <View style={styles.registerContainer}>
                    <View style={{ marginVertical: scaleFont(20), alignItems: 'center', flexDirection: 'row' }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                        <Text style={{ marginHorizontal: scaleFont(10), fontSize: scaleFont(16), color: '#666' }}>or with</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                    </View>
                </View>

                <AppleOTP />
                <GoogleSignInButton />

                {phoneLogin ? (
                    <TouchableOpacity onPress={() => setPhoneLogin(false)}>
                        <EmailSignInButton />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => setPhoneLogin(true)}>
                        <PhoneSignInButton />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    bottomContainer: {
        flex: 1,
        paddingHorizontal: scaleFont(35),
    },
    welcomeText: {
        fontSize: scaleFont(35),
        textAlign: 'center',
        color: '#000000',
        marginTop: scaleFont(20),
        marginBottom: scaleFont(5),
    },
    welcomeText2: {
        fontSize: scaleFont(35),
        textAlign: 'center',
        marginBottom: scaleFont(20),
        color: '#50703C',
    },
    message: {
        marginTop: scaleFont(10),
        textAlign: 'center',
        color: '#fff',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    registerText: {
        fontFamily: 'Poppins-Regular',
        fontSize: scaleFont(18),
        color: '#000',
        verticalAlign: 'middle',
    },
    registerTextClick: {
        fontFamily: 'Poppins-Regular',
        fontSize: scaleFont(18),
        color: '#23b3e8',
        verticalAlign: 'middle',
    },
});

export default LoginPage;
