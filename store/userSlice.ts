// store/userSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Define the initial state using TypeScript interfaces
interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}


interface UserState {
    password: string;
    phoneNumber: string;
    selectedCode: string;
    email: string;
    name_surname: string;
    passwordLogin: boolean; // New field
    verificationCode: string; // New field
    step: "send_code" | "verify_code" | "skip_verification";  // New field
    login_type: "email" | "phone_number";  // New field
    cart: CartItem[];
    addresses: string[];
    currentAddress: string | null;
    loading: boolean;  // Keep loading and error states for later use
    error: string | null;
}

const initialState: UserState = {
    phoneNumber: '',
    password: '',
    selectedCode: '+90',
    email: '',
    name_surname: '',
    passwordLogin: false,
    verificationCode: '',
    step: 'send_code', // Default
    login_type: 'email', // Default
    cart: [],
    addresses: [],
    currentAddress: null,
    loading: false,
    error: null,
};


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Synchronous actions
        setSelectedCode(state, action: PayloadAction<string>) {
            state.selectedCode = action.payload;
        },
        setPhoneNumber(state, action: PayloadAction<string>) {
            state.phoneNumber = action.payload.replace(/[^0-9]/g, '').slice(0, 15);
            if (!state.phoneNumber && !state.email) {
                state.password = ''; // Clear password when both are empty
            }
        },
        setEmail(state, action: PayloadAction<string>) {
            state.email = action.payload;
            if (!state.phoneNumber && !state.email) {
                state.password = ''; // Clear password when both are empty
            }
        },
        setName(state, action: PayloadAction<string>) {
            state.name_surname = action.payload;
        },
        setStep(state, action: PayloadAction<"send_code" | "verify_code" | "skip_verification">) {
            state.step = action.payload;
        },
        setLoginType(state, action: PayloadAction<"email" | "phone_number">) {
            state.login_type = action.payload;
        },
        setPasswordLogin(state, action: PayloadAction<boolean>) {
            state.passwordLogin = action.payload;
        },
        setVerificationCode(state, action: PayloadAction<string>) {
            state.verificationCode = action.payload;
        },

        setPassword(state, action: PayloadAction<string>) { // Keep, but be cautious
            state.password = action.payload;
        },
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
        },
        addToCart(state, action: PayloadAction<CartItem>) {
            const existingItem = state.cart.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.cart.push(action.payload);
            }
        },
        removeFromCart(state, action: PayloadAction<string>) {
            state.cart = state.cart.filter(item => item.id !== action.payload);
        },
        clearCart(state) {
            state.cart = [];
        },
        addAddress(state, action: PayloadAction<string>) {
            if (!state.addresses.includes(action.payload)) {
                state.addresses.push(action.payload);
            }
        },
        removeAddress(state, action: PayloadAction<string>) {
            state.addresses = state.addresses.filter(address => address !== action.payload);
            if (state.currentAddress === action.payload) {
                state.currentAddress = null;
            }
        },
        setCurrentAddress(state, action: PayloadAction<string>) {
            if (state.addresses.includes(action.payload)) {
                state.currentAddress = action.payload;
            }
        },

        logout(state) {
            state.phoneNumber = '';
            // ... reset other fields as needed
        },
    },
});


// Export actions for use in components
export const {
    setPhoneNumber,
    setSelectedCode,
    setEmail,
    setName,
    setPassword,
    setPasswordLogin,
    setVerificationCode,
    setStep,       // New
    setLoginType,  // New    // ... other actions
    setToken
} = userSlice.actions;

// Export the reducer
export default userSlice.reducer;

