import React, {useCallback, useState} from 'react';
import {
    LayoutAnimation,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    UIManager,
    View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeCardView from '@/app/features/homeScreen/screens/HomeCardView';
import HomeMapView from '@/app/features/homeScreen/screens/HomeMapView';
import AccountScreen from '@/app/features/accountDetails/components/accountScreen';
import Header from '@/app/features/homeScreen/components/Header';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCROLL_THRESHOLD = 50;
const Tab = createBottomTabNavigator();

const HomeScreen: React.FC = () => {
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const insets = useSafeAreaInsets(); // Get safe area insets

    // Reset header position when switching tabs
    const handleTabChange = (routeName: string) => {
        setIsHeaderVisible(routeName !== 'Account');
        if (routeName === 'HomeCardView') {
            setIsHeaderCollapsed(false); // Reset collapsed state
        }
    };

    // Handle scroll events
    const handleScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const currentOffsetY = e.nativeEvent.contentOffset.y;
            const shouldCollapseHeader = currentOffsetY > SCROLL_THRESHOLD;

            if (shouldCollapseHeader !== isHeaderCollapsed) {
                LayoutAnimation.configureNext({
                    duration: 200,
                    update: {type: LayoutAnimation.Types.easeInEaseOut},
                });
                setIsHeaderCollapsed(shouldCollapseHeader);
            }
        },
        [isHeaderCollapsed],
    );

    return (
        <View style={[styles.container, {paddingTop: insets.top}]}>
            {isHeaderVisible && <Header isScrolled={isHeaderCollapsed}/>}

            <View style={styles.contentContainer}>
                <Tab.Navigator
                    screenListeners={{
                        state: (e) => {
                            const routeName = e.data.state?.routes[e.data.state.index]?.name;
                            handleTabChange(routeName);
                        },
                    }}
                    screenOptions={({route}) => ({
                        headerShown: false,
                        tabBarIcon: ({focused, color}) => {
                            const iconMap = {
                                HomeCardView: focused ? 'home' : 'home-outline',
                                HomeMapView: focused ? 'map' : 'map-outline',
                                Account: focused ? 'person' : 'person-outline',
                            };
                            return <Ionicons name={iconMap[route.name]} size={20} color={color}/>;
                        },
                        tabBarActiveTintColor: '#007AFF',
                        tabBarInactiveTintColor: '#8e8e8e',
                    })}
                >
                    <Tab.Screen name="HomeCardView" options={{tabBarLabel: 'Home'}}>
                        {() => <HomeCardView onScroll={handleScroll}/>}
                    </Tab.Screen>
                    <Tab.Screen name="HomeMapView" component={HomeMapView} options={{tabBarLabel: 'Map'}}/>
                    <Tab.Screen name="Account" component={AccountScreen} options={{tabBarLabel: 'Account'}}/>
                </Tab.Navigator>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
    },
    contentContainer: {
        flex: 1,
    },
});

export default HomeScreen;
