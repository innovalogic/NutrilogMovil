import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

const RegisterCardioLevelScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  return (
    <SafeAreaView
          style={{
            flex: 1,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            backgroundColor: 'white',
          }}
        >
    <View className="flex-1 justify-center items-center bg-black">
      <View className="mt-20">
        <Text className="text-white text-3xl font-mono mb-5">Selecciona tu nivel de inicio</Text>
        <Text className="text-white text-3xl font-mono mb-5">Actividad: Cardio</Text>
      </View>

      <View>
        <Image
          source={require('../../assets/cardioMenuuu.png')}
          className="rounded-2xl w-[363] h-[222]"
        />
      </View>

      <View className="flex-1 items-center justify-center mt-[-20] rounded-t-3xl px-5 bg-blue">

        {/* Botón: Quemador Principiante */}
        <TouchableOpacity
          className={`flex-row items-center p-3 my-3 rounded-lg w-full border-2 border-black/30 rounded-2xl bg-[#202938] ${selectedLevel === 'Quemador Principiante' ? 'bg-[#fc6059]' : ''}`}
          onPress={() => {
            navigation.navigate('Cardiocaminar');
          }}
        >
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">
              Quemador Principiante
            </Text>
          </View>
          <Image source={require('../../assets/cardioCaminar.png')} className="w-16 h-16 ml-2 rounded-full" />
        </TouchableOpacity>

        {/* Botón: Cardio Fuego */}
        <TouchableOpacity
          className={`flex-row items-center p-3 my-3 rounded-lg w-full border-2 border-black/30 rounded-2xl bg-[#202938] ${selectedLevel === 'Cardio Fuego' ? 'bg-[#fc6059]' : ''}`}
          onPress={() => {
            navigation.navigate('CardioTrotar');
          }}
        >
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">
              Cardio Fuego
            </Text>
          </View>
          <Image source={require('../../assets/cardioTrotar.png')} className="w-16 h-16 ml-2 rounded-full" />
        </TouchableOpacity>

        {/* Botón: Cardio Extremo */}
        <TouchableOpacity
          className={`flex-row items-center p-3 my-3 rounded-lg w-full border-2 border-black/30 rounded-2xl bg-[#202938] ${selectedLevel === 'Cardio Extremo' ? 'bg-[#fc6059]' : ''}`}
          onPress={() => {
            navigation.navigate('CardioCorrer');
          }}
        >
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">
              Cardio Extremo
            </Text>
          </View>
          <Image source={require('../../assets/cardioCorrer.png')} className="w-16 h-16 ml-2 rounded-full" />
        </TouchableOpacity>

      </View>
    </View>
    </SafeAreaView>
  );
};

export default RegisterCardioLevelScreen;
