export interface CreatePurchaseOrderData {
    is_delivery: boolean;         // required, default false
    delivery_notes?: string;      // optional, used for both pickup and delivery notes
    delivery_address?: string;    // required if is_delivery is true
    flashdealsactivated?: boolean; // optional, whether to use flash deals
}