import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function CategoriasEjercicioFisico() {
  return (
    <View className="flex-1 bg-white">
      {/* Title and Subtitle */}
      <View className="items-center pt-24">
        <Text className="text-4xl font-bold text-[#5F75E4]">Ejercicio Físico</Text>
        <Text className="text-2xl font-medium text-gray-600 mt-2">Categorías</Text>
      </View>
      {/* Buttons */}
      <View className="flex-1 justify-center items-center">
        <TouchableOpacity className="bg-[#5F75E4] rounded-lg py-6 px-10 mb-6 w-3/4">
          <Text className="text-white text-2xl font-bold text-center">Yoga</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#5F75E4] rounded-lg py-6 px-10 mb-6 w-3/4">
          <Text className="text-white text-2xl font-bold text-center">Entrenamiento</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#5F75E4] rounded-lg py-6 px-10 w-3/4">
          <Text className="text-white text-2xl font-bold text-center">Cardio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}