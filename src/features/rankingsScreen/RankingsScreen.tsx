import React, {useEffect} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@/src/utils/navigation';
import {AppDispatch} from '@/src/redux/store';
import {RootState} from '@/src/types/store';
import {getUserRankingsThunk} from '@/src/redux/thunks/userThunks';
import {UserRank} from "@/src/types/states";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RankingsScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();

    const {rankings, rankingsLoading, userId} = useSelector((state: RootState) => state.user);

    useEffect(() => {
        dispatch(getUserRankingsThunk());
    }, [dispatch]);

    const renderRankItem = ({item}: { item: UserRank }) => {
        const isCurrentUser = item.user_id === userId;
        const getMedalIcon = (rank: number) => {
            switch (rank) {
                case 1:
                    return {name: 'medal', color: '#FFD700'}; // Gold
                case 2:
                    return {name: 'medal', color: '#C0C0C0'}; // Silver
                case 3:
                    return {name: 'medal', color: '#CD7F32'}; // Bronze
                default:
                    return {name: 'medal-outline', color: '#50703C'}; // Default
            }
        };

        const {name, color} = getMedalIcon(item.rank);

        return (
            <View style={[
                styles.rankItem,
                isCurrentUser && styles.currentUserItem
            ]}>
                <View style={styles.rankNumberContainer}>
                    <MaterialCommunityIcons name={name} size={24} color={color}/>
                    <Text style={styles.rankNumber}>#{item.rank}</Text>
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user_name}</Text>
                    {isCurrentUser && (
                        <Text style={styles.currentUser}>(You)</Text>
                    )}
                </View>

                <View style={styles.discountContainer}>
                    <Text style={styles.discountAmount}>${item.total_discount.toFixed(2)}</Text>
                </View>
            </View>
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#333"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={styles.placeholder}/>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.rankHeaderText}>Rank</Text>
                    <Text style={styles.userHeaderText}>User</Text>
                    <Text style={styles.savingsHeaderText}>Savings</Text>
                </View>

                {rankingsLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#50703C"/>
                        <Text style={styles.loadingText}>Loading rankings...</Text>
                    </View>
                ) : (
                    rankings.length > 0 ? (
                        <FlatList
                            data={rankings}
                            renderItem={renderRankItem}
                            keyExtractor={item => item.user_id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="trophy-outline" size={64} color="#ccc"/>
                            <Text style={styles.emptyText}>No rankings available</Text>
                        </View>
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 8,
    },
    rankHeaderText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textAlign: 'left',
    },
    userHeaderText: {
        flex: 2,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    savingsHeaderText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textAlign: 'right',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
    },
    listContent: {
        paddingBottom: 16,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    currentUserItem: {
        backgroundColor: '#f0f9eb',
        borderWidth: 1,
        borderColor: '#50703C',
    },
    rankNumberContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 4,
    },
    userInfo: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
    },
    currentUser: {
        fontSize: 14,
        color: '#50703C',
        marginLeft: 8,
        fontStyle: 'italic',
    },
    discountContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    discountAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#50703C',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: '#666',
    },
});

export default RankingsScreen;