import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import BottomNavBar from '../Componentes/BottomNavBar';

export default function MenuScreen() {
  return (
    <View className="flex-1 bg-[#5F75E4]">
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 100 }}>
        <Text className="text-white text-3xl font-bold mb-6">¡Bienvenido de nuevo!</Text>

        {/* Logros */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <Text className="text-lg font-bold text-gray-800 mb-2">Tus Logros 🎯</Text>
          <Text className="text-gray-600 mb-1">✅ Completaste 3 días seguidos de Yoga</Text>
          <Text className="text-gray-600">🔥 Manten tu racha actual de 5 días</Text>
        </View>

        {/* Frase motivadora */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-lg items-center">
          <Image source={require('../assets/motivacion.jpg')} style={{ width: 300, height: 200, marginBottom: 12 }} />
          <Text className="text-xl font-bold text-gray-800 text-center">"Cada pequeño paso cuenta"</Text>
          <Text className="text-gray-600 text-center">No te detengas, sigue avanzando 💪</Text>
        </View>

        {/* Progreso semanal */}
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <Text className="text-lg font-bold text-gray-800 mb-2">Progreso semanal 📅</Text>
          <Text className="text-gray-600 mb-1">Hábitos físicos: 60%</Text>
          <Text className="text-gray-600">Hábitos alimenticios: 45%</Text>
        </View>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}
