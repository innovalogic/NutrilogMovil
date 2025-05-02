import { View, Text, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function InicioScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#5F75E4]">
      <Image
        source={require('../assets/logo.png')}
        className="w-36 h-36 mb-4"
        resizeMode="contain"
      />
      <Text className="text-white text-2xl font-extrabold mb-8 mt-20">NUTRILOG</Text>
      <TouchableOpacity className="bg-red-500 px-20 py-3 rounded-[30px] mb-4">
        <Text className="text-white text-lg font-semibold">Inicio de Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-500 px-24 py-3 rounded-[30px]">
        <Text className="text-white text-lg font-semibold">Registrarse</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}