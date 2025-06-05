import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StepCounterService from './StepCounterService';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

const Cardiocaminar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const stepService = StepCounterService.getInstance();
  
  const [pasosMeta, setPasosMeta] = useState(10000);
  const [stepCount, setStepCount] = useState(0);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [isActive, setIsActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  const updateDataFromService = () => {
    const currentSteps = stepService.getCurrentSteps();
    const currentTime = stepService.getCurrentTime();
    const currentDistance = stepService.getDistance();
    const currentSpeed = stepService.getSpeed();
    
    setStepCount(currentSteps);
    setTime(currentTime);
    setDistance(currentDistance);
    setSpeed(currentSpeed);
    setIsActive(stepService.isCountingActive());
  };

  useEffect(() => {
    const porcentaje = Math.min(stepCount / pasosMeta, 1);
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [stepCount, pasosMeta]);

  useEffect(() => {
    const loadSavedMeta = async () => {
      try {
        const savedMeta = await AsyncStorage.getItem('pasosMeta');
        if (savedMeta) {
          setPasosMeta(parseInt(savedMeta, 10));
        }
      } catch (error) {
        console.error('Error cargando meta de pasos:', error);
      }
    };
    loadSavedMeta();
  }, []);

  const handleMetaChange = async (newMeta: number) => {
    setPasosMeta(newMeta);
    try {
      await AsyncStorage.setItem('pasosMeta', newMeta.toString());
    } catch (error) {
      console.error('Error guardando meta de pasos:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      stepService.startCounting();e
      updateDataFromService();
      updateInterval.current = setInterval(updateDataFromService, 1000);
      getLastSyncTime();
    } else {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
    }

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [isFocused]);

  const getLastSyncTime = async () => {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      if (lastSync) {
        const syncDate = new Date(lastSync);
        setLastSyncTime(syncDate.toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error obteniendo último tiempo de sync:', error);
    }
  };

  const toggleCounting = async () => {
    if (isActive) {
      await stepService.stopCounting();
      Alert.alert('Pausado', 'El conteo de pasos se ha pausado.');
    } else {
      await stepService.startCounting();
      Alert.alert('Iniciado', 'El conteo de pasos se ha reanudado.');
    }
    updateDataFromService();
  };

  const handleManualSync = async () => {
    try {
      const success = await stepService.forceSyncToFirebase();
      if (success) {
        await AsyncStorage.setItem('lastSyncTime', new Date().toISOString());
        getLastSyncTime();
        Alert.alert('Éxito', 'Datos sincronizados correctamente con Firebase.');
      } else {
        Alert.alert('Info', 'No hay datos nuevos para sincronizar.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo sincronizar con Firebase.');
      console.error('Error en sincronización manual:', error);
    }
  };

  const handleResetDay = () => {
    Alert.alert(
      'Confirmar Reset',
      '¿Estás seguro de que quieres reiniciar los datos del día?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            await stepService.stopCounting();
            await AsyncStorage.removeItem('stepCounterData');
            await stepService.startCounting();
            updateDataFromService();
            Alert.alert('Reiniciado', 'Los datos del día han sido reiniciados.');
          }
        }
      ]
    );
  };

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
            {lastSyncTime && (
              <Text className="text-gray-400 text-sm text-center">
                Última sync: {lastSyncTime}
              </Text>
            )}
          </View>
          <View>
            <Image
              source={require('../../assets/cardioCaminar.png')}
              className="rounded-2xl w-[200] h-[200]"
            />
          </View>
          <View className="flex-row items-center mt-4 mb-2">
            <View 
              className={`w-3 h-3 rounded-full mr-2 ${
                isActive ? 'bg-green-500' : 'bg-red-500'
              }`} 
            />
            <Text className="text-white text-sm">
              {isActive ? 'Contando en segundo plano' : 'Pausado'}
            </Text>
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
                onValueChange={handleMetaChange}
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

            <View className="w-full space-y-3">
              <TouchableOpacity
                className={`py-3 px-6 rounded-full w-full ${
                  isActive ? 'bg-orange-600' : 'bg-green-600'
                }`}
                onPress={toggleCounting}
              >
                <Text className="text-white font-bold text-center">
                  {isActive ? 'Pausar Conteo' : 'Iniciar Conteo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 px-6 rounded-full w-full bg-[#2563ea]"
                onPress={handleManualSync}
              >
                <Text className="text-white font-bold text-center">
                  Sincronizar Ahora
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 px-6 rounded-full w-full bg-gray-600"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-white font-bold text-center">
                  Volver (Sigue contando)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-2 px-4 rounded-full w-full bg-red-600"
                onPress={handleResetDay}
              >
                <Text className="text-white font-bold text-center text-sm">
                  Reiniciar Día
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-green-400 mt-4 text-center text-sm">
              ✓ Los pasos se cuentan automáticamente en segundo plano
              {'\n'}✓ Sincronización automática cada 30 segundos
              {'\n'}✓ Los datos se conservan al cerrar la app
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cardiocaminar;