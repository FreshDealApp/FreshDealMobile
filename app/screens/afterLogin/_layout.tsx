import React, {useState} from 'react';
import Header from "@/components/afterloginComponents/Header";
import {useSelector} from 'react-redux';
import {RootState} from '@/store/store';
import AddressSelectorScreen from "@/app/screens/addressScreen/addressSelectionScreen";
import AfterLoginScreen from "@/app/screens/afterLogin/afterlogin";
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AccountScreen from "@/app/screens/tabs/account/accountScreen";

const Layout = () => {
    const addresses = useSelector((state: RootState) => state.user.addresses);

    const [selectedTab, setSelectedTab] = useState<'main' | 'account'>('main');

    if (!addresses || addresses.length === 0) {
        return <AddressSelectorScreen/>;
    }

    const renderContent = () => {
        switch (selectedTab) {
            case 'main':
                return (
                    <View style={styles.screen}>
                        <Header/>
                        <AfterLoginScreen/>
                    </View>

                );

            case 'account':
                return (
                    <View style={styles.screen}>
                        <AccountScreen></AccountScreen>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <>

            <View style={styles.container}>
                {renderContent()}
            </View>

            <View style={styles.navbar}>
                <TouchableOpacity
                    style={[
                        styles.navItem,
                        selectedTab === 'main' && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedTab('main')}
                >
                    <Text>Main</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.navItem,
                        selectedTab === 'account' && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedTab('account')}
                >
                    <Text>Account</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    navItem: {
        padding: 10,
        alignItems: 'center',
    },
    selectedItem: {
        borderBottomWidth: 2,
        borderColor: '#50703C',
    },
    screen: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Layout;
