import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    getFlashDealsThunk,
    getListingsThunk,
    getRecentRestaurantsThunk,
    getRestaurantBadgesThunk,
    getRestaurantCommentAnalysisThunk,
    getRestaurantCommentsThunk,
    getRestaurantsByProximity,
    getRestaurantThunk,
} from '@/src/redux/thunks/restaurantThunks';
import {addFavoriteThunk, getFavoritesThunk, removeFavoriteThunk,} from "@/src/redux/thunks/userThunks";
import {Pagination, RestaurantState} from "@/src/types/states";
import {Comment, Restaurant} from "@/src/types/api/restaurant/model"
import {Listing} from "@/src/types/api/listing/model";

const emptyRestaurant: Restaurant = {
    id: 0,
    owner_id: 0,
    restaurantName: '',
    restaurantDescription: '',
    longitude: 0,
    latitude: 0,
    category: '',
    workingDays: [],
    workingHoursStart: '',
    workingHoursEnd: '',
    listings: 0,
    rating: null,
    ratingCount: 0,
    image_url: null,
    pickup: false,
    delivery: false,
    distance_km: null,
    maxDeliveryDistance: null,
    deliveryFee: null,
    minOrderAmount: null,
    comments: [],
    badges: [],
    flash_deals_available: false,
    flash_deals_count: 0,
};

const EmptyListing: Listing = {
    id: 0,
    title: '',
    description: '',
    original_price: 0,
    pick_up_price: 0,
    delivery_price: 0,
    count: 0,
    restaurant_id: 0,
    image_url: '',
    available_for_delivery: false,
    available_for_pickup: false,
    consume_within: 0,
};

