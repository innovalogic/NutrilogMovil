import "./global.css"
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-400">
      <Text className="text-blue-700 text-2xl font-extrabold">¡Tailwind está funcionando!</Text>
      <StatusBar style="auto" />
    </View>

    
  );
}