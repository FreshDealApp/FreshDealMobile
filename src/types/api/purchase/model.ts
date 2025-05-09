export interface Purchase {
    purchase_id: number;
    user_id: number;
    listing_id: number;
    restaurant_id: number;
    listing_title?: string;
    quantity: number;
    total_price: string;
    formatted_total_price: string;
    purchase_date: string;
    status: string;
    is_active: boolean;
    is_delivery: boolean;
    is_flash_deal: boolean;
    address_title?: string;
    delivery_address?: string;
    delivery_district?: string;
    delivery_province?: string;
    delivery_country?: string;
    delivery_notes?: string;
    completion_image_url?: string;
    listing?: {
        id: number;
        title: string;
    };
    restaurant?: {
        id: number;
        name: string;
    };
    user?: {
        id: number;
        name: string;
    };
}