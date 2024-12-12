// screens/LoginPage.tsx

import React from 'react';
import {Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View,} from 'react-native';
import {useRouter} from 'expo-router';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/store/store'
import {scaleFont} from '@/components/utils/ResponsiveFont';
import LoginButton from '@/components/LoginScreenComponents/loginButton';
import AppleOTP from '@/components/LoginScreenComponents/AppleOTPLogin';
import EmailLoginField from '@/components/LoginScreenComponents/emailInput';
import PhoneInput from '@/components/LoginScreenComponents/PhoneInput';
import {
    EmailSignInButton,
    GoogleSignInButton,
    PhoneSignInButton,
} from '@/components/LoginScreenComponents/loginButtons';
import PasswordInput from "@/components/LoginScreenComponents/passwordInput";
import {loginUser} from '@/store/thunks/userThunks';
import {setLoginType, setPasswordLogin, setToken} from '@/store/userSlice';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Import all user fields from the userSlice
    const {
        phoneNumber,
        password,
        selectedCode,
        email,
        passwordLogin,
        verificationCode,
        step,
        login_type,
    } = useSelector((state: RootState) => state.user);


    React.useEffect(() => {
        if (passwordLogin) {
            handleLoginButton();
        }
    }, [passwordLogin]);
    // const handlePasswordChange = (value: string) => {
    //     dispatch(setPassword(value));
    // };

    /**
     * Handles the login button click.
     * Performs validation checks and dispatches the login request.
     * Resets `passwordLogin` state to `false` after the login attempt.
     */
    const handleLoginButton = async () => {
        console.log("login button pressed")
        console.log(passwordLogin)
        if (login_type == 'phone_number' && !phoneNumber) {
            Alert.alert('Error', 'Phone number is required.');
            return;
        }
        if (login_type == "email" && !email) {
            Alert.alert('Error', 'Email is required.');
            return;
        }
        if (passwordLogin) {
            if (passwordLogin) {
                // Password-based login
                if (!password) {
                    Alert.alert('Error', 'Password is required.');
                    return;
                }
                try {
                    const result = await dispatch(
                        loginUser({
                            email: email,
                            phone_number: phoneNumber,
                            password: password,
                            login_type: login_type,
                            password_login: true,
                        })
                    ).unwrap(); // Use unwrap() to handle fulfilled/rejected states
                    console.log("Login request successful", result);

                    // Navigate back if login is successful
                    if (result.success) { // Adjust based on your API response structure
                        dispatch(setToken(result.token));
                        router.push('../afterLogin/afterlogin');
                    } else {
                        Alert.alert("Login Failed", result.message || "Something went wrong.");
                    }
                } catch (error) {
                    console.error("Login failed", error);
                    Alert.alert("Error", "Failed to login. Please try again.");
                }
            }
        }
        if (!passwordLogin) {
            //TODO IMPLEMENT
            return
            // if (step === 'send_code') {
            //     // Send verification code
            //     if (login_type == 'phone_number' && !phoneNumber) {
            //         Alert.alert('Error', 'Phone number is required.');
            //         return;
            //     }
            //     if (login_type == "email" && !email) {
            //         Alert.alert('Error', 'Email is required.');
            //         return;
            //     }
            //
            //     dispatch(
            //         loginUser({
            //             step: 'send_code',
            //             login_type: login_type,
            //             phone_number: phoneNumber,
            //             email,
            //         })
            //     );
            // } else if (step === 'verify_code') {
            //     // Verify the code
            //     if (!verificationCode) {
            //         Alert.alert('Error', 'Verification code is required.');
            //         return;
            //     }
            //
            //     dispatch(
            //         loginUser({
            //             step: 'verify_code',
            //             login_type: login_type,
            //             phone_number: phoneNumber,
            //             email,
            //             verification_code: verificationCode,
            //         })
            //     );
            // } else {
            //     Alert.alert('Error', 'Invalid login state. Please try again.');
            // }
        }
        dispatch(setPasswordLogin(false));


    };
    const handleLoginTypeChange = (type: "email" | "phone_number") => {
        dispatch(setLoginType(type));
    };

