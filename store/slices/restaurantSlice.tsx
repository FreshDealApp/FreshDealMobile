import {createSlice} from '@reduxjs/toolkit';
import {getRestaurantsByProximity} from "@/store/thunks/restaurantThunks";
import {logout} from "@/store/slices/userSlice";

export interface Restaurant {
    id: string;
    owner_id: number;
    restaurantName: string;
    restaurantDescription: string;
    longitude: number;
    latitude: number;
    category: string;
    workingDays: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
    listings: number;
    rating: number;
    ratingCount: number;
    distance_km: number;
    image_url: string;
    pickup: boolean;
    delivery: boolean;
    maxDeliveryDistance: number; // in radius
    deliveryFee: number;
    minOrderAmount: number;

}

export interface RestaurantCreateResponse {
    success: boolean;
    message: string;
    image_url?: string;
}

interface RestaurantState {
    restaurantsProximity: Restaurant[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    loading: boolean;
}

const initialState: RestaurantState = {
    restaurantsProximity: [],
    status: 'idle',
    error: null,
    loading: false,
};

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(logout, () => initialState) // Reset state on global action

            .addCase(getRestaurantsByProximity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.loading = true;

            })
            .addCase(getRestaurantsByProximity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                console.log(action.payload);
                state.restaurantsProximity = action.payload;
            })
            .addCase(getRestaurantsByProximity.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;

                state.error = action.payload || 'Failed to fetch restaurants';
            });
    },
});

export default restaurantSlice.reducer;
