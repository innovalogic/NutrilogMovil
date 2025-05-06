import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  RegistroCardioLevel: undefined;
  RegistroYogaLevel: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriasEjercicioFisico() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 bg-white">
      {/* Title and Subtitle */}
      <View className="items-center pt-24">
        <Text className="text-4xl font-bold text-[#5F75E4]">Ejercicio Físico</Text>
        <Text className="text-2xl font-medium text-gray-600 mt-2">Categorías</Text>
      </View>
      {/* Buttons */}
      <View className="flex-1 justify-center items-center">
        <TouchableOpacity className="bg-[#5F75E4] rounded-lg py-6 px-14 mb-10 w-3/4"
        onPress={() => navigation.navigate('RegistroYogaLevel')}>
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Yoga.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Yoga</Text>
              <Text className="text-white font-medium text-left mt-7">
                Alivio del estrés, flexibilidad, fuerza
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#5F75E4] rounded-lg py-6 px-14 mb-10 w-3/4">
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Entrenamiento.png')}
              className="w-20 h-28 mr-4 ml-[-34px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Entrenamiento</Text>
              <Text className="text-white font-medium text-left mt-7">
                Desarrollo muscular, aumento del metabolismo
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#5F75E4] rounded-lg py-6 px-14 w-3/4"
         onPress={() => navigation.navigate('RegistroCardioLevel')}>
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Cardio.png')}
              className="w-20 h-28 mr-4 ml-[-34px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Cardio</Text>
              <Text className="text-white font-medium text-left mt-7">
                Salud cardiovascular, pérdida de peso
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}