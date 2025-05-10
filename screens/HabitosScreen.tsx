import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../Componentes/BottomNavBar';

// Define the navigation stack param list
type RootStackParamList = {
  Habitos: undefined;
  Entrenamiento: undefined;
};

type HabitosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HabitosScreen() {
  const navigation = useNavigation<HabitosScreenNavigationProp>();

  const handleEntrenamientoPress = () => {
    navigation.navigate('Entrenamiento');
  };

  return (
    <View className="flex-1 bg-gray-700">
      {/* Main Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-white">Hábito Seleccionado</Text>
        <Text className="text-lg text-white mt-2">¡Bienvenido a tus hábitos!</Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-2 px-4 mt-6"
          onPress={handleEntrenamientoPress}
        >
          <Text className="text-white font-medium text-lg">Entrenamiento</Text>
        </TouchableOpacity>
      </View>
      <BottomNavBar />
    </View>
  );
}