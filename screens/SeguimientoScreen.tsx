import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView
} from 'react-native';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import ProgresoAlimentacion from './HabitoAlimentacion/ProgresoAlimentacion';

interface UserData {
  weightGoal?: number;
  weight?: string;
  breakfastReminder?: string;
  lunchReminder?: string;
  dinnerReminder?: string;
  currentStreak?: number;
  totalDaysTracked?: number;
}

export default function SeguimientoScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data() as UserData);
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleGoalUpdated = () => {
    // Opcional: Puedes agregar lógica adicional aquí si necesitas
    // hacer algo cuando se actualiza la meta
    console.log('Meta actualizada exitosamente');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-purple-900 items-center justify-center">
        <View className="items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white mt-4 text-lg">Cargando tu progreso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="bg-purple-600 pt-12 pb-8 px-6 rounded-b-3xl">
          <View className="items-center">
            <Text style={{ fontSize: 32 }}>📊</Text>
            <Text className="text-white text-2xl font-bold mt-2">Seguimiento</Text>
            <Text className="text-purple-200 text-base mt-1">Monitorea tu progreso diario</Text>
          </View>
        </View>

        <View className="px-6 mt-6">
          {/* Componente de Progreso */}
          <ProgresoAlimentacion 
            userData={userData}
            onGoalUpdated={handleGoalUpdated}
          />

          {/* Secciones adicionales */}
          <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">📈 Estadísticas Semanales</Text>
            <Text className="text-gray-400 text-base">
              Próximamente: Gráficos detallados de tu progreso semanal y mensual.
            </Text>
          </View>

          <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">🏆 Logros</Text>
            <Text className="text-gray-400 text-base">
              Próximamente: Sistema de logros y recompensas por tu constancia.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}