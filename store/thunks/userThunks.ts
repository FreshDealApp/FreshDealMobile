import {createAsyncThunk} from '@reduxjs/toolkit';
import {loginUserAPI, registerUserAPI} from '@/api/userAPI';

// Thunk for login with all possible fields
export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (
        payload: {
            email?: string;
            phone_number?: string;
            password?: string;
            verification_code?: string;
            step?: "send_code" | "verify_code" | "skip_verification";
            login_type?: "email" | "phone_number";
            password_login?: boolean;
        },
        {rejectWithValue}
    ) => {
        console.log('loginUser thunk initiated with payload:', payload); // Log input payload
        try {
            const data = await loginUserAPI(payload);
            console.log('loginUserAPI response:', data); // Log successful response
            return data; // Return API response
        } catch (error: any) {
            console.error('loginUserAPI error:', error); // Log error details
            console.error('Error response data:', error.response?.data); // Log API error response if available
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (
        userData: {
            name_surname: string;
            email?: string;
            phone_number?: string;
            password: string;
        },
        {rejectWithValue}
    ) => {
        console.log('registerUser thunk initiated with payload:', userData);
        try {
            const data = await registerUserAPI(userData);
            console.log('registerUserAPI successful response:', data);
            return data;
        } catch (error: any) {
            console.error('registerUserAPI error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });
            return rejectWithValue(
                error.response?.data || 'Network Error or API failure'
            );
        }
    }
);
