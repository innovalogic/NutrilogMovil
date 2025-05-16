import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
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
  const [pasosMeta, setPasosMeta] = useState(10000); 
  const [pasosActuales, setPasosActuales] = useState(6500);
  const [progress] = useState(new Animated.Value(0));

  // Actualizar la animación cuando cambien los pasos actuales o la meta
  useEffect(() => {
    const porcentaje = Math.min(pasosActuales / pasosMeta, 1);
    
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [pasosActuales, pasosMeta]);

  // Función para simular el aumento de pasos (puedes conectarla a un sensor real más adelante)
  const aumentarPasos = () => {
    const nuevosPasos = Math.min(pasosActuales + 1000, pasosMeta);
    setPasosActuales(nuevosPasos);
  };

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
        <Text className="text-white text-3xl font-mono mb-5">Cardio</Text>
      </View>

      <View>
        <Image
          source={require('../../assets/cardioCaminar.png')}
          className="rounded-2xl w-[200] h-[200]"
        />
      </View>

      <View className="flex-1 items-center justify-center mt-[-20] rounded-t-3xl px-5 w-full">
        <Text className="text-white text-3xl font-mono mb-5">Resumen</Text>

       

        <View className="flex-row flex-wrap justify-between w-full">
          {/* Cuadro 1 */}
          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-3xl font-bold text-white">Velocidad</Text>
            <Text className="text-3xl font-bold text-white">km/h</Text>
          </View>

          {/* Cuadro 2 */}
          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-3xl font-bold text-white">Distancia</Text>
            <Text className="text-3xl font-bold text-white">km</Text>
          </View>

          {/* Cuadro 3 */}
          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-3xl font-bold text-white">Tiempo</Text>
            <Text className="text-3xl font-bold text-white">min</Text>
          </View>

          {/* Cuadro 4 */}
          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-3xl font-bold text-white">Pasos</Text>
            <Text className="text-3xl font-bold text-white">{pasosActuales}</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-2">Selecciona tu meta de pasos:</Text>
        <View className="w-full bg-[#202938] rounded-xl px-4 py-2 mb-4">
          <Picker
            selectedValue={pasosMeta}
            style={{ height: 50, width: '100%' }}
            onValueChange={(itemValue) => setPasosMeta(itemValue)}
          >
            <Picker.Item label="5000 pasos" value={5000} color="gray" />
            <Picker.Item label="8000 pasos" value={8000} color="gray"/>
            <Picker.Item label="10000 pasos" value={10000} color="gray"/>
            <Picker.Item label="12000 pasos" value={12000} color="gray"/>
          </Picker>
        </View>

         {/* Barra de progreso */}
        <View className="w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-bold">Progreso de pasos:</Text>
            <Text className="text-white font-bold">{pasosActuales} / {pasosMeta}</Text>
          </View>
          
          <View className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <Animated.View 
              className="h-full bg-[#2563ea] rounded-full"
              style={{
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
          
          <Text className="text-white text-right mt-1">
            {Math.round((pasosActuales / pasosMeta) * 100)}% completado
          </Text>
        </View>

        {/* Botón para simular aumento de pasos (puedes eliminarlo en producción) */}
        <TouchableOpacity 
          className="bg-[#2563ea] py-3 px-6 rounded-full mb-4"
          onPress={aumentarPasos}
        >
          <Text className="text-white font-bold">Guardar y Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default RegisterCardioLevelScreen;