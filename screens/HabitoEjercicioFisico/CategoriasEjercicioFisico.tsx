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
        <TouchableOpacity className="bg-[#5F75E4] rounded-full py-4 px-8 mb-6">
          <Text className="text-white text-xl font-bold">Yoga</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#5F75E4] rounded-full py-4 px-8 mb-6">
          <Text className="text-white text-xl font-bold">Entrenamiento</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#5F75E4] rounded-full py-4 px-8">
          <Text className="text-white text-xl font-bold">Cardio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}