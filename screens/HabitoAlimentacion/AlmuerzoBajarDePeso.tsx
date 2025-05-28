import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import WeeklyCalendar from 'Componentes/WeeklyCalendar';

// Define the navigation stack's param list
type RootStackParamList = {
  BajarDePeso: undefined;
  DesayunoBajarDePeso: undefined;
  AlmuerzoBajarDePeso: undefined;
  CenaBajarDePeso: undefined;
};

// Define navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  weightGoal?: number;
}

interface MealPlan {
  title: string;
  description: string;
  meals: string[];
}

export default function AlmuerzoBajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight loss goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan de Almuerzo: Pérdida de 1-5 kg',
      description: 'Un plan equilibrado con porciones moderadas, enfocado en nutrientes y saciedad.',
      meals: [
        'Ensalada de pollo a la plancha con quinoa (150 g de pollo, 100 g de quinoa cocida, lechuga, tomate)',
        'Pescado al horno con vegetales asados (150 g de pescado blanco, 200 g de calabacín y zanahoria)',
        'Wrap integral con pechuga de pavo y aguacate (1 tortilla integral, 100 g de pavo, 1/4 de aguacate)',
      ],
    },
    '6-10': {
      title: 'Plan de Almuerzo: Pérdida de 6-10 kg',
      description: 'Un plan con mayor control calórico, priorizando proteínas magras y vegetales.',
      meals: [
        'Pechuga de pollo a la plancha con brócoli al vapor (150 g de pollo, 200 g de brócoli)',
        'Salmón a la parrilla con ensalada verde (120 g de salmón, lechuga, espinacas, pepino)',
        'Lentejas con vegetales (100 g de lentejas cocidas, zanahoria, calabacín, sin aceite adicional)',
      ],
    },
    '11-15': {
      title: 'Plan de Almuerzo: Pérdida de 11-15 kg',
      description: 'Un plan más estricto con énfasis en fibra y reducción de carbohidratos simples.',
      meals: [
        'Ensalada de atún con espinacas y garbanzos (100 g de atún al natural, 1 taza de espinacas, 50 g de garbanzos)',
        'Pollo al horno con coliflor asada (120 g de pollo, 200 g de coliflor)',
        'Tofu salteado con vegetales bajos en carbohidratos (100 g de tofu, brócoli, pimientos)',
      ],
    },
    '16-20': {
      title: 'Plan de Almuerzo: Pérdida de 16-20 kg',
      description: 'Un plan riguroso con alimentos bajos en calorías y alta saciedad.',
      meals: [
        'Ensalada de espinacas con huevo cocido (1 taza de espinacas, 2 huevos cocidos, pepino)',
        'Pescado al vapor con espárragos (100 g de pescado blanco, 150 g de espárragos)',
        'Calabacín relleno con carne magra (100 g de carne molida de pavo, 1 calabacín mediano)',
      ],
    },
  };

  useEffect(() => {
    console.log('Cargando pantalla AlmuerzoBajarDePeso');
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserData;
            console.log('Datos del usuario:', data);
            setUserData(data);
            // Determine the meal plan based on weight goal
            if (data.weightGoal) {
              if (data.weightGoal >= 1 && data.weightGoal <= 5) {
                setMealPlan(mealPlans['1-5']);
              } else if (data.weightGoal >= 6 && data.weightGoal <= 10) {
                setMealPlan(mealPlans['6-10']);
              } else if (data.weightGoal >= 11 && data.weightGoal <= 15) {
                setMealPlan(mealPlans['11-15']);
              } else if (data.weightGoal >= 16 && data.weightGoal <= 20) {
                setMealPlan(mealPlans['16-20']);
              } else {
                setMealPlan(null);
                console.log('Meta de peso fuera de rango:', data.weightGoal);
              }
            }
          } else {
            console.log('No se encontraron datos del usuario');
          }
          setLoading(false);
        }, (error) => {
          console.error('Error en onSnapshot:', error);
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        console.log('Usuario no autenticado');
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-6">
      <View className="py-12 items-center">
        <Text className="text-white text-3xl font-bold">Almuerzo para Bajar de Peso</Text>
      </View>

      {userData?.weightGoal ? (
        <ScrollView>
          <View className="bg-gray-800 rounded-2xl p-6 mb-6">
            <Text className="text-white text-xl font-semibold mb-2">
              {mealPlan ? mealPlan.title : 'Meta no válida'}
            </Text>
            <Text className="text-white mb-4">
              {mealPlan
                ? mealPlan.description
                : 'Por favor, establece una meta de peso entre 1 y 20 kg.'}
            </Text>
          </View>
          {mealPlan && <WeeklyCalendar meals={mealPlan.meals} />}
        </ScrollView>
      ) : (
        <View className="bg-gray-800 rounded-2xl p-6">
          <Text className="text-white text-lg">
            Por favor, establece una meta de peso en la pantalla anterior.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}