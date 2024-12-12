import {StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import React from 'react'
import {scaleFont} from '@/components/utils/ResponsiveFont';

interface LoginButtonProps {
    onPress: () => void;
    title?: string;
    children?: React.ReactNode; // in case if you add something inside later  
    style?: ViewStyle; // Add this line

}

const LoginButton: React.FC<LoginButtonProps> = ({
                                                     onPress,
                                                     title = 'Login',
                                                     children,
    
                                                 }) => {
    return (
        <TouchableOpacity style={[styles.button]} onPress={onPress}>
            <Text style={styles.buttonText}>
                {title}
                {children}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: scaleFont(50),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ACF283',
        borderRadius: scaleFont(16),
        paddingVertical: scaleFont(12),
        paddingHorizontal: scaleFont(24),
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: scaleFont(4),
        elevation: 5, // Android shadow
        alignSelf: 'center',
        marginVertical: scaleFont(8), // Added margin for spacing
    },
    buttonText: {
        color: '#000',
        fontSize: scaleFont(21),
    },
});

export default LoginButton;