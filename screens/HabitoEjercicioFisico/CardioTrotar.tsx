import React, { useState, useEffect, useRef } from 'react';
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

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CardioTrotar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tiempoMeta, setTiempoMeta] = useState<number>(600); // en segundos (10 min)
  const [tiempoActual, setTiempoActual] = useState<number>(0); // en segundos
  const [iniciandoTrote, setIniciandoTrote] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    if (iniciandoTrote && tiempoActual < tiempoMeta) {
      intervalo = setInterval(() => {
        setTiempoActual((prev) => {
          const nuevoTiempo = prev + 1;
          if (nuevoTiempo >= tiempoMeta) {
            clearInterval(intervalo);
          }
          return nuevoTiempo;
        });
      }, 1000); // cada segundo
    }

    return () => clearInterval(intervalo);
  }, [iniciandoTrote, tiempoMeta]);

  useEffect(() => {
    const porcentaje = Math.min(tiempoActual / tiempoMeta, 1);
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [tiempoActual, tiempoMeta]);

  const iniciarTrote = () => {
    setTiempoActual(0);
    setIniciandoTrote(true);
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
      <Text className="text-white text-3xl font-mono mt-20">Trotar</Text>

      <Image
        source={require('../../assets/cardioTrotar.png')}
        className="rounded-2xl w-[200] h-[200]"
      />

      <View className="flex-1 items-center justify-center mt-[-20] rounded-t-3xl px-5 w-full">
        <Text className="text-white text-3xl font-mono mb-5">Resumen</Text>

        <View className="flex-row flex-wrap justify-between w-full">
          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-3xl font-bold text-white">Velocidad</Text>
            <Text className="text-3xl font-bold text-white">km/h</Text>
          </View>

          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-3xl font-bold text-white">Distancia</Text>
            <Text className="text-3xl font-bold text-white">km</Text>
          </View>

          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-2xl font-bold text-white">Tiempo meta</Text>
            <Text className="text-3xl font-bold text-white">{formatTime(tiempoMeta)}</Text>
          </View>

          <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
            <Text className="text-2xl font-bold text-white">Transcurrido</Text>
            <Text className="text-3xl font-bold text-white">{formatTime(tiempoActual)}</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-2">Selecciona tu meta de tiempo:</Text>
        <View className="w-full bg-[#202938] rounded-xl px-4 py-2 mb-4">
          <Picker
            selectedValue={tiempoMeta}
            style={{ height: 50, width: '100%' }}
            onValueChange={(itemValue) => setTiempoMeta(itemValue)}
          >
            <Picker.Item label="10 minutos" value={600} color="gray" />
            <Picker.Item label="20 minutos" value={1200} color="gray" />
            <Picker.Item label="30 minutos" value={1800} color="gray" />
            <Picker.Item label="40 minutos" value={2400} color="gray" />
            <Picker.Item label="60 minutos" value={3600} color="gray" />
          </Picker>
        </View>

        <View className="w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-bold">Progreso de tiempo:</Text>
            <Text className="text-white font-bold">
              {formatTime(tiempoActual)} / {formatTime(tiempoMeta)}
            </Text>
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
            {Math.round((tiempoActual / tiempoMeta) * 100)}% completado
          </Text>
        </View>

        <TouchableOpacity 
          className="bg-[#2563ea] py-3 px-6 rounded-full mb-4"
          onPress={iniciarTrote}
        >
          <Text className="text-white font-bold">Guardar y Empezar</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default CardioTrotar;
