import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  CategoriasEjercicioFisico: undefined;
  CategoriasAlimentacion: undefined;
  CategoriasSaludMental: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegistroHabitosCategorias() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 bg-gray-900 relative">
      <View className="items-center p-20">
        <Text className="text-white text-4xl font-bold">HÁBITOS</Text>
        <Text className="text-white text-3xl font-medium mt-5">¿Qué hábito deseas adquirir?</Text>
      </View>
      <View className="p-4 mt-[-40]">
        <View className="flex-row justify-around mb-8">
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate('CategoriasEjercicioFisico')}
          >
            <Image
              source={require('../../assets/EjercicioFisico.png')}
              className="w-40 h-40 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-lg font-extrabold mt-7">Ejercicio Físico</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="items-center"
            onPress={() => navigation.navigate('CategoriasAlimentacion')}
          >
            <Image
              source={require('../../assets/Alimentacion.png')}
              className="w-40 h-40 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-lg font-extrabold mt-7">Alimentación</Text>
          </TouchableOpacity>
        </View>
        <View className="items-center">
          <TouchableOpacity 
            className="items-center"
            onPress={() => navigation.navigate('CategoriasSaludMental')}
          >
            <Image
              source={require('../../assets/SaludMental.png')}
              className="w-40 h-40 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-lg font-extrabold mt-7">Salud Mental</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}