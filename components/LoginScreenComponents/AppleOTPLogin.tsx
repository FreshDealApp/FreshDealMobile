import * as AppleAuthentication from "expo-apple-authentication";
import {Alert, Platform, StyleSheet, View} from "react-native";
import React from "react";
import {scaleFont} from "@/components/utils/ResponsiveFont";

interface AppleOTPProps {
    onSuccess?: (user: string) => void; // Optional success callback
}

const AppleOTP: React.FC<AppleOTPProps> = ({onSuccess}) => {
    if (Platform.OS === 'ios') {
        return (

            <View style={styles.container}>
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={16}
                    style={styles.appleButton}
                    onPress={async () => {
                        try {
                            const credential = await AppleAuthentication.signInAsync({
                                requestedScopes: [
                                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                                ],
                            });
                            Alert.alert('Apple Sign-In Success', `User: ${credential.user}`);
                            onSuccess ? onSuccess(credential.user) : null; // Call success callback if provided
                        } catch (e: any) {
                            if (e.code === 'ERR_CANCELED') {
                                Alert.alert('Sign-In Canceled', 'You canceled the sign-in process.');
                            } else {
                                Alert.alert('Error', 'Apple Sign-In failed');
                            }
                        }
                    }}
                />
            </View>
        );
    }


};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: scaleFont(10), // Adjust vertical spacing as needed
    },
    appleButton: {
        height: 50,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
    },
});

export default AppleOTP;
