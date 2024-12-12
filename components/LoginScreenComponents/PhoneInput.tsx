// components/LoginScreenComponents/PhoneInput.tsx

import React, {useState} from 'react';
import {Dimensions, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {countryCodes} from '@/components/constants/countryCodes';
import {scaleFont} from "@/components/utils/ResponsiveFont";
import {useDispatch, useSelector} from 'react-redux';
import {setPhoneNumber, setSelectedCode} from '../../store/userSlice'; // Adjust the path as needed
import {RootState} from '../../store/store'; // Adjust the path as needed

const PhoneInput: React.FC = () => {
    const dispatch = useDispatch();

    // Access phoneNumber and selectedCode from Redux store
    const phoneNumber = useSelector((state: RootState) => state.user.phoneNumber);
    const selectedCode = useSelector((state: RootState) => state.user.selectedCode);

    // Local state for temporary country code selection and picker visibility
    const [tempCode, setTempCode] = useState<string>(selectedCode);
    const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(phoneNumber.length > 0);

    // Handle changes in phone number input
    const handleChangeText = (text: string) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        if (cleanedText.length <= 15) { // Enforce maximum of 15 characters
            dispatch(setPhoneNumber(cleanedText));
            setIsTyping(cleanedText.length > 0);
        }
    };

    // Handle clearing of phone number input
    const handleClearText = () => {
        dispatch(setPhoneNumber(''));
        setIsTyping(false);
    };

    // Handle confirmation of country code selection
    const handleConfirmSelection = () => {
        dispatch(setSelectedCode(tempCode));
        setIsPickerVisible(false);
    };

    // Render the country code selector button
    const renderCountryCodeSelector = () => (
        <TouchableOpacity onPress={() => setIsPickerVisible(true)} style={styles.countryCodeContainer}>
            <Text style={styles.countryCodeText}>{selectedCode}</Text>
        </TouchableOpacity>
    );

// Modify renderPicker
    const renderPicker = () => (
        <Picker
            selectedValue={tempCode}
            onValueChange={(itemValue) => setTempCode(itemValue)}
            style={[styles.picker]} // Add iOS-specific style
            itemStyle={{color: '#000', fontSize: 18}} // Set text color for iOS picker items
        >
            {countryCodes.map((item) => (
                <Picker.Item
                    key={item.code}
                    label={`${item.country} (${item.code})`}
                    value={item.code}
                    color="#000" // Ensure color is set for each item
                />
            ))}
        </Picker>
    );

    return (
        <View style={[
            styles.inputContainer,
            isTyping && {borderColor: 'gray'} // Change border color when typing
        ]}>
            {renderCountryCodeSelector()}
            <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="#999"

                onChangeText={handleChangeText}
                value={phoneNumber}
                keyboardType="phone-pad"
                maxLength={15} // Enforce maximum of 15 characters
            />
            {isTyping && (
                <TouchableOpacity onPress={handleClearText} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
            )}

            {/* Country Code Picker Modal */}
            {isPickerVisible && (
                <Modal visible={isPickerVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {renderPicker()}
                            <TouchableOpacity onPress={handleConfirmSelection} style={styles.confirmButton}>
                                <Text style={styles.confirmButtonText}>OK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsPickerVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

    },
    modalContainer: {
        width: Dimensions.get('window').width * 0.85,
        backgroundColor: '#fff',
        borderRadius: scaleFont(16),
        paddingVertical: scaleFont(20),
        paddingHorizontal: scaleFont(15),
        elevation: 5, // Android shadow
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    picker: {
        width: '100%',
        height: scaleFont(180),
        borderRadius: scaleFont(10),
        backgroundColor: '#F9F9F9',
        marginVertical: scaleFont(10),
    },

    confirmButton: {
        marginTop: scaleFont(10),
        backgroundColor: 'rgba(76,175,80,0.75)',
        paddingVertical: scaleFont(12),
        paddingHorizontal: scaleFont(20),
        borderRadius: scaleFont(8),
        width: '100%',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: scaleFont(18),
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: scaleFont(10),
        paddingVertical: scaleFont(12),
        paddingHorizontal: scaleFont(20),
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: scaleFont(8),
    },
    cancelButtonText: {
        color: 'rgba(0,0,0,0.82)',
        fontSize: scaleFont(18),
        fontWeight: '600',
    },
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
    countryCodeContainer: {
        paddingRight: scaleFont(10),
        paddingVertical: scaleFont(10),
        backgroundColor: 'transparent',
    },

    phoneInput: {

        flex: 1,
        fontSize: scaleFont(16),
        color: '#333',
        textAlignVertical: 'center',
        fontFamily: Platform.OS === 'android' ? 'Poppins' : 'Poppins-Regular',
        paddingVertical: scaleFont(10),
    },
    clearButton: {
        paddingHorizontal: scaleFont(10),
        paddingVertical: scaleFont(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryCodeText: {
        fontSize: scaleFont(16),
        color: '#333',
        fontWeight: '500',
    },
    clearButtonText: {
        color: '#999',
        fontSize: scaleFont(16),
    },
});

export default PhoneInput;
