import React, { useState, useEffect } from 'react';
import {View,Text,SafeAreaView,ActivityIndicator,ScrollView} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import ProgresoAlimentacion from './HabitoAlimentacion/ProgresoAlimentacion';
import BottomNavBar from '../Componentes/BottomNavBar';
import ProgresoYoga from './HabitoEjercicioFisico/ProgresoYoga';
import ProgresoOrigami from './HabitoSaludMental/ProgresoOrigami';
import ProgresoAudioInspira from './HabitoSaludMental/ProgresoAudioInspira';

interface UserData {
  weightGoal?: number;
  weight?: string;
  breakfastReminder?: string;
  lunchReminder?: string;
  dinnerReminder?: string;
  currentStreak?: number;
  totalDaysTracked?: number;
}

const motivationalMessages = [
  "Cada pequeño paso cuenta. ¡Sigue adelante!",
  "La constancia es el secreto del éxito. ¡Tú puedes!",
  "Hoy es un gran día para seguir progresando.",
  "Los hábitos saludables son regalos que te haces a ti mismo.",
  "Celebra cada victoria, por pequeña que sea.",
  "Tu dedicación de hoy construye tu éxito de mañana.",
  "El progreso no es lineal, cada esfuerzo suma.",
  "Eres más fuerte de lo que crees. ¡Sigue así!",
  "La disciplina es elegir lo que quieres más sobre lo que quieres ahora.",
  "Cada día es una nueva oportunidad para ser mejor.",
  "Tu mente es tu aliada más poderosa. Cuídala con audios que inspiren.",
  "La música y los sonidos correctos pueden transformar tu día.",
  "Cada audio que escuchas es una inversión en tu bienestar mental."
];

export default function SeguimientoScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasDietHabit, setHasDietHabit] = useState(false);
  const [hasAnyHabit, setHasAnyHabit] = useState(false);
  const [habitoYoga, sethabitoYoga] = useState(false);
  const [habitoOrigami, setHabitoOrigami] = useState(false);
  const [habitoAudioInspira, setHabitoAudioInspira] = useState(false); // Nuevo estado
  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    // Seleccionar un mensaje motivacional aleatorio al cargar
    setRandomMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Verificar si tiene hábitos registrados
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
        sethabitoYoga(false);
        setHabitoOrigami(false);
        setHabitoAudioInspira(false);
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

      // Verificar hábitos de Yoga
      const habitosFisicos = collection(firestore, 'users', userId, 'ejerciciosYoga');
      const capturarFisicos = await getDocs(habitosFisicos);
      const hasYoga = capturarFisicos.size > 0;
      sethabitoYoga(hasYoga);

      // Verificar hábitos de Origami
      const habitosOrigami = collection(firestore, 'users', userId, 'origamisCompletados');
      const capturarOrigami = await getDocs(habitosOrigami);
      const hasOrigami = capturarOrigami.size > 0;
      setHabitoOrigami(hasOrigami);

      // Verificar hábitos de Audio Inspira
      const habitosAudioInspira = collection(firestore, 'users', userId, 'audioInspira');
      const capturarAudioInspira = await getDocs(habitosAudioInspira);
      let hasAudioInspira = false;
      
      // Verificar si hay al menos un audio en cualquier categoría
      for (const categoriaDoc of capturarAudioInspira.docs) {
        const audiosRef = collection(firestore, 'users', userId, 'audioInspira', categoriaDoc.id, 'audios');
        const audiosSnapshot = await getDocs(audiosRef);
        if (audiosSnapshot.size > 0) {
          hasAudioInspira = true;
          break;
        }
      }
      setHabitoAudioInspira(hasAudioInspira);
      
      // Verificar si tiene cualquier hábito registrado
      const hasAny = alimenticiosSnapshot.size > 0 || hasYoga || hasOrigami || hasAudioInspira;
      setHasAnyHabit(hasAny);

    } catch (error) {
      console.error('Error al verificar hábitos:', error);
      setHasDietHabit(false);
      setHasAnyHabit(false);
      sethabitoYoga(false);
      setHabitoOrigami(false);
      setHabitoAudioInspira(false);
    }
  };

  // Verificar hábitos cuando la pantalla se enfoque
  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (user) {
        checkHabits(user.uid);
        // Cambiar el mensaje motivacional cada vez que se enfoca la pantalla
        setRandomMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
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
          {/* Mensaje motivacional */}
          <View className="bg-indigo-800 rounded-3xl p-6 mb-6 shadow-2xl border border-indigo-700">
            <Text className="text-white text-xl font-bold mb-2">💪 Motivación del día</Text>
            <Text className="text-gray-100 text-lg italic">"{randomMessage}"</Text>
          </View>

          {/* Componente de Progreso Alimentación - Solo si tiene hábito de dieta */}
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

          {/* Progreso de Yoga */}
          {habitoYoga && (
            <ProgresoYoga />
          )}

          {/* Progreso de Origami */}
          {habitoOrigami && (
            <ProgresoOrigami />
          )}

          {/* Progreso de Audio Inspira */}
          {habitoAudioInspira && (
            <ProgresoAudioInspira />
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

          {/* Consejo saludable actualizado */}
          <View className="bg-teal-800 rounded-3xl p-6 mb-6 shadow-2xl border border-teal-700">
            <Text className="text-white text-xl font-bold mb-4">🌿 Consejo Saludable</Text>
            <Text className="text-gray-100 text-base">
              Recuerda que pequeños cambios consistentes llevan a grandes resultados. 
              Hoy es un buen día para beber más agua, mover tu cuerpo, crear algo hermoso con tus manos, 
              y nutrir tu mente con audios que te inspiren y calmen.
            </Text>
          </View>
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}