// Monitor login_type changes
    React.useEffect(() => {
        console.log("Login type updated:", login_type);
    }, [login_type]);

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.bottomContainer}>
                <Text style={styles.welcomeText}>Last Call,</Text>
                <Text style={styles.welcomeText2}>Tasty Deals Await!</Text>

                {/* Input Fields */}
                {login_type == 'phone_number' ? <PhoneInput/> : <EmailLoginField/>}

                {/* Password Field */}
                {(phoneNumber || email) && <PasswordInput password={password}/>}

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    {/* Sign Up Button */}
                    {!phoneNumber && !email && (
                        <>
                            <View style={styles.buttonContainer}>
                                <LoginButton
                                    onPress={() => router.push('./RegisterPage')}
                                    title="Sign up"
                                />
                            </View>
                            <View style={styles.buttonContainer}>
                                <LoginButton
                                    onPress={handleLoginButton}
                                    title="Login"
                                />
                            </View>
                        </>


                    )}

                    {/* Login Button and Sign in without password */}
                    {(phoneNumber || email) && (
                        <View style={styles.loginContainer}>
                            {/*<View style={styles.buttonContainer}>*/}
                            <LoginButton
                                onPress={() => {
                                    dispatch(setPasswordLogin(true));
                                }}
                                title="Login"
                            />
                            {/*</View>*/}
                            {/*<View style={styles.buttonContainer}>*/}
                            {/*    <LoginButton*/}
                            {/*        onPress={() => {*/}
                            {/*            dispatch(setPasswordLogin(true));*/}
                            {/*            handleLoginButton();*/}
                            {/*        }}*/}
                            {/*        title="Passwordless Login"*/}

                            {/*    />*/}
                            {/*</View>*/}
                            <TouchableOpacity
                                style={styles.passwordlessLoginContainer}
                                onPress={() => {
                                    dispatch(setPasswordLogin(false));
                                }}
                            >
                                <Text style={styles.passwordlessLoginText}>Passwordless Login</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.registerContainer}>
                    <View style={styles.line}/>
                    <Text style={styles.orText}>or with</Text>
                    <View style={styles.line}/>
                </View>

                {/* Other Login Options */}
                <AppleOTP/>
                <GoogleSignInButton/>

                {/* Toggle Between Email and Phone Login */}
                {login_type == 'phone_number' ? (
                    <TouchableOpacity onPress={() => handleLoginTypeChange("email")}>
                        <EmailSignInButton/>
                    </TouchableOpacity>

                ) : (
                    <TouchableOpacity onPress={() => handleLoginTypeChange("phone_number")}>
                        <PhoneSignInButton/>
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
        justifyContent: 'flex-start',
        backgroundColor: '#f5f5f5',
    },
    welcomeText: {
        fontSize: scaleFont(35),
        textAlign: 'center',
        color: '#000000',
        marginTop: scaleFont(20),
    },
    welcomeText2: {
        fontSize: scaleFont(35),
        textAlign: 'center',
        marginBottom: scaleFont(20),
        color: '#50703C',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: scaleFont(10),
        justifyContent: 'space-between',
    },
    buttonContainer: {
        flex: 0.5,
        marginHorizontal: scaleFont(5),
    },
    loginContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',

    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: scaleFont(20),
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    orText: {
        marginHorizontal: scaleFont(10),
        fontSize: scaleFont(16),
        color: '#666',
    },
    signInWithoutPwd: {
        textAlign: 'center',
        color: '#50703C',
        fontSize: scaleFont(14),
        textDecorationLine: 'underline',
    },
    passwordlessLoginContainer: {
        marginTop: scaleFont(10),
        alignItems: 'center',
    },

    passwordlessLoginText: {
        fontSize: scaleFont(18),
        color: '#50703C',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },

});

export default LoginPage;