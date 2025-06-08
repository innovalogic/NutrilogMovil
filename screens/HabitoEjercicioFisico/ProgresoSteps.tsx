import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

interface StepRecord {
  date: string;
  steps: number;
  distance: number;
  time: number;
  calories: number;
}

interface StepStats {
  todaySteps: number;
  weeklyAvg: number;
  monthlyTotal: number;
  bestDay: StepRecord | null;
  recentDays: StepRecord[];
}

const ProgresoSteps = () => {
  const [stepStats, setStepStats] = useState<StepStats>({
    todaySteps: 0,
    weeklyAvg: 0,
    monthlyTotal: 0,
    bestDay: null,
    recentDays: []
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'summary' | 'history'>('summary');

  useEffect(() => {
    loadStepStats();
  }, []);

  const loadStepStats = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      const userId = auth.currentUser.uid;
      const stepHistoryRef = collection(firestore, 'users', userId, 'stepHistory');
      
      // Obtener fecha de hoy
      const today = new Date().toISOString().split('T')[0];
      
      // Obtener datos de hoy
      const todayQuery = query(
        stepHistoryRef,
        where('date', '==', today),
        limit(1)
      );
      const todaySnapshot = await getDocs(todayQuery);
      const todaySteps = todaySnapshot.empty ? 0 : todaySnapshot.docs[0].data().steps;

      // Obtener datos de los últimos 7 días para promedio semanal
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekQuery = query(
        stepHistoryRef,
        where('date', '>=', weekAgo.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );
      const weekSnapshot = await getDocs(weekQuery);
      
      let weeklyTotal = 0;
      let weeklyDays = 0;
      weekSnapshot.forEach(doc => {
        weeklyTotal += doc.data().steps;
        weeklyDays++;
      });
      const weeklyAvg = weeklyDays > 0 ? Math.round(weeklyTotal / weeklyDays) : 0;

      // Obtener datos del mes actual
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthQuery = query(
        stepHistoryRef,
        where('date', '>=', monthStart.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );
      const monthSnapshot = await getDocs(monthQuery);
      
      let monthlyTotal = 0;
      monthSnapshot.forEach(doc => {
        monthlyTotal += doc.data().steps;
      });

      // Obtener el mejor día (máximo de pasos)
      const bestDayQuery = query(
        stepHistoryRef,
        orderBy('steps', 'desc'),
        limit(1)
      );
      const bestDaySnapshot = await getDocs(bestDayQuery);
      const bestDay = bestDaySnapshot.empty ? null : bestDaySnapshot.docs[0].data() as StepRecord;

      // Obtener los últimos 5 días para el historial
      const recentQuery = query(
        stepHistoryRef,
        orderBy('date', 'desc'),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recentDays: StepRecord[] = [];
      recentSnapshot.forEach(doc => {
        recentDays.push(doc.data() as StepRecord);
      });

      setStepStats({
        todaySteps,
        weeklyAvg,
        monthlyTotal,
        bestDay,
        recentDays
      });

    } catch (error) {
      console.error('Error cargando estadísticas de pasos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Hoy';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStepGoalProgress = (steps: number) => {
    const goal = 10000; // Meta por defecto
    const percentage = Math.min((steps / goal) * 100, 100);
    return { percentage, goal };
  };

  if (loading) {
    return (
      <View className="bg-emerald-800 rounded-3xl p-6 mb-6 shadow-2xl border border-emerald-700">
        <View className="items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white text-lg mt-2">Cargando progreso de pasos...</Text>
        </View>
      </View>
    );
  }

  const todayProgress = getStepGoalProgress(stepStats.todaySteps);

  return (
    <View className="bg-emerald-800 rounded-3xl p-6 mb-6 shadow-2xl border border-emerald-700">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text style={{ fontSize: 24 }}>👣</Text>
          <Text className="text-white text-xl font-bold ml-2">Progreso de Pasos</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className={`px-3 py-1 rounded-full mr-2 ${
              viewMode === 'summary' ? 'bg-emerald-600' : 'bg-emerald-900'
            }`}
            onPress={() => setViewMode('summary')}
          >
            <Text className="text-white text-sm">Resumen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-1 rounded-full ${
              viewMode === 'history' ? 'bg-emerald-600' : 'bg-emerald-900'
            }`}
            onPress={() => setViewMode('history')}
          >
            <Text className="text-white text-sm">Historial</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'summary' ? (
        <View>
          {/* Progreso de hoy */}
          <View className="bg-emerald-700 rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-bold mb-2">Hoy</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-emerald-100 text-2xl font-bold">
                {stepStats.todaySteps.toLocaleString()} pasos
              </Text>
              <Text className="text-emerald-200 text-sm">
                {todayProgress.percentage.toFixed(0)}% de meta
              </Text>
            </View>
            <View className="h-2 bg-emerald-900 rounded-full overflow-hidden">
              <View 
                className="h-full bg-emerald-300 rounded-full"
                style={{ width: `${todayProgress.percentage}%` }}
              />
            </View>
          </View>

          {/* Estadísticas generales */}
          <View className="flex-row justify-between">
            <View className="bg-emerald-700 rounded-2xl p-4 flex-1 mr-2">
              <Text className="text-emerald-200 text-sm mb-1">Promedio Semanal</Text>
              <Text className="text-white text-lg font-bold">
                {stepStats.weeklyAvg.toLocaleString()}
              </Text>
              <Text className="text-emerald-200 text-xs">pasos/día</Text>
            </View>
            <View className="bg-emerald-700 rounded-2xl p-4 flex-1 ml-2">
              <Text className="text-emerald-200 text-sm mb-1">Total del Mes</Text>
              <Text className="text-white text-lg font-bold">
                {stepStats.monthlyTotal.toLocaleString()}
              </Text>
              <Text className="text-emerald-200 text-xs">pasos</Text>
            </View>
          </View>

          {/* Mejor día */}
          {stepStats.bestDay && (
            <View className="bg-emerald-700 rounded-2xl p-4 mt-4">
              <Text className="text-emerald-200 text-sm mb-2">🏆 Tu Mejor Día</Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-lg font-bold">
                    {stepStats.bestDay.steps.toLocaleString()} pasos
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    {formatDate(stepStats.bestDay.date)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-emerald-200 text-sm">
                    {stepStats.bestDay.distance.toFixed(2)} km
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    {formatTime(stepStats.bestDay.time)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text className="text-white text-lg font-bold mb-3">Últimos 5 días</Text>
          {stepStats.recentDays.length === 0 ? (
            <View className="bg-emerald-700 rounded-2xl p-6 items-center">
              <Text className="text-emerald-200 text-center">
                No hay datos disponibles.{'\n'}
                Comienza a usar el contador de pasos para ver tu historial.
              </Text>
            </View>
          ) : (
            <ScrollView className="max-h-60">
              {stepStats.recentDays.map((day, index) => {
                const progress = getStepGoalProgress(day.steps);
                return (
                  <View key={index} className="bg-emerald-700 rounded-2xl p-4 mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-white font-bold text-base">
                        {formatDate(day.date)}
                      </Text>
                      <Text className="text-emerald-200 text-sm">
                        {progress.percentage.toFixed(0)}% de meta
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-white text-lg font-bold">
                        {day.steps.toLocaleString()} pasos
                      </Text>
                      <View className="items-end">
                        <Text className="text-emerald-200 text-sm">
                          {day.distance.toFixed(2)} km
                        </Text>
                        <Text className="text-emerald-200 text-sm">
                          {formatTime(day.time)}
                        </Text>
                      </View>
                    </View>
                    <View className="h-1.5 bg-emerald-900 rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-emerald-300 rounded-full"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      <View className="mt-4 pt-4 border-t border-emerald-600">
        <Text className="text-emerald-200 text-sm text-center">
          💡 Ve a la sección "Caminar" para activar el contador de pasos
        </Text>
      </View>
    </View>
  );
};

export default ProgresoSteps;