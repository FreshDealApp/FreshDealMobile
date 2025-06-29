// addressSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {addAddressAsync, deleteAddressAsync, setPrimaryAddress} from "@/src/redux/thunks/addressThunks";
import {AddressState} from "@/src/types/states";
import {Address} from "@/src/types/api/address/model";
import {UserDataResponse} from "@/src/types/api/user/responses"; // Corrected import path

const initialState: AddressState = {
    addresses: [],
    selectedAddressId: null,
    loading: false,
    error: null,
};

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        addAddress(state, action: PayloadAction<Address>) {
            state.addresses.push(action.payload);
            if (action.payload.is_primary) {
                state.selectedAddressId = action.payload.id;
            }
        },
        removeAddress(state, action: PayloadAction<string>) {
            state.addresses = state.addresses.filter((address) => address.id !== action.payload);
            if (state.selectedAddressId === action.payload) {
                // Find a primary address to select instead
                const primaryAddress = state.addresses.find(addr => addr.is_primary);
                state.selectedAddressId = primaryAddress?.id || null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase('user/logout', () => {
                return initialState;
            })
            .addCase(addAddressAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAddressAsync.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addAddressAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to add address';
            })
            .addCase('user/getUserData/fulfilled', (state, action: PayloadAction<UserDataResponse>) => {
                console.error("state addresses before" + state.addresses);
                state.addresses = action.payload.user_address_list.map((address: any) => ({
                    id: address.id.toString(),
                    title: address.title,
                    longitude: address.longitude,
                    latitude: address.latitude,
                    street: address.street,
                    neighborhood: address.neighborhood,
                    district: address.district,
                    province: address.province,
                    country: address.country,
                    postalCode: address.postalCode.toString(),
                    apartmentNo: address.apartmentNo ? address.apartmentNo.toString() : null,
                    doorNo: address.doorNo ? address.doorNo.toString() : null,
                    is_primary: Boolean(address.is_primary),
                }));
                console.log("state addresses after" + state.addresses);

                console.error('Selected address ID before:', state.selectedAddressId);

                const primaryAddress = state.addresses.find(addr => addr.is_primary);
                if (primaryAddress) {
                    state.selectedAddressId = primaryAddress.id;
                    console.log('Selected address ID after:', state.selectedAddressId);
                }
            })
            .addCase(setPrimaryAddress.pending, (state) => {
                console.log('Redux State - primary address pending');
                state.loading = true;
                state.error = null;
            })
            .addCase(setPrimaryAddress.fulfilled, (state, action: PayloadAction<Address>) => {
                console.log('Redux State - Updated Primary Address:', action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(setPrimaryAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to set primary address';
            })
            .addCase(deleteAddressAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddressAsync.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteAddressAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete address';
            });
    },
});

export const {addAddress, removeAddress} = addressSlice.actions;

export default addressSlice.reducer;
