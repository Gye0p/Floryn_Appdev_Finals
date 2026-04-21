import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import AppNavigator from './src/navigations';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import LoadingSpinner from './src/components/LoadingSpinner';

const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);

const App = () => {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner message="Starting Floryn Garden..." />} persistor={persistor}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <StatusBar
                            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                            backgroundColor="#ffffff"
                        />
                        <AppNavigator />
                    </NavigationContainer>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
