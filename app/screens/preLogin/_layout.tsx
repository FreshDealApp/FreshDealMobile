// app/screens/loginRegister/_layout.tsx

import {Slot, usePathname} from "expo-router";
import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Easing, Platform, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {scaleFont} from "@/components/utils/ResponsiveFont";

export default function RootLayout() {
    // Get screen dimensions
    const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

    /*
    Determine if the screen is considered small, if its small then the logo won't be shown to allow full visibility on main view at the bottom side */
    const isSmallScreen = screenHeight < 700;
    const [showImage, setShowImage] = useState(!isSmallScreen);
    /**/


    // Animated values for logo and form animations
    const imagePosition = useRef(new Animated.Value(isSmallScreen ? screenHeight : screenHeight / 2 - 125)).current; // Vertical position of the logo
    const formPosition = useRef(new Animated.Value(screenHeight)).current; // Vertical position of the form
    const imageOpacity = useRef(new Animated.Value(1)).current; // Opacity of the logo
    const scrollViewOpacity = useRef(new Animated.Value(0)).current; // Opacity of the form scroll view
    const imageScale = useRef(new Animated.Value(1.5)).current; // Scale of the logo image

    // State to manage navigation history and direction
    const [navigationStack, setNavigationStack] = useState<string[]>([]); // Stack to keep track of navigation paths
    const [direction, setDirection] = useState<'forward' | 'back'>('forward'); // Direction of navigation
    const pathname = usePathname(); // Current route pathname

    // Animated values for Slot transitions
    const slotTranslateX = useRef(new Animated.Value(0)).current; // Horizontal translation for Slot
    const slotOpacity = useRef(new Animated.Value(0)).current; // Opacity for Slot

    /**
     * Effect to update navigation stack and determine navigation direction
     */
    useEffect(() => {
        setNavigationStack((prevStack) => {
            const newStack = [...prevStack];
            const currentIndex = newStack.indexOf(pathname);

            if (currentIndex === -1) {
                // If the current pathname is not in the stack, navigate forward
                setDirection('forward');
                newStack.push(pathname);
            } else {
                // If the pathname exists in the stack, navigate back
                setDirection('back');
                newStack.splice(currentIndex + 1);
            }

            return newStack;
        });
    }, [pathname]);

    /**
     * Effect to handle initial animations for the logo and form when the component mounts
     */
    useEffect(() => {
        // Determine the final position of the form based on screen size
        const formFinalPosition = isSmallScreen ? screenHeight * 0.1 : screenHeight * 0.025;
        const animationDuration = 1500; // Duration for the animations in milliseconds

        // Define parallel animations for the logo and form
        const initialAnimations = Animated.parallel([
            // Animate logo opacity to fully visible
            Animated.timing(imageOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            // Animate logo position to its final vertical position
            Animated.timing(imagePosition, {
                toValue: isSmallScreen ? screenHeight * 0.1 : 0,
                duration: animationDuration,
                useNativeDriver: Platform.OS !== 'web',
            }),
            // Animate logo scale down to original size
            Animated.timing(imageScale, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver: Platform.OS !== 'web',
            }),
            // Animate form position to its final vertical position
            Animated.timing(formPosition, {
                toValue: formFinalPosition,
                duration: animationDuration,
                useNativeDriver: Platform.OS !== 'web',
            }),
            // Animate form opacity to fully visible
            Animated.timing(scrollViewOpacity, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]);

        // Define fade-out animation for the logo (only for small screens)
        const fadeOutAnimation = Animated.timing(imageOpacity, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: true,
        });

        // Sequence animations: initial animations followed by fade-out if on a small screen
        const animationSequence = isSmallScreen
            ? Animated.sequence([initialAnimations, fadeOutAnimation])
            : initialAnimations;

        // Start animations after a short delay
        const timer = setTimeout(() => {
            animationSequence.start(() => {
                if (isSmallScreen) {
                    // Hide the logo image after fade-out completes on small screens
                    setShowImage(false);
                }
            });
        }, 500); // Delay before starting animations

        // Cleanup the timer when the component unmounts or dependencies change
        return () => clearTimeout(timer);
    }, [isSmallScreen, screenHeight]);

    /**
     * Effect to animate the Slot component when the route changes
     * The animation direction depends on whether navigating forward or back
     */
    useEffect(() => {
        // Set the initial horizontal position based on navigation direction
        const initialTranslateX = direction === 'forward' ? screenWidth : -screenWidth;

        // Initialize Slot's animated values
        slotTranslateX.setValue(initialTranslateX);
        slotOpacity.setValue(0);

        // Define parallel animations for Slot's entrance
        Animated.parallel([
            // Animate Slot sliding in horizontally
            Animated.timing(slotTranslateX, {
                toValue: 0,
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom easing for smooth animation
                useNativeDriver: true,
            }),
            // Animate Slot's opacity to fully visible
            Animated.timing(slotOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [pathname, direction, screenWidth]);

    return (
        <LinearGradient
            colors={['#B2F7A5', '#ecffe8']}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 1}}
            style={styles.container}
        >
            {showImage && (
                <Animated.Image
                    source={require('@/assets/images/logo.png')}
                    style={[
                        styles.logo,
                        {
                            transform: [{translateY: imagePosition}, {scale: imageScale}],
                            opacity: imageOpacity,
                        },
                    ]}
                    resizeMode="contain"
                />
            )}
            <Animated.View
                style={[
                    styles.main,
                    {
                        transform: [{translateY: formPosition}],
                        opacity: scrollViewOpacity,
                        height: isSmallScreen ? '100%' : screenHeight * 1.1,
                    },
                ]}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{translateX: slotTranslateX}],
                        opacity: slotOpacity,
                    }}
                >
                    <Slot/>
                </Animated.View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        width: scaleFont(150),
        height: scaleFont(150),
        marginTop: scaleFont(60),
        // marginBottom: scaleFont(0),
    },
    main: {
        overflow: 'hidden',
        flex: 1, // Fill available space
        width: '100%', // Full width
        backgroundColor: '#FFFFFF', // White background
        borderTopLeftRadius: scaleFont(25), // Rounded top-left corner
        borderTopRightRadius: scaleFont(25), // Rounded top-right corner
        // Platform-specific shadow styles
        ...Platform.select({
            ios: {
                shadowColor: '#000', // Shadow color for iOS
                shadowOffset: {width: 0, height: -3}, // Shadow offset for iOS
                shadowOpacity: 0.1, // Shadow opacity for iOS
                shadowRadius: 5, // Shadow radius for iOS
            },
            android: {
                elevation: 10, // Elevation for Android shadows
            },
        }),
    },
});
