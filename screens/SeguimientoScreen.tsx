import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
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
  const [hasDietHabit, setHasDietHabit] = useState(false);
  const [hasAnyHabit, setHasAnyHabit] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Verificar si tiene el hábito de dieta para bajar de peso
        checkHabits(user.uid);
        
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
        setHasDietHabit(false);
        setHasAnyHabit(false);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const checkHabits = async (userId: string) => {
    try {
      // Verificar hábitos alimenticios
      const habitosAlimenticiosRef = collection(firestore, 'habitosUsuarios', userId, 'habitosAlimenticios');
      const alimenticiosSnapshot = await getDocs(habitosAlimenticiosRef);
      
      const hasDiet = alimenticiosSnapshot.docs.some(doc => 
        doc.data().habitoSeleccionado === 'Dieta Para Bajar de Peso'
      );
      
      setHasDietHabit(hasDiet);
      
      // Verificar si tiene cualquier hábito registrado
      const hasAny = alimenticiosSnapshot.size > 0;
      setHasAnyHabit(hasAny);
      
    } catch (error) {
      console.error('Error al verificar hábitos:', error);
      setHasDietHabit(false);
      setHasAnyHabit(false);
    }
  };

  // Verificar hábitos cuando la pantalla se enfoque
  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (user) {
        checkHabits(user.uid);
      }
    }, [])
  );

  const handleGoalUpdated = () => {
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
          {/* Componente de Progreso - Solo si tiene hábito de dieta */}
          {hasDietHabit && (
            <ProgresoAlimentacion 
              userData={userData}
              onGoalUpdated={handleGoalUpdated}
            />
          )}

          {/* Mensaje cuando no hay hábito de dieta pero sí otros hábitos */}
          {!hasDietHabit && hasAnyHabit && (
            <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
              <View className="items-center">
                <Text style={{ fontSize: 48 }}>🍎</Text>
                <Text className="text-white text-xl font-bold mt-4 text-center">
                  Progreso de Alimentación
                </Text>
                <Text className="text-gray-400 text-base mt-2 text-center">
                  Para ver tu progreso de peso específico, registra el hábito "Dieta Para Bajar de Peso" en la sección de Hábitos.
                </Text>
              </View>
            </View>
          )}

          {/* Mensaje cuando no hay ningún hábito registrado */}
          {!hasAnyHabit && (
            <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
              <View className="items-center">
                <Text style={{ fontSize: 48 }}>📝</Text>
                <Text className="text-white text-xl font-bold mt-4 text-center">
                  Comienza tu seguimiento
                </Text>
                <Text className="text-gray-400 text-base mt-2 text-center">
                  Para ver tu progreso, primero registra un hábito en la sección de Hábitos.
                </Text>
              </View>
            </View>
          )}

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