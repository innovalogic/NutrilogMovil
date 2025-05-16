import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Picker } from '@react-native-picker/picker';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const STRIDE_LENGTH_METERS = 1.2;  // promedio al trotar
const METERS_TO_KM = 1 / 1000;

export default function CardioTrotar() {
  // --- Estados ---
  const [targetTime, setTargetTime] = useState<number>(600);  // en segundos
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const [stepCount, setStepCount] = useState<number>(0);
  const [subscription, setSubscription] = useState<any>(null);

  const progress = useRef(new Animated.Value(0)).current;
  const lastMagnitude = useRef(0);
  const lastStepTime = useRef(Date.now());

  // --- Temporizador de tiempo ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && elapsedTime < targetTime) {
      timer = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, targetTime, elapsedTime]);

  // --- Animación de progreso by time ---
  useEffect(() => {
    const pct = Math.min(elapsedTime / targetTime, 1);
    Animated.timing(progress, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [elapsedTime, targetTime]);

  // --- Acelerómetro para contar pasos ---
  useEffect(() => {
    Accelerometer.setUpdateInterval(80);
    return () => unsubscribeAccel();
  }, []);

  const subscribeAccel = () => {
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x*x + y*y + z*z);
      const delta = mag - lastMagnitude.current;
      const now = Date.now();
      // umbral para trote y debounce
      if (delta > 1.0 && now - lastStepTime.current > 200) {
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

  // --- Cálculos de distancia y velocidad ---
  const distanceKm = stepCount * STRIDE_LENGTH_METERS * METERS_TO_KM;
  const speedKmh = elapsedTime > 0
    ? distanceKm / (elapsedTime / 3600)
    : 0;

  // --- Manejo de inicio/detener ---
  const handleStartStop = () => {
    if (isRunning) {
      unsubscribeAccel();
      setIsRunning(false);
    } else {
      // reiniciar
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
          <Text className="text-white text-3xl font-mono mt-8">Trotar</Text>
          <Image
            source={require('../../assets/cardioTrotar.png')}
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
              {/* Distancia */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-3xl font-bold text-white">Distancia</Text>
                <Text className="text-3xl font-bold text-white">
                  {distanceKm.toFixed(2)} km
                </Text>
              </View>
              {/* Meta de tiempo */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-2xl font-bold text-white">Tiempo meta</Text>
                <Text className="text-3xl font-bold text-white">
                  {formatTime(targetTime)}
                </Text>
              </View>
              {/* Tiempo transcurrido */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-2xl font-bold text-white">Transcurrido</Text>
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

            {/* Selector de tiempo */}
            <Text className="text-white text-lg font-bold mb-2">
              Selecciona tu meta de tiempo:
            </Text>
            <View className="bg-[#202938] rounded-xl px-4 py-2 mb-6">
              <Picker
                selectedValue={targetTime}
                onValueChange={val => setTargetTime(val)}
                style={{ color: 'white' }}
              >
                <Picker.Item label="10 minutos" value={600} />
                <Picker.Item label="20 minutos" value={1200} />
                <Picker.Item label="30 minutos" value={1800} />
                <Picker.Item label="40 minutos" value={2400} />
                <Picker.Item label="60 minutos" value={3600} />
              </Picker>
            </View>

            {/* Barra de progreso por TIEMPO */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-white font-bold">Progreso:</Text>
                <Text className="text-white font-bold">
                  {Math.round((elapsedTime / targetTime) * 100)}%
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