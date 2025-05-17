import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Accelerometer } from 'expo-sensors';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

const Cardiocaminar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pasosMeta, setPasosMeta] = useState(10000);
  const [stepCount, setStepCount] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [subscription, setSubscription] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const lastMagnitudeRef = useRef(0);
  const lastStepTimeRef = useRef(Date.now());
  
  // Longitud promedio de zancada en metros (ajustable según la persona)
  const strideLength = 0.762; // ~0.762m para un adulto promedio
  const stepsPerKm = 1000 / strideLength;

  // Actualizar la animación cuando cambien los pasos actuales o la meta
  useEffect(() => {
    const porcentaje = Math.min(stepCount / pasosMeta, 1);
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [stepCount, pasosMeta]);

  // Efecto para el cronómetro
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      unsubscribe(); // limpiar suscripción al desmontar
    };
  }, []);

  const subscribe = () => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(accel => {
      const { x, y, z } = accel;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const delta = magnitude - lastMagnitudeRef.current;
      const now = Date.now();

      if (delta > 0.4 && now - lastStepTimeRef.current > 250) {
        setStepCount(prev => prev + 1);
        lastStepTimeRef.current = now;
      }
      lastMagnitudeRef.current = magnitude;
    });
    setSubscription(sub);
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const handleGuardarYVolver = () => {
    unsubscribe();
    setIsActive(false);
    navigation.goBack();
  };

  const iniciarConteo = () => {
    if (!isActive) {
      setStepCount(0);
      setTime(0);
      setIsActive(true);
      subscribe();
    }
  };

  const pausarConteo = () => {
    setIsActive(false);
    unsubscribe();
  };

  const resetConteo = () => {
    setIsActive(false);
    setStepCount(0);
    setTime(0);
    unsubscribe();
  };

  // Calcular distancia en km
  const distance = stepCount / stepsPerKm;
  
  // Calcular velocidad en km/h (solo si hay tiempo transcurrido)
  const speed = time > 0 ? (distance / (time / 3600)) : 0;
  
  // Formatear tiempo a HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: 'white',
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center bg-black pb-10">
          <View className="mt-10">
            <Text className="text-white text-3xl font-mono mb-5">Caminar</Text>
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
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Velocidad</Text>
                <Text className="text-3xl font-bold text-white">{speed.toFixed(2)} km/h</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Distancia</Text>
                <Text className="text-3xl font-bold text-white">{distance.toFixed(2)} km</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Tiempo</Text>
                <Text className="text-3xl font-bold text-white">{formatTime(time)}</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Pasos</Text>
                <Text className="text-3xl font-bold text-white">{stepCount}</Text>
              </View>
            </View>

            <Text className="text-white text-lg font-bold mb-2">Selecciona tu meta de pasos:</Text>
            <View className="w-full bg-[#202938] rounded-xl px-4 py-2 mb-4">
              <Picker
                selectedValue={pasosMeta}
                style={{ height: 50, width: '100%', color: 'white' }}
                onValueChange={(itemValue) => {
                  setPasosMeta(itemValue);
                  if (stepCount > itemValue) setStepCount(itemValue);
                }}
              >
                <Picker.Item label="5000 pasos" value={5000} />
                <Picker.Item label="8000 pasos" value={8000} />
                <Picker.Item label="10000 pasos" value={10000} />
                <Picker.Item label="12000 pasos" value={12000} />
                <Picker.Item label="15000 pasos" value={15000} />
              </Picker>
            </View>

            <View className="w-full mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-bold">Progreso de pasos:</Text>
                <Text className="text-white font-bold">{stepCount} / {pasosMeta}</Text>
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
                {Math.round((stepCount / pasosMeta) * 100)}% completado
              </Text>
            </View>

            <View className="flex-row justify-between w-full mb-4">
              {!isActive ? (
                <TouchableOpacity
                  className="bg-green-600 py-3 px-6 rounded-full flex-1 mr-2"
                  onPress={iniciarConteo}
                >
                  <Text className="text-white font-bold text-center">Iniciar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-yellow-600 py-3 px-6 rounded-full flex-1 mr-2"
                  onPress={pausarConteo}
                >
                  <Text className="text-white font-bold text-center">Pausar</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                className="bg-red-600 py-3 px-6 rounded-full flex-1 ml-2"
                onPress={resetConteo}
              >
                <Text className="text-white font-bold text-center">Reiniciar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-[#2563ea] py-3 px-6 rounded-full w-full"
              onPress={handleGuardarYVolver}
            >
              <Text className="text-white font-bold text-center">Guardar y Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cardiocaminar ;