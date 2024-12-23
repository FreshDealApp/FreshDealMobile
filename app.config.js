import 'dotenv/config';

export default {
    expo: {
        name: "FreshDeal",
        slug: "freshdeal-siarqbmuhjlnnxqkbsqk",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/images/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            config: {
                googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.emreutkan.freshdeal",
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY,
                },
            },
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: ["expo-router", "expo-font"],
        experiments: {
            typedRoutes: true
        },
        extra: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            router: {
                origin: false
            },
            eas: {
                projectId: "841595e4-78a3-42c1-8da1-938b6a83b1b6"
            }
        }
    }
};
