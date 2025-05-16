import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../Componentes/BottomNavBar';

type RootStackParamList = {
  Habitos: { selectedHabit: 'Yoga' | 'Entrenamiento' | 'Cardio' };
  Entrenamiento: undefined;
  Yoga: undefined;
  Cardio: undefined;
  RegistroYogaLevel: undefined; // Match the name from App.tsx
};

type HabitosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HabitosScreen() {
  const navigation = useNavigation<HabitosScreenNavigationProp>();
  const route = useRoute();
  const { selectedHabit = 'Entrenamiento' } = route.params as { selectedHabit: 'Yoga' | 'Entrenamiento' | 'Cardio' };

  const handleHabitPress = () => {
    if (selectedHabit === 'Yoga') {
      navigation.navigate('RegistroYogaLevel'); // Updated to match App.tsx
    } else if (selectedHabit === 'Entrenamiento') {
      navigation.navigate('Entrenamiento');
    } else if (selectedHabit === 'Cardio') {
      navigation.navigate('Cardio');
    }
  };

  return (
    <View className="flex-1 bg-gray-700">
      {/* Main Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-white">Hábito Seleccionado</Text>
        <Text className="text-lg text-white mt-2">¡Bienvenido a tus hábitos!</Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-2 px-4 mt-6"
          onPress={handleHabitPress}
        >
          <Text className="text-white font-medium text-lg">{selectedHabit}</Text>
        </TouchableOpacity>
      </View>
      <BottomNavBar />
    </View>
  );
}