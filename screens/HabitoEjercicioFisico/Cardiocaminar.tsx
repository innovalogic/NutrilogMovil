import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

// Función para guardar pasos en Firebase
const guardarPasosDiarios = async (pasosHoy: number) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('Usuario no autenticado');
    return;
  }

  try {
    const hoy = new Date();
    const fechaId = hoy.toISOString().split('T')[0];
    const pasosRef = doc(
      firestore,
      'users',
      user.uid,
      'pasosDiarios',
      fechaId
    );

    const docSnap = await getDoc(pasosRef);
    
    if (docSnap.exists()) {
      const pasosActuales = docSnap.data().totalPasos || 0;
      await updateDoc(pasosRef, {
        totalPasos: pasosActuales + pasosHoy,
        ultimaActualizacion: new Date().toISOString()
      });
    } else {
      await setDoc(pasosRef, {
        totalPasos: pasosHoy,
        fecha: fechaId,
        fechaCompleta: new Date().toISOString(),
        creadoEl: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      });
    }
    
    console.log('Pasos guardados correctamente');
    return true;
  } catch (error) {
    console.error('Error guardando pasos:', error);
    return false;
  }
};

const Cardiocaminar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [pasosMeta, setPasosMeta] = useState(10000);
  const [stepCount, setStepCount] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [subscription, setSubscription] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [guardadoHoy, setGuardadoHoy] = useState(false);
  const lastMagnitudeRef = useRef(0);
  const lastStepTimeRef = useRef(Date.now());
  
  // Longitud promedio de zancada en metros
  const strideLength = 0.762;
  const stepsPerKm = 1000 / strideLength;

  // Actualizar animación de progreso
  useEffect(() => {
    const porcentaje = Math.min(stepCount / pasosMeta, 1);
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [stepCount, pasosMeta]);

  // Cronómetro
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

  // Verificar si ya se guardaron pasos hoy
  useEffect(() => {
    const verificarGuardadoHoy = async () => {
      const hoy = new Date().toISOString().split('T')[0];
      const guardado = await AsyncStorage.getItem(`pasosGuardados_${hoy}`);
      setGuardadoHoy(guardado === 'true');
    };
    
    verificarGuardadoHoy();
  }, []);

  // Cargar estado previo al entrar
  useEffect(() => {
    const cargarEstado = async () => {
      const savedSteps = await AsyncStorage.getItem('currentSteps');
      const savedTime = await AsyncStorage.getItem('currentTime');
      
      if (savedSteps) setStepCount(parseInt(savedSteps, 10));
      if (savedTime) setTime(parseInt(savedTime, 10));
      
      // Iniciar automáticamente el conteo
      setIsActive(true);
      subscribe();
    };
    
    if (isFocused) {
      cargarEstado();
    } else {
      // Guardar estado al salir
      AsyncStorage.setItem('currentSteps', stepCount.toString());
      AsyncStorage.setItem('currentTime', time.toString());
      unsubscribe();
    }
    
    return () => {
      unsubscribe();
    };
  }, [isFocused]);

  // Suscripción al acelerómetro
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
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  // Manejar guardado y salida
  const handleGuardarYVolver = async () => {
    if (guardadoHoy) return;
    
    const hoy = new Date().toISOString().split('T')[0];
    const success = await guardarPasosDiarios(stepCount);
    
    if (success) {
      // Marcar como guardado hoy
      await AsyncStorage.setItem(`pasosGuardados_${hoy}`, 'true');
      setGuardadoHoy(true);
      
      // Reiniciar estado local
      setStepCount(0);
      setTime(0);
      await AsyncStorage.removeItem('currentSteps');
      await AsyncStorage.removeItem('currentTime');
    }
    
    navigation.goBack();
  };

  // Calcular distancia
  const distance = stepCount / stepsPerKm;
  
  // Calcular velocidad
  const speed = time > 0 ? (distance / (time / 3600)) : 0;
  
  // Formatear tiempo
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

            <TouchableOpacity
              className={`py-3 px-6 rounded-full w-full ${guardadoHoy ? 'bg-gray-600' : 'bg-[#2563ea]'}`}
              onPress={handleGuardarYVolver}
              disabled={guardadoHoy}
            >
              <Text className="text-white font-bold text-center">
                {guardadoHoy ? 'Guardado hoy ✓' : 'Guardar y Volver'}
              </Text>
            </TouchableOpacity>
            
            {guardadoHoy && (
              <Text className="text-green-400 mt-2 text-center">
                Ya has guardado tus pasos hoy. Puedes continuar caminando, pero no se guardarán nuevamente hasta mañana.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cardiocaminar;