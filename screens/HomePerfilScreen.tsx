import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import BottomNavBar from '../Componentes/BottomNavBar';

export default function HomePerfilScreen() {
  return (
    <View className="flex-1 bg-[#5F75E4] relative">
      <View className="items-center p-4">
        <Text className="text-white text-2xl font-bold">Perfil</Text>
      </View>
      <View className="p-4">
        <View className="mt-[-10%]">
          <Image
            source={require('../assets/Perfil.png')}
            className="w-36 h-80 ml-8"
            resizeMode="contain"
          />
        </View>
        <View>
          <TouchableOpacity
            className="bg-[#FF6464] rounded-full py-3 px-4 mt-[-40] ml-32 w-[150px] items-center"
          >
            <Text className="text-white text-base font-semibold">Editar perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="absolute bottom-0 w-full">
        <BottomNavBar />
      </View>
    </View>
  );
}