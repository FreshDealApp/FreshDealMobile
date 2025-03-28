import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';

export interface Achievement {
    id: number;
    name: string;
    achievement_type: string;
    badge_image_url?: string;
    description: string;
    earned_at?: string;
    threshold?: number;
    unlocked?: boolean;
    discount_percentage?: number;
}

interface AchievementsSectionProps {
    achievements: Achievement[];
    onViewAchievements: () => void;
    totalDiscountEarned?: number;
}

// Map of achievement types to icon names (Material Community Icons)
const ACHIEVEMENT_ICONS: { [key: string]: string } = {
    'FIRST_PURCHASE': 'trophy',
    'PURCHASE_COUNT': 'shopping',
    'WEEKLY_PURCHASE': 'calendar-week',
    'STREAK': 'fire',
    'BIG_SPENDER': 'cash',
    'ECO_WARRIOR': 'leaf',
    'DEFAULT': 'medal',
};

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
                                                                     achievements,
                                                                     onViewAchievements,
                                                                     totalDiscountEarned = 0
                                                                 }) => {
    // Sort achievements by unlocked status (unlocked first)
    const sortedAchievements = [...achievements].sort((a, b) => {
        // If unlocked is not defined, treat it as false
        const aUnlocked = a.unlocked === true;
        const bUnlocked = b.unlocked === true;

        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    return (
        <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <TouchableOpacity onPress={onViewAchievements}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            {totalDiscountEarned > 0 && (
                <View style={styles.discountBanner}>
                    <Text style={styles.discountText}>
                        You've earned {totalDiscountEarned}% discount on your next order!
                    </Text>
                </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                {sortedAchievements.map((achievement) => {
                    // Get icon name from mapping or use default
                    const iconName = ACHIEVEMENT_ICONS[achievement.achievement_type] || ACHIEVEMENT_ICONS.DEFAULT;
                    const isUnlocked = achievement.unlocked === true;

                    return (
                        <View
                            key={achievement.id}
                            style={[
                                styles.achievementBadge,
                                !isUnlocked && styles.lockedAchievement
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={iconName as any}
                                size={24}
                                color={isUnlocked ? '#50703C' : '#aaaaaa'}
                            />
                            <Text style={[
                                styles.achievementName,
                                !isUnlocked && styles.lockedText
                            ]}>
                                {achievement.name}
                            </Text>

                            {achievement.threshold && (
                                <Text style={[
                                    styles.thresholdText,
                                    !isUnlocked && styles.lockedText
                                ]}>
                                    Required: {achievement.threshold}
                                </Text>
                            )}

                            {isUnlocked && achievement.earned_at && (
                                <Text style={styles.achievementDate}>
                                    {new Date(achievement.earned_at).toLocaleDateString()}
                                </Text>
                            )}

                            {achievement.discount_percentage && isUnlocked && (
                                <View style={styles.discountTag}>
                                    <Text style={styles.discountTagText}>
                                        +{achievement.discount_percentage}%
                                    </Text>
                                </View>
                            )}

                            {!isUnlocked && (
                                <MaterialIcons
                                    name="lock"
                                    size={12}
                                    color="#aaaaaa"
                                    style={styles.lockIcon}
                                />
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    achievementsSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        paddingLeft: 4,
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
        width: 120,
        height: 120,
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
        borderColor: '#e0e0e0',
    },
    achievementName: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '600',
    },
    lockedText: {
        color: '#aaaaaa',
    },
    thresholdText: {
        fontSize: 10,
        color: '#555',
        textAlign: 'center',
        marginTop: 2,
    },
    achievementDate: {
        fontSize: 10,
        color: '#777',
        textAlign: 'center',
        marginTop: 4,
    },
    discountBanner: {
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    discountText: {
        color: '#92400e',
        fontWeight: '500',
    },
    discountTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#50703C',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountTagText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    lockIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    }
});

export default AchievementsSection;