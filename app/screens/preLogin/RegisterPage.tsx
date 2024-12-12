import React from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import LoginButton from "../../../components/LoginScreenComponents/loginButton";
import {scaleFont} from "@/components/utils/ResponsiveFont";
import EmailLoginField from "@/components/LoginScreenComponents/emailInput";
import PhoneInput from "../../../components/LoginScreenComponents/PhoneInput";
import {useRouter} from "expo-router";
import NameSurnameInputField from "../../../components/LoginScreenComponents/NameSurnameInputField";
import PasswordInput from "@/components/LoginScreenComponents/passwordInput";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../store/store";
import {registerUser} from "../../../store/thunks/userThunks"; // Assuming you have a thunk

const RegisterScreen: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const {
        password,
        name_surname,
        phoneNumber,
        selectedCode,
        email,
        loading,
        error,
    } = useSelector((state: RootState) => state.user);


    const SUCCESS_MESSAGE = "Registration completed!";
    const SUCCESS_ROUTE = "./screens/preLogin/LoginPage";

    const validateInput = (): boolean => {
        if (!name_surname) {
            Alert.alert("Error", "Name and surname are required.");
            return false;
        }
        if (!email && !phoneNumber) {
            Alert.alert("Error", "Email or phone number is required.");
            return false;
        }
        if (!password) {
            Alert.alert("Error", "Password is required.");
            return false;
        }
        return true;
    };
    const handleRegister = async (): Promise<void> => {
        console.log("register button pressed")
        if (!validateInput()) return;
        console.log("input validated")
        try {
            await dispatch(
                registerUser({
                    name_surname,
                    email,
                    phone_number: phoneNumber,
                    password,
                })
            ).unwrap();

            Alert.alert("Success", SUCCESS_MESSAGE);
            router.push(SUCCESS_ROUTE);
        } catch (error: any) {
            Alert.alert("Registration Failed", error.message || "An error occurred");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.inputArea}>
                        <NameSurnameInputField/>
                    </View>
                    <View style={styles.inputArea}>
                        <PhoneInput/>
                    </View>
                    <View style={styles.inputArea}>
                        <EmailLoginField/>
                    </View>
                    {(email || phoneNumber) && (
                        <View style={styles.inputArea}>
                            <PasswordInput password={password}/>
                        </View>
                    )}

                    <View style={styles.buttonArea}>
                        <View style={styles.backButton}>
                            <LoginButton onPress={() => router.back()} title="<"/>
                        </View>
                        <View style={styles.SignupButton}>
                            <LoginButton onPress={handleRegister} title="Sign up"/>
                        </View>
                    </View>

                    {loading && <ActivityIndicator size="large" color="#0000ff"/>}
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "flex-start",
        paddingHorizontal: scaleFont(35),
        paddingTop: scaleFont(35),
    },
    inputArea: {
        marginBottom: scaleFont(15),
    },
    buttonArea: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    backButton: {
        flex: 1,
    },
    SignupButton: {
        flex: 4,
        marginLeft: scaleFont(10),
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: scaleFont(10),
    },
});

export default RegisterScreen;
