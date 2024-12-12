import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { scaleFont } from "@/components/utils/ResponsiveFont";
import AddressBar from "@/components/afterloginComponents/AddressBar";
// import NotificationIcon from "@/components/afterloginComponents/NotificationIcon";
// import ProfileIcon from "@/components/afterloginComponents/ProfileIcon";

const { height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = screenHeight * scaleFont(0.14);

const Header = () => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.rowContainer}>
                {/* Left Section: AddressBar */}
                <View style={styles.leftContainer}>

                    <AddressBar />
                </View>

                {/* Right Section: Notification and Profile Icons */}
                <View style={styles.rightContainer}>

                    {/*<NotificationIcon />*/}
                    {/*<ProfileIcon />*/}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: HEADER_HEIGHT,
        backgroundColor: '#ffffff',
        justifyContent: 'flex-end', // Positions children towards the end
        paddingHorizontal: scaleFont(15),
        paddingBottom: HEADER_HEIGHT / scaleFont(15), // Adjusts padding to create a 3/4 positioning effect
        borderBottomRightRadius: scaleFont(15),
        borderBottomLeftRadius: scaleFont(15),
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    leftContainer: {
        //  borderWidth: 1,
        // height: scaleFont(60), // set this in addressbar.tsx

        width: scaleFont(100),

    },
    rightContainer: {
        borderWidth: 1,
        width: scaleFont(100),
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default Header;
