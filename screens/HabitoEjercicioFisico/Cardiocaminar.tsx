import { useStepCounter } from 'StepCounterService';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

const Cardiocaminar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  
  // Usar el hook personalizado del contador de pasos
  const { stepCount, isActive, startCounting, stopCounting, syncSteps, getStatistics } = useStepCounter();
  
  // Estados locales
  const [pasosMeta, setPasosMeta] = useState(10000);
  const [progress] = useState(new Animated.Value(0));
  const [time, setTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionStartSteps, setSessionStartSteps] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Referencias
  const timerRef = useRef(null);
  
  // Configuraciones
  const strideLength = 0.762; // metros
  const stepsPerKm = 1000 / strideLength;

  // Cargar configuraciones guardadas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMeta = await AsyncStorage.getItem('pasos_meta');
        if (savedMeta) {
          setPasosMeta(parseInt(savedMeta, 10));
        }
        
        const savedTime = await AsyncStorage.getItem('session_time');
        if (savedTime) {
          setTime(parseInt(savedTime, 10));
        }
        
        const startSteps = await AsyncStorage.getItem('session_start_steps');
        if (startSteps) {
          setSessionStartSteps(parseInt(startSteps, 10));
        }
        
        // Cargar estadísticas
        const stats = await getStatistics(7);
        setStatistics(stats);
        
      } catch (error) {
        console.error('Error cargando configuraciones:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Manejar enfoque de pantalla
  useFocusEffect(
    React.useCallback(() => {
      if (isFocused) {
        // Iniciar conteo automáticamente al entrar
        handleStartSession();
      } else {
        // Guardar estado al salir
        saveSessionState();
      }
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [isFocused])
  );

  // Actualizar animación de progreso
  useEffect(() => {
    const sessionSteps = stepCount - sessionStartSteps;
    const porcentaje = Math.min(sessionSteps / pasosMeta, 1);
    
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [stepCount, pasosMeta, sessionStartSteps]);

  // Cronómetro de sesión
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          // Guardar cada minuto
          if (newTime % 60 === 0) {
            AsyncStorage.setItem('session_time', newTime.toString());
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  // Iniciar sesión de caminata
  const handleStartSession = async () => {
    try {
      await startCounting();
      setIsTimerActive(true);
      
      // Guardar pasos iniciales si es una nueva sesión
      const savedStartSteps = await AsyncStorage.getItem('session_start_steps');
      if (!savedStartSteps || savedStartSteps === '0') {
        setSessionStartSteps(stepCount);
        await AsyncStorage.setItem('session_start_steps', stepCount.toString());
      }
      
    } catch (error) {
      console.error('Error iniciando sesión:', error);
      Alert.alert('Error', 'No se pudo iniciar el contador de pasos');
    }
  };

  // Pausar/reanudar sesión
  const handleToggleSession = () => {
    setIsTimerActive(!isTimerActive);
  };

  // Finalizar sesión
  const handleEndSession = async () => {
    Alert.alert(
      'Finalizar Sesión',
      '¿Deseas finalizar la sesión de caminata?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          style: 'destructive',
          onPress: async () => {
            await finalizarSesion();
          }
        }
      ]
    );
  };

  // Finalizar sesión y guardar datos
  const finalizarSesion = async () => {
    try {
      setIsTimerActive(false);
      
      // Sincronizar con Firebase
      const syncSuccess = await syncSteps();
      if (syncSuccess) {
        setLastSyncTime(new Date().toLocaleTimeString());
      }
      
      // Limpiar datos de sesión
      await AsyncStorage.multiRemove([
        'session_time',
        'session_start_steps'
      ]);
      
      // Resetear estados
      setTime(0);
      setSessionStartSteps(stepCount);
      
      Alert.alert(
        'Sesión Finalizada',
        `Pasos registrados: ${stepCount - sessionStartSteps}\nTiempo: ${formatTime(time)}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      Alert.alert('Error', 'Hubo un problema al finalizar la sesión');
    }
  };

  // Guardar estado de sesión
  const saveSessionState = async () => {
    try {
      await AsyncStorage.multiSet([
        ['session_time', time.toString()],
        ['session_start_steps', sessionStartSteps.toString()],
        ['pasos_meta', pasosMeta.toString()]
      ]);
    } catch (error) {
      console.error('Error guardando estado:', error);
    }
  };

  // Sincronización manual
  const handleManualSync = async () => {
    try {
      const success = await syncSteps();
      if (success) {
        setLastSyncTime(new Date().toLocaleTimeString());
        Alert.alert('Éxito', 'Pasos sincronizados correctamente');
      } else {
        Alert.alert('Error', 'No se pudo sincronizar con Firebase');
      }
    } catch (error) {
      Alert.alert('Error', 'Problema de conexión');
    }
  };

  // Cambiar meta de pasos
  const handleMetaChange = async (newMeta) => {
    setPasosMeta(newMeta);
    await AsyncStorage.setItem('pasos_meta', newMeta.toString());
  };

  // Calcular métricas
  const sessionSteps = Math.max(0, stepCount - sessionStartSteps);
  const distance = sessionSteps / stepsPerKm;
  const speed = time > 0 ? (distance / (time / 3600)) : 0;
  const calories = sessionSteps * 0.04; // Aproximado

  // Formatear tiempo
  const formatTime = (totalSeconds) => {
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
          {/* Header */}
          <View className="mt-10 flex-row items-center justify-between w-full px-5">
            <Text className="text-white text-3xl font-mono">Caminar</Text>
            <View className="flex-row items-center">
              {isActive && (
                <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              )}
              <Text className="text-white text-sm">
                {isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>

          {/* Imagen principal */}
          <View className="my-5">
            <Image
              source={require('../../assets/cardioCaminar.png')}
              className="rounded-2xl w-[200] h-[200]"
            />
          </View>

          {/* Métricas principales */}
          <View className="flex-1 items-center justify-center rounded-t-3xl px-5 w-full">
            <Text className="text-white text-3xl font-mono mb-5">Sesión Actual</Text>

            {/* Grid de métricas */}
            <View className="flex-row flex-wrap justify-between w-full mb-6">
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-lg font-bold text-white">Velocidad</Text>
                <Text className="text-2xl font-bold text-white">{speed.toFixed(2)}</Text>
                <Text className="text-sm text-gray-300">km/h</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-lg font-bold text-white">Distancia</Text>
                <Text className="text-2xl font-bold text-white">{distance.toFixed(2)}</Text>
                <Text className="text-sm text-gray-300">km</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-lg font-bold text-white">Tiempo</Text>
                <Text className="text-2xl font-bold text-white">{formatTime(time)}</Text>
                <Text className="text-sm text-gray-300">h:m:s</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-lg font-bold text-white">Pasos</Text>
                <Text className="text-2xl font-bold text-white">{sessionSteps}</Text>
                <Text className="text-sm text-gray-300">esta sesión</Text>
              </View>
            </View>

            {/* Métricas adicionales */}
            <View className="bg-[#202938] w-full rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-bold">Pasos totales hoy:</Text>
                <Text className="text-white font-bold">{stepCount}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-bold">Calorías aprox:</Text>
                <Text className="text-white font-bold">{calories.toFixed(0)} kcal</Text>
              </View>
              {lastSyncTime && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-300 text-sm">Última sincronización:</Text>
                  <Text className="text-green-400 text-sm">{lastSyncTime}</Text>
                </View>
              )}
            </View>

            {/* Selector de meta */}
            <Text className="text-white text-lg font-bold mb-2">Meta de pasos:</Text>
            <View className="w-full bg-[#202938] rounded-xl px-4 py-2 mb-4">
              <Picker
                selectedValue={pasosMeta}
                style={{ height: 50, width: '100%', color: 'white' }}
                onValueChange={handleMetaChange}
              >
                <Picker.Item label="5,000 pasos" value={5000} />
                <Picker.Item label="8,000 pasos" value={8000} />
                <Picker.Item label="10,000 pasos" value={10000} />
                <Picker.Item label="12,000 pasos" value={12000} />
                <Picker.Item label="15,000 pasos" value={15000} />
                <Picker.Item label="20,000 pasos" value={20000} />
              </Picker>
            </View>

            {/* Barra de progreso */}
            <View className="w-full mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-bold">Progreso de sesión:</Text>
                <Text className="text-white font-bold">{sessionSteps} / {pasosMeta}</Text>
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
                {Math.round((sessionSteps / pasosMeta) * 100)}% completado
              </Text>
            </View>

            {/* Botones de control */}
            <View className="w-full space-y-3">
              {/* Botón principal de control */}
              <TouchableOpacity
                className={`py-4 px-6 rounded-full w-full ${isTimerActive ? 'bg-yellow-600' : 'bg-green-600'}`}
                onPress={handleToggleSession}
              >
                <Text className="text-white font-bold text-center text-lg">
                  {isTimerActive ? '⏸️ Pausar Sesión' : '▶️ Continuar Sesión'}
                </Text>
              </TouchableOpacity>

              {/* Botones secundarios */}
              <View className="flex-row justify-between space-x-3">
                <TouchableOpacity
                  className="py-3 px-4 rounded-full flex-1 bg-[#2563ea]"
                  onPress={handleManualSync}
                >
                  <Text className="text-white font-bold text-center">
                    🔄 Sincronizar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-3 px-4 rounded-full flex-1 bg-red-600"
                  onPress={handleEndSession}
                >
                  <Text className="text-white font-bold text-center">
                    ⏹️ Finalizar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Botón volver */}
              <TouchableOpacity
                className="py-3 px-6 rounded-full w-full bg-gray-700"
                onPress={() => {
                  saveSessionState();
                  navigation.goBack();
                }}
              >
                <Text className="text-white font-bold text-center">
                  ← Volver al Menú
                </Text>
              </TouchableOpacity>
            </View>

            {/* Estadísticas semanales */}
            {statistics && (
              <View className="w-full mt-6 bg-[#202938] rounded-xl p-4">
                <Text className="text-white text-lg font-bold mb-3">Estadísticas (7 días)</Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-300">Promedio diario:</Text>
                  <Text className="text-white font-bold">{statistics.averageDaily} pasos</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-300">Mejor día:</Text>
                  <Text className="text-white font-bold">{statistics.maxDaily} pasos</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Total semanal:</Text>
                  <Text className="text-white font-bold">{statistics.totalSteps} pasos</Text>
                </View>
              </View>
            )}

            {/* Información adicional */}
            <View className="w-full mt-4 p-4 bg-gray-800 rounded-xl">
              <Text className="text-gray-300 text-sm text-center">
                💡 El contador funciona en segundo plano y sincroniza automáticamente con Firebase.
                Los pasos se guardan localmente y se suben cuando hay conexión.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cardiocaminar;