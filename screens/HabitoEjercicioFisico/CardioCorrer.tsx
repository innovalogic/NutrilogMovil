import React, { useState, useEffect, useRef } from 'react';
import {Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Picker } from '@react-native-picker/picker';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Parámetros de zancada
const STRIDE_LENGTH_METERS = 1.3; // ligeramente mayor al trotar
const METERS_TO_KM = 1 / 1000;

export default function CardioCorrer() {
  // --- Estados ---
  const [targetDistance, setTargetDistance] = useState<number>(2); // km meta
  const [elapsedTime, setElapsedTime] = useState<number>(0);       // en segundos
  const [stepCount, setStepCount] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Barra de progreso
  const progress = useRef(new Animated.Value(0)).current;
  const lastMagnitude = useRef(0);
  const lastStepTime = useRef(Date.now());

  // --- Temporizador ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // --- Acelerómetro para pasos ---
  useEffect(() => {
    Accelerometer.setUpdateInterval(80);
    return () => unsubscribeAccel();
  }, []);

  const subscribeAccel = () => {
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x*x + y*y + z*z);
      const delta = mag - lastMagnitude.current;
      const now = Date.now();
      // umbral más alto y debounce corto para carrera intensa
      if (delta > 1.2 && now - lastStepTime.current > 180) {
        setStepCount(c => c + 1);
        lastStepTime.current = now;
      }
      lastMagnitude.current = mag;
    });
    setSubscription(sub);
  };

  const unsubscribeAccel = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // --- Cálculo de distancia y velocidad ---
  const distanceKm = stepCount * STRIDE_LENGTH_METERS * METERS_TO_KM;
  const speedKmh = elapsedTime > 0
    ? distanceKm / (elapsedTime / 3600)
    : 0;

  // --- Progreso por distancia ---
  useEffect(() => {
    const pct = Math.min(distanceKm / targetDistance, 1);
    Animated.timing(progress, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [distanceKm, targetDistance]);

  // --- Start / Stop ---
  const handleStartStop = () => {
    if (isRunning) {
      unsubscribeAccel();
      setIsRunning(false);
    } else {
      setElapsedTime(0);
      setStepCount(0);
      lastMagnitude.current = 0;
      lastStepTime.current = Date.now();
      subscribeAccel();
      setIsRunning(true);
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      backgroundColor: 'white',
    }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center bg-black pb-10">
          <Text className="text-white text-3xl font-mono mt-8">Correr</Text>
          <Image
            source={require('../../assets/cardioCorrer.png')}
            className="rounded-2xl w-48 h-48 mt-4"
          />

          <View className="mt-6 px-5 w-full">
            <Text className="text-white text-3xl font-mono mb-4">Resumen</Text>
            <View className="flex-row flex-wrap justify-between">
              {/* Velocidad */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-3xl font-bold text-white">Velocidad</Text>
                <Text className="text-3xl font-bold text-white">
                  {speedKmh.toFixed(1)} km/h
                </Text>
              </View>
              {/* Distancia meta */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-2xl font-bold text-white">Meta</Text>
                <Text className="text-3xl font-bold text-white">
                  {targetDistance.toFixed(1)} km
                </Text>
              </View>
              {/* Distancia recorrida */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-3xl font-bold text-white">Recorrido</Text>
                <Text className="text-3xl font-bold text-white">
                  {distanceKm.toFixed(2)} km
                </Text>
              </View>
              {/* Tiempo transcurrido */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-2xl font-bold text-white">Tiempo</Text>
                <Text className="text-3xl font-bold text-white">
                  {formatTime(elapsedTime)}
                </Text>
              </View>
              {/* Pasos */}
              <View className="bg-[#202938] w-full h-20 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Pasos</Text>
                <Text className="text-2xl font-bold text-white">
                  {stepCount}
                </Text>
              </View>
            </View>

            {/* Selector de distancia */}
            <Text className="text-white text-lg font-bold mb-2">
              Selecciona tu meta de distancia:
            </Text>
            <View className="bg-[#202938] rounded-xl px-4 py-2 mb-6">
              <Picker
                selectedValue={targetDistance}
                onValueChange={val => setTargetDistance(val)}
                style={{ color: 'white' }}
              >
                <Picker.Item label="1 km" value={1} />
                <Picker.Item label="2 km" value={2} />
                <Picker.Item label="3 km" value={3} />
                <Picker.Item label="5 km" value={5} />
                <Picker.Item label="10 km" value={10} />
              </Picker>
            </View>

            {/* Barra de progreso por DISTANCIA */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-white font-bold">Progreso:</Text>
                <Text className="text-white font-bold">
                  {Math.round((distanceKm / targetDistance) * 100)}%
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
            </View>

            {/* Botón iniciar/detener */}
            <TouchableOpacity
              className={`py-3 px-6 rounded-full mb-6 ${
                isRunning ? 'bg-red-600' : 'bg-[#2563ea]'
              }`}
              onPress={handleStartStop}
            >
              <Text className="text-white text-center font-bold">
                {isRunning ? 'Detener' : 'Guardar y Empezar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}