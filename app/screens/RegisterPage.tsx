import React from "react";
import { Alert, Keyboard, TouchableWithoutFeedback, View } from "react-native";
import LoginButton from "@/components/LoginScreenComponents/loginButton";
import { scaleFont } from "@/components/utils/ResponsiveFont";
import EmailLoginField from "@/components/LoginScreenComponents/emailInput";
import PhoneInput from "@/components/LoginScreenComponents/PhoneInput";
import { useRouter } from 'expo-router';
import NameSurnameField from "@/components/LoginScreenComponents/NameSurnameInputField";
import { UserModel } from "@/models/UserModel";
import PasswordInputSingleton from '../../components/LoginScreenComponents/passwordInputSingleton'; // Import your password input component
//
const RegisterScreen: React.FC = () => {
    const router = useRouter();
    const user = UserModel.getInstance(); // Use the singleton instance here
    const passwordInputInstance = PasswordInputSingleton.getInstance();
    const PasswordInput = passwordInputInstance.getComponent();

    const handleRegister = (): void => {
        const user = UserModel.getInstance();
        const userData = {
            name: user.getName(),
            surname: user.getSurname(),
            phoneNumber: user.getPhoneNumber(),
            selectedCode: user.getSelectedCode(),
            email: user.getEmail(),
            password: user.getPassword(), // Include the password
        };

        // Validate data before sending
        if (!userData.name || !userData.surname || !userData.phoneNumber || !userData.email || !userData.password) {
            Alert.alert('Error', 'Please fill in all the required fields.');
            return;
        }

        // Send data to backend as JSON
        fetch('http://192.168.1.3:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Alert.alert('Success', 'Registration successful!');
                    // Navigate to next screen
                } else {
                    Alert.alert('Error', data.message || 'Registration failed.');
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                Alert.alert('Error', 'A network error occurred. Please try again.');
            });
    };

    return (
        <>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <>
                    <View style={styles.container}>
                        <View style={styles.inputArea}>
                            <NameSurnameField />
                        </View>
                        <View style={styles.inputArea}>
                            <PhoneInput />
                        </View>
                        <View style={styles.inputArea}>
                            <EmailLoginField />
                        </View>
                        <View style={styles.inputArea}>
                            <PasswordInput />
                        </View>

                        <View style={styles.buttonArea}>
                            <View style={styles.backButton}>
                                <LoginButton
                                    onPress={() => router.back()}
                                    title='<'
                                />
                            </View>
                            <View style={styles.SignupButton}>
                                <LoginButton
                                    onPress={handleRegister} // Correct function call syntax
                                    title='Sign up'
                                />
                            </View>
                        </View>
                    </View>
                </>
            </TouchableWithoutFeedback>
        </>
    );
};

const styles = {
    container: {
        flex: 1,
        paddingTop: scaleFont(35),
        paddingHorizontal: scaleFont(35),
    },
    inputArea: {
        marginBottom: scaleFont(15),
    },
    buttonArea: {
        marginTop: scaleFont(35),
        padding: scaleFont(0),
        justifyContent: "space-between",
        flexDirection: 'row',
    },
    backButton: {
        flex: 1,
        marginBottom: scaleFont(10),
    },
    SignupButton: {
        flex: 4,
        marginLeft: scaleFont(10),
        marginBottom: scaleFont(10),
    },
    registerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
    },
    iconButtonContainer: {
        width: '20%',
        alignItems: 'center',
    },
    textButtonContainer: {
        flexGrow: 1,
    },
};

export default RegisterScreen;
