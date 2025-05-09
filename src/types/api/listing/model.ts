// src/types/api/listing/model.ts
export interface Listing {
    id: number;
    restaurant_id: number;
    title: string;
    description: string;
    image_url: string;
    count: number;
    original_price: number | null;
    pick_up_price: number | null;
    delivery_price: number | null;
    consume_within: number | null;
    available_for_pickup: boolean | null;
    available_for_delivery: boolean | null;
    fresh_score: number;
}