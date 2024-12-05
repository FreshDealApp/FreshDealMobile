import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const Index = () => {
    const router = useRouter();

    // Using useEffect to ensure navigation happens after the component is mounted
    useEffect(() => {
        // Introduce a slight delay before navigating
        // Explanation:
        // - setTimeout with a 0ms delay does not execute immediately.
        // - Instead, it defers the execution until the next event loop cycle ("next tick").
        // This allows the root layout of the application to fully mount before attempting navigation,
        // which avoids the "attempted to navigate before mounting the root layout component" error.
        // This approach ensures that all synchronous rendering and layout mounting tasks
        // are completed before the navigation logic is triggered.
        const timer = setTimeout(() => {
            // Navigate to the LoginPage after the slight asynchronous break
            router.push('/screens/loginPage');
        }, 0); // 0ms delay ensures minimal delay while still deferring execution

        // Cleanup function to clear the timer when the component unmounts
        return () => clearTimeout(timer);
    }, [router]); // Dependency array ensures useEffect runs only when 'router' changes


    // Incorrect approach that would cause an error:
    // Uncommenting the code below and using it instead of the setTimeout approach
    // would lead to the "attempted to navigate before mounting the root layout component" error.
    // This is because it tries to navigate immediately, potentially before the root layout has fully mounted.

    /*
    useEffect(() => {
        router.push('/screens/LoginPage');
    }, [router]);
    */

    // or simply using this instead would give the same error
    /*
    router.push('/screens/LoginPage');
     */

    return null; // This component does not render any visible UI
};

export default Index;
