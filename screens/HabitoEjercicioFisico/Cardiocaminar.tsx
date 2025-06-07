import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../../firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import StepCounterService from './StepCounterService';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

interface StepRecord {
  date: string;
  steps: number;
  distance: number;
  time: number;
  calories: number;
}

interface StepStats {
  daily: StepRecord[];
  weekly: { week: string; totalSteps: number; avgSteps: number; totalDistance: number; totalTime: number }[];
  monthly: { month: string; totalSteps: number; avgSteps: number; totalDistance: number; totalTime: number }[];
}

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
  
  // Estados para el seguimiento
  const [viewMode, setViewMode] = useState<'tracker' | 'daily' | 'weekly' | 'monthly'>('tracker');
  const [stepStats, setStepStats] = useState<StepStats>({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(false);
  
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

  // Función para calcular calorías quemadas (aproximado)
  const calculateCalories = (steps: number, weight: number = 70): number => {
    // Aproximadamente 0.04 calorías por paso para una persona de 70kg
    return Math.round(steps * 0.04 * (weight / 70));
  };

  // Función para guardar datos diarios
  const saveDailyData = async () => {
    if (!auth.currentUser || stepCount === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const calories = calculateCalories(stepCount);
    
    try {
      const dailyRecord: StepRecord = {
        date: today,
        steps: stepCount,
        distance: distance,
        time: time,
        calories: calories
      };

      await setDoc(
        doc(firestore, 'users', auth.currentUser.uid, 'stepHistory', today),
        dailyRecord,
        { merge: true }
      );

      console.log('Datos diarios guardados exitosamente');
    } catch (error) {
      console.error('Error guardando datos diarios:', error);
    }
  };

  // Función para cargar estadísticas
  const loadStepStats = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const stepHistoryRef = collection(firestore, 'users', userId, 'stepHistory');
      
      // Obtener los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        stepHistoryRef,
        where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const dailyData: StepRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        dailyData.push(doc.data() as StepRecord);
      });

      // Procesar datos semanales
      const weeklyData = processWeeklyData(dailyData);
      
      // Procesar datos mensuales
      const monthlyData = processMonthlyData(dailyData);

      setStepStats({
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos semanales
  const processWeeklyData = (dailyData: StepRecord[]) => {
    const weeklyMap = new Map();
    
    dailyData.forEach(record => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          week: weekKey,
          totalSteps: 0,
          totalDistance: 0,
          totalTime: 0,
          days: 0
        });
      }
      
      const weekData = weeklyMap.get(weekKey);
      weekData.totalSteps += record.steps;
      weekData.totalDistance += record.distance;
      weekData.totalTime += record.time;
      weekData.days += 1;
    });
    
    return Array.from(weeklyMap.values()).map(week => ({
      ...week,
      avgSteps: Math.round(week.totalSteps / week.days)
    }));
  };

  // Procesar datos mensuales
  const processMonthlyData = (dailyData: StepRecord[]) => {
    const monthlyMap = new Map();
    
    dailyData.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          totalSteps: 0,
          totalDistance: 0,
          totalTime: 0,
          days: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.totalSteps += record.steps;
      monthData.totalDistance += record.distance;
      monthData.totalTime += record.time;
      monthData.days += 1;
    });
    
    return Array.from(monthlyMap.values()).map(month => ({
      ...month,
      avgSteps: Math.round(month.totalSteps / month.days)
    }));
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
      stepService.startCounting();
      updateDataFromService();
      updateInterval.current = setInterval(updateDataFromService, 1000);
      getLastSyncTime();
      
      // Cargar estadísticas cuando se enfoca la pantalla
      if (viewMode !== 'tracker') {
        loadStepStats();
      }
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
  }, [isFocused, viewMode]);

  // Guardar datos automáticamente cada minuto
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (stepCount > 0) {
        saveDailyData();
      }
    }, 60000); // Cada minuto

    return () => clearInterval(saveInterval);
  }, [stepCount, distance, time]);

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
      // Guardar datos al pausar
      await saveDailyData();
      Alert.alert('Pausado', 'El conteo de pasos se ha pausado y los datos se han guardado.');
    } else {
      await stepService.startCounting();
      Alert.alert('Iniciado', 'El conteo de pasos se ha reanudado.');
    }
    updateDataFromService();
  };

  const handleManualSync = async () => {
    try {
      const success = await stepService.forceSyncToFirebase();
      await saveDailyData(); // También guardar nuestros datos
      
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeek = (weekString: string) => {
    const date = new Date(weekString);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);
    
    return `${date.getDate()}/${date.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Función para cambiar entre vistas
  const handleViewChange = (newView: 'tracker' | 'daily' | 'weekly' | 'monthly') => {
    setViewMode(newView);
    if (newView !== 'tracker') {
      loadStepStats();
    }
  };

  // Renderizar vista de seguimiento
  const renderStatsView = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-white text-lg">Cargando estadísticas...</Text>
        </View>
      );
    }

    const data = viewMode === 'daily' ? stepStats.daily : 
                 viewMode === 'weekly' ? stepStats.weekly : 
                 stepStats.monthly;

    if (data.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <Text className="text-white text-lg">No hay datos disponibles</Text>
          <Text className="text-gray-400 text-sm mt-2">Comienza a caminar para ver tus estadísticas</Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-5">
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Seguimiento {viewMode === 'daily' ? 'Diario' : viewMode === 'weekly' ? 'Semanal' : 'Mensual'}
        </Text>
        
        {data.map((item, index) => (
          <View key={index} className="bg-[#202938] rounded-xl p-4 mb-3">
            {viewMode === 'daily' && (
              <>
                <Text className="text-white text-lg font-bold mb-2">
                  {formatDate((item as StepRecord).date)}
                </Text>
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-300">Pasos: {(item as StepRecord).steps.toLocaleString()}</Text>
                    <Text className="text-gray-300">Distancia: {(item as StepRecord).distance.toFixed(2)} km</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-300">Tiempo: {formatTime((item as StepRecord).time)}</Text>
                    <Text className="text-gray-300">Calorías: {(item as StepRecord).calories}</Text>
                  </View>
                </View>
              </>
            )}
            
            {viewMode === 'weekly' && (
              <>
                <Text className="text-white text-lg font-bold mb-2">
                  Semana {formatWeek((item as any).week)}
                </Text>
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-300">Total: {(item as any).totalSteps.toLocaleString()} pasos</Text>
                    <Text className="text-gray-300">Promedio: {(item as any).avgSteps.toLocaleString()} pasos/día</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-300">Distancia: {(item as any).totalDistance.toFixed(2)} km</Text>
                    <Text className="text-gray-300">Tiempo: {formatTime((item as any).totalTime)}</Text>
                  </View>
                </View>
              </>
            )}
            
            {viewMode === 'monthly' && (
              <>
                <Text className="text-white text-lg font-bold mb-2">
                  {formatMonth((item as any).month)}
                </Text>
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-300">Total: {(item as any).totalSteps.toLocaleString()} pasos</Text>
                    <Text className="text-gray-300">Promedio: {(item as any).avgSteps.toLocaleString()} pasos/día</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-300">Distancia: {(item as any).totalDistance.toFixed(2)} km</Text>
                    <Text className="text-gray-300">Tiempo: {formatTime((item as any).totalTime)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        ))}
      </ScrollView>
    );
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

          {/* Botones de navegación */}
          <View className="flex-row justify-around w-full px-4 mb-4">
            <TouchableOpacity
              className={`px-3 py-2 rounded-full ${viewMode === 'tracker' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onPress={() => handleViewChange('tracker')}
            >
              <Text className="text-white text-sm">Contador</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-2 rounded-full ${viewMode === 'daily' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onPress={() => handleViewChange('daily')}
            >
              <Text className="text-white text-sm">Diario</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-2 rounded-full ${viewMode === 'weekly' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onPress={() => handleViewChange('weekly')}
            >
              <Text className="text-white text-sm">Semanal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-2 rounded-full ${viewMode === 'monthly' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onPress={() => handleViewChange('monthly')}
            >
              <Text className="text-white text-sm">Mensual</Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'tracker' ? (
            <>
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
                  {'\n'}✓ Seguimiento automático por día, semana y mes
                </Text>
              </View>
            </>
          ) : (
            renderStatsView()
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cardiocaminar;