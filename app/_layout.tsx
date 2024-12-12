/**
 * This Layout component serves as a higher-order component that wraps around the entire application, providing the necessary context for state management with Redux.
 **/

import React from 'react'; // Importing React library for creating components
import {Provider} from 'react-redux'; // Importing Provider from react-redux to connect React with the Redux store
/**
 * Provider is a component from the react-redux library. It makes the Redux store available to any nested components within your app that are connected to the Redux store using the connect function or useSelector and useDispatch hooks.
 * By wrapping the app in a Provider, any React component within this tree can access the global state managed by Redux, making it easier to manage and share state across components.
 * **/
import store from '@/store/store';
/**
 * store represents the entire state of your application. It manages the state through reducers, actions, and middleware, if present.
 * The store is passed to the Provider as a prop, making it accessible to the app's components.
 * **/
import {Slot} from 'expo-router'; // Importing Slot from expo-router, which acts as a placeholder for nested routes
/**
 * In this context, it serves as the entry point for rendering different screens or routes within the application.
 * **/

const Layout = () => {
    return (
        <Provider store={store}>


            <Slot/>
        </Provider>
    );
};

export default Layout;
