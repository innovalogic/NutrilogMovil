import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define tu tipo de navegación si lo tienes
type RootStackParamList = {
  MentalHealth: undefined;
  Nutrition: undefined;
  RegistroEjercicios: undefined;
  Menu:undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterHabitCategoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 justify-center items-center bg-blue-500">
      <Text className="text-3xl font-bold text-white mb-8">Iniciemos con tus hábitos</Text>

      {/* Salud Mental */}
      <TouchableOpacity
        className="bg-white rounded-xl p-6 mb-5 items-center w-48"
        onPress={() => navigation.navigate('MentalHealth')}
      >
        <Text className="text-lg font-bold">Salud Mental</Text>
      </TouchableOpacity>

      {/* Alimentación */}
      <TouchableOpacity
        className="bg-white rounded-xl p-6 mb-5 items-center w-48"
        onPress={() => navigation.navigate('Nutrition')}
      >
        <Text className="text-lg font-bold">Alimentación</Text>
      </TouchableOpacity>

      {/* Actividad Física */}
      <TouchableOpacity
        className="bg-white rounded-xl p-6 mb-5 items-center w-48"
        onPress={() => navigation.navigate('RegistroEjercicios')}
      >
        <Text className="text-lg font-bold">Actividad Física</Text>
      </TouchableOpacity>
      <TouchableOpacity
              className="bg-green-600 py-3 px-8 rounded-md w-64 items-center m-10"
              onPress={() => navigation.navigate('Menu')}
            >
              <Text className="text-white text-lg font-bold">Terminar Registros de Habitos</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterHabitCategoryScreen;
