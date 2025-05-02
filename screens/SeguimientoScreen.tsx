import React from 'react';
import { View, Text } from 'react-native';
import BottomNavBar from '../Componentes/BottomNavBar';

export default function SeguimientoScreen() {
  return (
    <View className="flex-1 bg-[#5F75E4]">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-2xl font-bold">Pantalla de Seguimiento</Text>
      </View>
      <BottomNavBar />
    </View>
  );
}