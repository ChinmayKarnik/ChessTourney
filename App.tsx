import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { simulateNow } from './src/utils/simulateClock';
import { toTimestamp } from './src/utils/dateUtils';

simulateNow(toTimestamp(2026, 7, 13, 17, 44)); // July 13, 2026 4:37 PM — tournament start

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
