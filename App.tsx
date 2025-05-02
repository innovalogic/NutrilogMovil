import "./global.css";
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-purple-500">
      <Text className="text-blue-700 text-2xl font-extrabold mb-8">NUTRILOG</Text>
      <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg mb-4">
        <Text className="text-white text-lg font-semibold">Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-lg">
        <Text className="text-white text-lg font-semibold">Registrarse</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}