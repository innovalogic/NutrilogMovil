// screens/Habito ejercicio fisico/cardiocaminar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Platform, PermissionsAndroid } from 'react-native';
import { Pedometer } from 'expo-sensors';

const Cardiocaminar = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<'checking' | 'true' | 'false' | 'denied'>('checking');
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const dailyGoal = 10000;

  // Para Android: solicitar permiso de reconocimiento de actividad
  const requestAndroidPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Permiso de actividad física',
          message: 'La app necesita acceder a tu actividad física para contar tus pasos.',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancelar',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error solicitando permiso:', err);
      return false;
    }
  };

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const subscribe = async () => {
      // 1. Android: permiso
      const hasPermission = await requestAndroidPermission();
      if (!hasPermission) {
        setIsPedometerAvailable('denied');
        return;
      }

      // 2. Verificar disponibilidad del podómetro
      const available = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(available) as any);
      if (!available) return;

      // 3. Obtener pasos desde medianoche hasta ahora
      const now = new Date();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      try {
        const { steps: pasosHoy } = await Pedometer.getStepCountAsync(startOfToday, now);
        console.log('Pasos acumulados hoy (getStepCountAsync):', pasosHoy);
        setCurrentStepCount(pasosHoy);
      } catch (err) {
        console.warn('Error en getStepCountAsync:', err);
      }

      // 4. Suscribirse a actualizaciones en batch
      subscription = Pedometer.watchStepCount(result => {
        console.log('Batch de pasos recibido:', result.steps);
        setCurrentStepCount(result.steps);
      });
    };

    subscribe();

    // Cleanup al desmontar
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const progressPercentage = Math.min((currentStepCount / dailyGoal) * 100, 100);

  return (
    <View className="flex-1 bg-blue-200 items-center justify-center p-5">
      <Text className="text-2xl font-bold mb-2">Actividad de Entrenamiento</Text>
      <Text className="text-lg mb-2">
        Podómetro disponible: {isPedometerAvailable}
      </Text>
      <Text className="text-lg mb-2">
        Pasos hoy: {currentStepCount}
      </Text>
      <Text className="text-lg mb-2">
        Meta diaria: {dailyGoal} pasos
      </Text>
      <View className="w-full bg-gray-300 rounded-full h-4 mb-4">
        <View
          className="bg-green-500 rounded-full h-4"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
      <Text className="text-lg">
        Progreso: {progressPercentage.toFixed(1)}%
      </Text>
    </View>
  );
};

export default Cardiocaminar;
