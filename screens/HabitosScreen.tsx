import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../Componentes/BottomNavBar';

type RootStackParamList = {
  Habitos: { selectedHabit: 'Yoga' | 'Entrenamiento' | 'Cardio' };
  Entrenamiento: undefined;
  Yoga: undefined;
  Cardio: undefined;
  RegistroYogaLevel: undefined;
};

type HabitosScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type HabitosScreenRouteProp = RouteProp<RootStackParamList, 'Habitos'>;

export default function HabitosScreen() {
  const navigation = useNavigation<HabitosScreenNavigationProp>();
  const route = useRoute<HabitosScreenRouteProp>();
  const [selectedHabit, setSelectedHabit] = useState<'Yoga' | 'Entrenamiento' | 'Cardio'>(
    route.params?.selectedHabit ?? 'Entrenamiento'
  );

  const handleHabitPress = () => {
    if (selectedHabit === 'Yoga') {
      navigation.navigate('RegistroYogaLevel');
    } else if (selectedHabit === 'Entrenamiento') {
      navigation.navigate('Entrenamiento');
    } else if (selectedHabit === 'Cardio') {
      navigation.navigate('Cardio');
    }
  };

  return (
    <View className="flex-1 bg-gray-700">
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