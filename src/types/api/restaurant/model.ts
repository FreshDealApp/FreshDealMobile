export interface Restaurant {
    id: number;
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
    rating: number | null;
    ratingCount: number;
    image_url: string | null;
    pickup: boolean;
    delivery: boolean;
    distance_km?: number | null;
    maxDeliveryDistance: number | null;
    deliveryFee: number | null;
    minOrderAmount: number | null;
    restaurantEmail?: string | null;
    restaurantPhone?: string | null;
    comments?: Comment[];
    flash_deals_available: boolean;
    flash_deals_count: number;
}

export interface Comment {
    id: number;
    content: string;
    rating: number;
    user_id: number;
    restaurant_id: number;
    created_at: string;
    user_name: string;
}