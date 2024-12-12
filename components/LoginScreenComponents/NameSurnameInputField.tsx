import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {scaleFont} from "@/components/utils/ResponsiveFont";
import {useDispatch, useSelector} from 'react-redux';
import {setName} from '../../store/userSlice'; // Adjust the path as needed
import {RootState} from '../../store/store'; // Adjust the path as needed

const NameSurnameInputField: React.FC = () => {
    const dispatch = useDispatch();
    const fullName = useSelector((state: RootState) => state.user.name_surname); // Single name field from Redux

    const [inputValue, setInputValue] = useState<string>(fullName); // Local input state
    const [isTyping, setIsTyping] = useState<boolean>(inputValue.length > 0);

    useEffect(() => {
        // Sync with Redux store if it changes
        setInputValue(fullName);
    }, [fullName]);

    const handleTextChange = (text: string) => {
        // Remove any non-letter characters except for spaces
        const cleanedText = text.replace(/[^a-zA-Z\s]/g, '');
        setInputValue(cleanedText);

        if (cleanedText.length === 0) {
            setIsTyping(false);
            dispatch(setName(''));
        } else {
            setIsTyping(true);
            dispatch(setName(cleanedText)); // Update Redux store with a single string
        }
    };

    const handleClearText = () => {
        setInputValue('');
        setIsTyping(false);
        dispatch(setName(''));
    };

    return (
        <View>
            <View style={[styles.inputContainer, isTyping && {borderColor: 'gray'}]}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"

                    value={inputValue}
                    onChangeText={handleTextChange}
                    onFocus={() => console.log("Name Input Focused")}
                    autoCapitalize="words"
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
    input: {
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

export default NameSurnameInputField;
