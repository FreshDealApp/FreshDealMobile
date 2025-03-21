import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '@/src/redux/store';
import {Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {updateEmailThunk, updatePasswordThunk, updateUsernameThunk} from '@/src/redux/thunks/userThunks';
import {logout} from '@/src/redux/slices/userSlice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GoBackIcon} from '@/src/features/homeScreen/components/goBack';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@/src/utils/navigation';
import {RootState} from '@/src/types/store';

// Types
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Constants
const ACHIEVEMENTS = [
    {id: 1, name: 'First Save', icon: 'star', unlocked: true},
    {id: 2, name: 'Save Streak: 3 Days', icon: 'fire', unlocked: true},
    {id: 3, name: 'Big Spender', icon: 'dollar-sign', unlocked: false},
    {id: 4, name: 'Eco Warrior', icon: 'leaf', unlocked: false},
];

const AccountScreen: React.FC = () => {
    // Hooks
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();

    // Redux state
    const {
        name_surname,
        email,
        phoneNumber,
        moneySaved,
        foodSaved,
        loading
    } = useSelector((state: RootState) => state.user);

    // Local state
    const [isEditing, setIsEditing] = useState(false);
    const [editedValues, setEditedValues] = useState({
        name_surname,
        email,
        phoneNumber,
    });

    // Derived data
    const userLevel = Math.floor(foodSaved / 10) + 1;
    const progressToNextLevel = (foodSaved % 10) / 10;
    const streakDays = 5; // This would come from your state
    const environmentalImpact = {
        co2Saved: (foodSaved * 2.5).toFixed(1), // kg
        waterSaved: (foodSaved * 1000).toFixed(0), // liters
    };

    // Event handlers
    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    dispatch(logout());
                    navigation.navigate('Login');
                },
            },
        ]);
    };

    const handleCancel = () => {
        setEditedValues({name_surname, email, phoneNumber});
        setIsEditing(false);
    };

    const handlePasswordReset = () => {
        Alert.prompt(
            'Reset Password',
            'Enter your current password',
            async (oldPassword?: string) => {
                if (oldPassword) {
                    Alert.prompt(
                        'New Password',
                        'Enter your new password',
                        async (newPassword?: string) => {
                            if (newPassword) {
                                try {
                                    const resultAction = await dispatch(updatePasswordThunk({
                                        old_password: oldPassword,
                                        new_password: newPassword,
                                    }));
                                    if (updatePasswordThunk.fulfilled.match(resultAction)) {
                                        Alert.alert('Success', 'Password updated successfully');
                                    } else {
                                        Alert.alert('Error', resultAction.payload as string);
                                    }
                                } catch (error) {
                                    Alert.alert('Error', 'Failed to update password');
                                }
                            }
                        },
                        'secure-text'
                    );
                }
            },
            'secure-text'
        );
    };

    const handleEditInfo = async () => {
        if (isEditing) {
            Alert.alert('Save Changes', 'Do you want to save these changes?', [
                {text: 'Cancel', style: 'cancel', onPress: handleCancel},
                {
                    text: 'Save',
                    onPress: async () => {
                        const updates = [];
                        if (editedValues.name_surname !== name_surname) {
                            updates.push(dispatch(updateUsernameThunk({username: editedValues.name_surname})));
                        }
                        if (editedValues.email !== email) {
                            updates.push(dispatch(updateEmailThunk({old_email: email, new_email: editedValues.email})));
                        }

                        if (updates.length > 0) {
                            try {
                                const results = await Promise.all(updates);
                                const hasErrors = results.some((result) => result.type.endsWith('/rejected'));
                                if (!hasErrors) {
                                    Alert.alert('Success', 'Profile updated successfully');
                                    setIsEditing(false);
                                } else {
                                    Alert.alert('Error', 'Some updates failed. Please try again.');
                                }
                            } catch (error) {
                                Alert.alert('Error', 'Failed to update profile');
                            }
                        } else {
                            setIsEditing(false);
                        }
                    },
                },
            ]);
        } else {
            setIsEditing(true);
        }
    };

    const handleViewAchievements = () => {
        Alert.alert('Coming Soon', 'Achievements screen is under development');
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#50703C"/>
            </View>
        );
    }

    // Render components
    const renderHeader = () => (
        <View style={[styles.topBar, {paddingTop: insets.top}]}>
            <GoBackIcon/>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity onPress={handleEditInfo} style={styles.iconButton}>
                <Feather name={isEditing ? 'check' : 'edit-2'} size={24} color="#50703C"/>
            </TouchableOpacity>
        </View>
    );

    const renderProfileSection = () => (
        <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="food" size={40} color="#50703C"/>
                    <View style={styles.badge}>
                        <Feather name="award" size={16} color="#fff"/>
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{userLevel}</Text>
                    </View>
                </View>

                {isEditing ? (
                    <TextInput
                        style={[styles.userName, styles.input]}
                        value={editedValues.name_surname}
                        onChangeText={(text) => setEditedValues({...editedValues, name_surname: text})}
                        placeholder="Enter your name"
                    />
                ) : (
                    <Text style={styles.userName}>{name_surname}</Text>
                )}

                <View style={styles.levelContainer}>
                    <Text style={styles.levelLabel}>Level {userLevel}</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, {width: `${progressToNextLevel * 100}%`}]}/>
                    </View>
                    <Text style={styles.progressText}>
                        {Math.round(progressToNextLevel * 100)}% to Level {userLevel + 1}
                    </Text>
                </View>
            </View>

            <View style={styles.streakContainer}>
                <FontAwesome5 name="fire" size={20} color="#ff7700"/>
                <Text style={styles.streakText}>{streakDays} Day Streak!</Text>
            </View>

            <View style={styles.gamificationContainer}>
                <View style={styles.gamificationCard}>
                    <Text style={styles.gamificationLabel}>Money Saved</Text>
                    <Text style={styles.gamificationValue}>${moneySaved}</Text>
                </View>
                <View style={styles.gamificationCard}>
                    <Text style={styles.gamificationLabel}>Food Saved</Text>
                    <Text style={styles.gamificationValue}>{foodSaved}</Text>
                </View>
            </View>

            <View style={styles.impactContainer}>
                <Text style={styles.impactTitle}>Your Environmental Impact</Text>
                <View style={styles.impactStatsContainer}>
                    <View style={styles.impactStat}>
                        <FontAwesome5 name="cloud" size={24} color="#50703C"/>
                        <Text style={styles.impactValue}>{environmentalImpact.co2Saved} kg</Text>
                        <Text style={styles.impactLabel}>CO₂ Saved</Text>
                    </View>
                    <View style={styles.impactStat}>
                        <FontAwesome5 name="tint" size={24} color="#50703C"/>
                        <Text style={styles.impactValue}>{environmentalImpact.waterSaved} L</Text>
                        <Text style={styles.impactLabel}>Water Saved</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderAchievementsSection = () => (
        <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <TouchableOpacity onPress={handleViewAchievements}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                {ACHIEVEMENTS.map(achievement => (
                    <View
                        key={achievement.id}
                        style={[
                            styles.achievementBadge,
                            !achievement.unlocked && styles.lockedAchievement
                        ]}
                    >
                        <Feather
                            name={achievement.icon as any}
                            size={24}
                            color={achievement.unlocked ? "#50703C" : "#aaaaaa"}
                        />
                        <Text
                            style={[
                                styles.achievementName,
                                !achievement.unlocked && styles.lockedAchievementText
                            ]}
                        >
                            {achievement.name}
                        </Text>
                        {!achievement.unlocked && (
                            <MaterialIcons name="lock" size={12} color="#aaaaaa" style={styles.lockIcon}/>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderInfoCards = () => (
        <View style={styles.infoCards}>
            <View style={styles.card}>
                <View style={styles.cardIcon}>
                    <MaterialIcons name="email" size={24} color="#50703C"/>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Email</Text>
                    {isEditing ? (
                        <TextInput
                            style={[styles.cardValue, styles.input]}
                            value={editedValues.email}
                            onChangeText={(text) => setEditedValues({...editedValues, email: text})}
                            keyboardType="email-address"
                            placeholder="Enter your email"
                        />
                    ) : (
                        <Text style={styles.cardValue}>{email || 'No email provided'}</Text>
                    )}
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardIcon}>
                    <MaterialIcons name="phone" size={24} color="#50703C"/>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Phone</Text>
                    <Text style={styles.cardValue}>{phoneNumber || 'No phone number provided'}</Text>
                </View>
            </View>
        </View>
    );

    const renderOrdersSection = () => (
        <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Orders</Text>

            <TouchableOpacity
                style={[styles.actionButton, styles.activeOrderButton]}
                onPress={() => navigation.navigate('Orders', {status: 'active'})}
            >
                <MaterialIcons name="pending-actions" size={24} color="#50703C"/>
                <Text style={styles.actionButtonText}>Active Orders</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666"/>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Orders', {status: 'previous'})}
            >
                <MaterialIcons name="history" size={24} color="#50703C"/>
                <Text style={styles.actionButtonText}>Previous Orders</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666"/>
            </TouchableOpacity>
        </View>
    );

    const renderChallengesSection = () => (
        <View style={styles.challengesSection}>
            <Text style={styles.sectionTitle}>Current Challenges</Text>
            <View style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                    <FontAwesome5 name="calendar-check" size={20} color="#50703C"/>
                    <Text style={styles.challengeName}>Weekly Challenge</Text>
                </View>
                <Text style={styles.challengeDescription}>
                    Save 5 more meals this week
                </Text>
                <View style={styles.challengeProgressContainer}>
                    <View style={styles.challengeProgressBar}>
                        <View style={[styles.challengeProgress, {width: '40%'}]}/>
                    </View>
                    <Text style={styles.challengeProgressText}>2/5 meals</Text>
                </View>
                <Text style={styles.challengeReward}>
                    Reward: 50 points + Level 3 Saver badge
                </Text>
            </View>
        </View>
    );

    const renderActionsSection = () => (
        <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePasswordReset}>
                <MaterialIcons name="lock" size={24} color="#50703C"/>
                <Text style={styles.actionButtonText}>Reset Password</Text>
                <MaterialIcons name="chevron-right" size={24} color="#666"/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={24} color="#FFF"/>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content"/>
            {renderHeader()}
            <ScrollView style={styles.safeArea}>
                <View style={styles.container}>
                    {renderProfileSection()}
                    {renderAchievementsSection()}
                    {renderInfoCards()}
                    {renderOrdersSection()}
                    {renderChallengesSection()}
                    {renderActionsSection()}
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconButton: {
        padding: 8,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 18,
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#50703C',
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#50703C',
        borderRadius: 10,
        padding: 2,
    },
    levelBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ffc107',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    levelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    levelContainer: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    levelLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#50703C',
        marginBottom: 4,
    },
    progressBarContainer: {
        width: '80%',
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#50703C',
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e1',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    streakText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#ff7700',
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    gamificationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 8,
        marginBottom: 16,
    },
    gamificationCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    gamificationLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    gamificationValue: {
        fontSize: 16,
        color: '#50703C',
        fontWeight: '600',
    },
    impactContainer: {
        width: '100%',
        backgroundColor: '#f1f8e9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    impactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    impactStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    impactStat: {
        alignItems: 'center',
    },
    impactValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#50703C',
        marginTop: 4,
    },
    impactLabel: {
        fontSize: 12,
        color: '#666',
    },
    achievementsSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    viewAllText: {
        color: '#50703C',
        fontSize: 14,
        fontWeight: '500',
    },
    achievementsScroll: {
        flexDirection: 'row',
    },
    achievementBadge: {
        width: 100,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    lockedAchievement: {
        backgroundColor: '#f5f5f5',
    },
    achievementName: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 8,
    },
    lockedAchievementText: {
        color: '#aaaaaa',
    },
    lockIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    challengesSection: {
        marginBottom: 16,
    },
    challengeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    challengeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
    },
    challengeDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    challengeProgressContainer: {
        marginBottom: 10,
    },
    challengeProgressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 5,
    },
    challengeProgress: {
        height: '100%',
        backgroundColor: '#50703C',
    },
    challengeProgressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
    challengeReward: {
        fontSize: 12,
        color: '#50703C',
        fontWeight: '500',
    },
    infoCards: {
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 8,
        backgroundColor: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    actionsSection: {
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    actionButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
        fontFamily: 'Poppins-Regular',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#ff4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 16,
    },
    logoutButtonText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
    },
    orderSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        paddingLeft: 4,
    },
    activeOrderButton: {
        borderColor: '#50703C',
        borderWidth: 1,
        
    },
});

export default AccountScreen;