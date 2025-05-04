import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  RegistroYogaLevel: undefined;
  RegistroTrainingLevel: undefined;
  RegistroCardioLevel: undefined;
  RegistroHabitos:undefined;
};

const RegisterExerciseScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 justify-center items-center bg-blue-500">
      <Text className="text-white text-3xl font-bold mb-5">Hábito de Actividad Física</Text>
      <Text className="text-white text-lg mb-8">Selecciona tus hábitos</Text>

      <TouchableOpacity
        className="bg-orange-600 py-3 px-8 rounded-md mb-5 w-64 items-center"
        onPress={() => navigation.navigate('RegistroYogaLevel')}
      >
        <Text className="text-white text-lg font-bold">Yoga</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-orange-600 py-3 px-8 rounded-md mb-5 w-64 items-center"
        onPress={() => navigation.navigate('RegistroTrainingLevel')}
      >
        <Text className="text-white text-lg font-bold">Entrenamiento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-orange-600 py-3 px-8 rounded-md w-64 items-center"
        onPress={() => navigation.navigate('RegistroCardioLevel')}
      >
        <Text className="text-white text-lg font-bold">Cardio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-600 py-3 px-8 rounded-md w-64 items-center m-10"
        onPress={() => navigation.navigate('RegistroHabitos')}
      >
        <Text className="text-white text-lg font-bold">Regresar a Categorias</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterExerciseScreen;
