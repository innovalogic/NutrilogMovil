import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import BottomNavBar from '../Componentes/BottomNavBar';

export default function HabitosScreen() {
  return (
    <View className="flex-1 bg-[#5F75E4] relative">
      <View className="items-center p-20">
        <Text className="text-white text-2xl font-bold">Hábitos</Text>
      </View>
      <View className="p-4 mt-38">
        <View className="flex-row justify-around mb-6">
          <TouchableOpacity className="items-center">
            <Image
              source={require('../assets/EjercicioFisico.png')}
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-base mt-7">Ejercicio Físico</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Image
              source={require('../assets/Alimentacion.png')}
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-base mt-7">Alimentación</Text>
          </TouchableOpacity>
        </View>
        <View className="items-center">
          <TouchableOpacity className="items-center">
            <Image
              source={require('../assets/SaludMental.png')}
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-base mt-7">Salud Mental</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="absolute bottom-0 w-full">
        <BottomNavBar />
      </View>
    </View>
  );
}