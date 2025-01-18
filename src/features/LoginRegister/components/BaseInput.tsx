// BaseInput.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {scaleFont} from "@/src/utils/ResponsiveFont";

interface BaseInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    showClearButton?: boolean;
}

const BaseInput: React.FC<BaseInputProps> = ({
                                                 value,
                                                 onChangeText,
                                                 placeholder,
                                                 leftIcon,
                                                 rightIcon,
                                                 secureTextEntry,
                                                 keyboardType = 'default',
                                                 autoCapitalize = 'none',
                                                 showClearButton = true
                                             }) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        Animated.timing(animatedLabel, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        transform: [{
            translateY: animatedLabel.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -scaleFont(24)]
            })
        }],
        fontSize: animatedLabel.interpolate({
            inputRange: [0, 1],
            outputRange: [scaleFont(16), scaleFont(12)]
        }),
        color: animatedLabel.interpolate({
            inputRange: [0, 1],
            outputRange: ['#999', '#50703C']
        })
    };

    return (
        <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View style={[
                styles.container,
                isFocused && styles.containerFocused
            ]}>
                {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

                <View style={styles.inputWrapper}>
                    <Animated.Text style={[styles.label, labelStyle]}>
                        {placeholder}
                    </Animated.Text>

                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        secureTextEntry={secureTextEntry}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        textContentType="oneTimeCode"
                        autoComplete="off"
                        autoCorrect={false}
                        spellCheck={false}
                        importantForAutofill="no"
                    />
                </View>

                {value && showClearButton && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={(e) => {
                            e.stopPropagation(); // Prevent the parent TouchableWithoutFeedback from handling the event
                            onChangeText('');
                        }}
                    >
                        <Text style={styles.clearButtonText}>×</Text>
                    </TouchableOpacity>
                )}

                {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: scaleFont(12),
        backgroundColor: '#FFFFFF',
        height: scaleFont(56),
        paddingHorizontal: scaleFont(16),
        marginTop: 16,
        // marginBottom: scaleFont(16),
    },
    containerFocused: {
        borderColor: '#50703C',
        shadowColor: '#50703C',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
        height: '100%', // Add this
    },
    input: {
        flex: 1, // Add this
        fontSize: scaleFont(16),
        color: '#1F2937',
        fontFamily: 'Poppins-Regular',
        padding: 0,
    },
    label: {
        position: 'absolute',
        left: 0,
        paddingHorizontal: scaleFont(4),
        backgroundColor: '#FFFFFF',
        fontFamily: 'Poppins-Regular',
        zIndex: 1,
    },
    iconContainer: {
        marginHorizontal: scaleFont(8),
    },
    clearButton: {
        padding: scaleFont(8),
        zIndex: 2,
    },
    clearButtonText: {
        color: '#9CA3AF',
        fontSize: scaleFont(20),
        fontWeight: '600',
    },
});

export default BaseInput;