const initialState: RestaurantState = {
    restaurantsProximity: [],
    restaurantsProximityStatus: 'idle',
    restaurantsProximityLoading: false,
    favoriteRestaurantsIDs: [],
    favoritesStatus: 'idle',
    favoritesLoading: false,
    radius: 50,
    error: null,
    selectedRestaurant: emptyRestaurant,
    selectedRestaurantListings: [],
    selectedRestaurantListing: EmptyListing,
    listingsLoading: false,
    listingsError: null,
    isPickup: true,
    pagination: null,
    commentAnalysis: null,
    commentAnalysisLoading: false,
    commentAnalysisError: null,
    recentRestaurantIDs: [],
    recentRestaurantsLoading: false,
    recentRestaurantsError: null,
    comments: [],
    commentsLoading: false,
    commentsError: null,
    flashDealsRestaurants: [],
    flashDealsLoading: false,
    flashDealsError: null,
};

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {
        setRadius(state, action: PayloadAction<number>) {
            state.radius = action.payload;
        },
        setSelectedRestaurant(state, action: PayloadAction<Restaurant>) {
            state.selectedRestaurant = action.payload;
            if (state.isPickup && !state.selectedRestaurant.pickup && state.selectedRestaurant.delivery) {
                state.isPickup = false;
            } else if (!state.isPickup && !state.selectedRestaurant.delivery && state.selectedRestaurant.pickup) {
                state.isPickup = true;
            }
        },
        setDeliveryMethod(state, action: PayloadAction<boolean>) {
            state.isPickup = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase('user/logout', () => {
                return initialState;
            })
            .addCase(getRestaurantsByProximity.pending, (state) => {
                state.restaurantsProximityStatus = 'loading';
                state.restaurantsProximityLoading = true;
                state.error = null;
            })
            .addCase(getRestaurantsByProximity.fulfilled, (state, action) => {
                state.restaurantsProximityStatus = 'succeeded';
                state.restaurantsProximityLoading = false;
                state.restaurantsProximity = action.payload;
            })
            .addCase(getRestaurantsByProximity.rejected, (state, action) => {
                state.restaurantsProximityStatus = 'failed';
                state.restaurantsProximityLoading = false;
                Object.assign(state, initialState);
                state.error = action.payload || 'Failed to fetch restaurants';
            })
            .addCase(getFavoritesThunk.pending, (state) => {
                state.favoritesStatus = 'loading';
                state.favoritesLoading = true;
                state.error = null;
            })
            .addCase(getFavoritesThunk.fulfilled, (state, action) => {
                state.favoritesStatus = 'succeeded';
                state.favoritesLoading = false;
                state.favoriteRestaurantsIDs = action.payload.favorites;
            })
            .addCase(getFavoritesThunk.rejected, (state) => {
                state.favoritesStatus = 'failed';
                state.favoritesLoading = false;
            })
            .addCase(addFavoriteThunk.rejected, (state, action) => {
                state.error = action.payload || 'Failed to add to favorites';
            })
            .addCase(removeFavoriteThunk.rejected, (state, action) => {
                state.error = action.payload || 'Failed to remove from favorites';
            })
            .addCase(getListingsThunk.pending, (state) => {
                state.listingsLoading = true;
                state.listingsError = null;
            })
            .addCase(getListingsThunk.fulfilled,
                (state, action: PayloadAction<{ listings: Listing[]; pagination: Pagination }>) => {
                    state.listingsLoading = false;
                    state.selectedRestaurantListings = action.payload.listings;
                    state.pagination = action.payload.pagination;
                })
            .addCase(getListingsThunk.rejected, (state, action) => {
                state.listingsLoading = false;
                state.listingsError = action.payload as string;
            })
            .addCase(getRestaurantBadgesThunk.fulfilled, (state, action) => {
                if (state.selectedRestaurant) {
                    state.selectedRestaurant.badges = action.payload.badges;
                }
            })
            .addCase(getRestaurantThunk.fulfilled, (state, action: PayloadAction<Restaurant>) => {
                state.selectedRestaurant = action.payload;
            })
            .addCase(getRestaurantCommentAnalysisThunk.pending, (state) => {
                state.commentAnalysisLoading = true;
                state.commentAnalysisError = null;
            })
            .addCase(getRestaurantCommentAnalysisThunk.fulfilled, (state, action) => {
                state.commentAnalysisLoading = false;
                state.commentAnalysis = action.payload;
                state.commentAnalysisError = null;
            })
            .addCase(getRestaurantCommentAnalysisThunk.rejected, (state, action) => {
                state.commentAnalysisLoading = false;
                state.commentAnalysisError = action.payload as string;
            })
            .addCase(getRecentRestaurantsThunk.pending, (state) => {
                state.recentRestaurantsLoading = true;
                state.recentRestaurantsError = null;
            })
            .addCase(getRecentRestaurantsThunk.fulfilled, (state, action) => {
                state.recentRestaurantsLoading = false;
                state.recentRestaurantIDs = action.payload.restaurants;
            })
            .addCase(getRecentRestaurantsThunk.rejected, (state, action) => {
                state.recentRestaurantsLoading = false;
                state.recentRestaurantsError = action.payload as string;
            })
            .addCase(getRestaurantCommentsThunk.pending, (state) => {
                state.commentsLoading = true;
                state.commentsError = null;
            })
            .addCase(getRestaurantCommentsThunk.fulfilled, (state, action: PayloadAction<Comment[]>) => {
                state.commentsLoading = false;
                state.comments = action.payload;
                state.commentsError = null;
            })
            .addCase(getRestaurantCommentsThunk.rejected, (state, action) => {
                state.commentsLoading = false;
                state.commentsError = action.payload as string;
            })
            .addCase(getFlashDealsThunk.pending, (state) => {
                state.flashDealsLoading = true;
                state.flashDealsError = null;
            })
            .addCase(getFlashDealsThunk.fulfilled, (state, action) => {
                state.flashDealsLoading = false;
                state.flashDealsRestaurants = action.payload;
                state.flashDealsError = null;
            })
            .addCase(getFlashDealsThunk.rejected, (state, action) => {
                state.flashDealsLoading = false;
                state.flashDealsError = action.payload as string;
            });
    },
});

export const {
    setRadius,
    setSelectedRestaurant,
    setDeliveryMethod,
} = restaurantSlice.actions;

export const selectDeliveryMethod = (state: { restaurant: RestaurantState }) => ({
    isPickup: state.restaurant.isPickup,
});

export default restaurantSlice.reducer;