import {Address} from "@/src/types/api/address/model";
import {Comment, Restaurant} from "@/src/types/api/restaurant/model";
import {Listing} from "@/src/types/api/listing/model";
import {CartItem} from "@/src/types/api/cart/model";
import {Purchase} from "@/src/types/api/purchase/model";
import {Notification} from "@/src/types/api/notification/model";

export interface UserState {
    email: string;
    name_surname: string;
    phoneNumber: string;
    selectedCode: string;
    password: string;
    passwordLogin: boolean;
    verificationCode: string;
    step: 'send_code' | 'verify_code';
    login_type: 'email' | 'phone_number';
    token: string | null;
    loading: boolean;
    error: string | null;
    role: 'customer' | 'business_owner' | 'admin';
    email_verified: boolean;
    isInitialized: boolean;
    shouldNavigateToLanding: boolean;
    isAuthenticated: boolean;
    foodSaved: number;
    moneySaved: number;
    achievements: Achievement[];
    achievementsLoading: boolean;
    totalDiscountEarned: number;
    userId: number;
    rank: number;
    totalDiscount: number;
    rankings: Ranking[];
    rankLoading: boolean;
    rankingsLoading: boolean;
}

export interface RestaurantState {
    restaurantsProximity: Restaurant[];
    restaurantsProximityStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    restaurantsProximityLoading: boolean;
    favoriteRestaurantsIDs: number[];
    favoritesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    favoritesLoading: boolean;
    radius: number;
    error: string | null;
    selectedRestaurant: Restaurant;
    selectedRestaurantListings: Listing[];
    selectedRestaurantListing: Listing;
    listingsLoading: boolean;
    listingsError: string | null;
    isPickup: boolean;
    pagination: Pagination | null;
    commentAnalysis: CommentAnalysis | null;
    commentAnalysisLoading: boolean;
    commentAnalysisError: string | null;
    recentRestaurantIDs: number[];
    recentRestaurantsLoading: boolean;
    recentRestaurantsError: string | null;
    comments: Comment[];
    commentsLoading: boolean;
    commentsError: string | null;
    flashDealsRestaurants: Restaurant[];
    flashDealsLoading: boolean;
    flashDealsError: string | null;
}

export interface AddressState {
    addresses: Address[];
    addressesLoading: boolean;
    addressesError: string | null;
    creatingAddress: boolean;
    createAddressError: string | null;
    updatingAddress: boolean;
    updateAddressError: string | null;
    deletingAddress: boolean;
    deleteAddressError: string | null;
    selectedAddressId: number | null;
}

export interface CartState {
    cartItems: CartItem[];
    isPickup: boolean;
    cartTotal: number;
    count: number;
    loading: boolean;
    error: string | null;
}

export interface PurchaseState {
    activeOrders: Purchase[];
    loadingActiveOrders: boolean;
    activeOrdersError: string | null;

    previousOrders: Purchase[];
    loadingPreviousOrders: boolean;
    previousOrdersError: string | null;
    previousOrdersPagination: {
        currentPage: number;
        totalPages: number;
        perPage: number;
        totalOrders: number;
        hasNext: boolean;
        hasPrev: boolean;
    };

    currentOrder: Purchase | null;
    loadingCurrentOrder: boolean;
    currentOrderError: string | null;

    creatingPurchase: boolean;
    createPurchaseError: string | null;
    lastCreatedPurchases: Purchase[] | null;

    restaurantPurchases: Purchase[];
    loadingRestaurantPurchases: boolean;
    restaurantPurchasesError: string | null;
}

export interface SearchState {
    searchResults: {
        results: any[];
    };
    loading: boolean;
    error: string | null;
}

export interface NotificationState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
    registrationToken: string | null;
    registrationLoading: boolean;
    registrationError: string | null;
    permissionGranted: boolean;
}

export interface ReportState {
    reports: any[];
    reportLoading: boolean;
    error: string | null;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
}

export interface Achievement {
    id: number;
    name: string;
    description: string;
    image_url: string | null;
    acquired: boolean;
    acquired_at: string | null;
}

export interface Ranking {
    user_id: number;
    name: string;
    total_discount_earned: number;
    rank: number;
}

export interface CommentAnalysis {
    key_positives: string[];
    key_negatives: string[];
}