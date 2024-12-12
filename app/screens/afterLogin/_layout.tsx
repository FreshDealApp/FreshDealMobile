import React from 'react';
import Header from "@/components/afterloginComponents/Header";
import {Slot} from 'expo-router';
import {useSelector} from 'react-redux'; // Import for accessing Redux state
import {RootState} from '@/store/store';
import AddressSelectionScreen from "@/app/screens/afterLogin/addressSelectionScreen"; // Adjust path as needed

const Layout = () => {
    // Access user addresses from the Redux state
    const addresses = useSelector((state: RootState) => state.user.addresses);

    return (
        <>
            {addresses && addresses.length > 0 ? (
                <>
                    <Header/>
                    <Slot/>
                </>
            ) : (
                <>
                    <AddressSelectionScreen/>
                    {/*<AfterLoginScreen/>*/}
                </>

            )}
        </>
    );
};

export default Layout;
