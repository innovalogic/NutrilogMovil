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

export default function CenaBajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight loss goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan de Cena: Pérdida de 1-5 kg',
      description: 'Un plan ligero para la cena, enfocado en mantener un déficit calórico moderado con alimentos nutritivos.',
      meals: [
        'Ensalada de quinoa con vegetales y atún (100 g de quinoa cocida, lechuga, tomate, 100 g de atún al natural)',
        'Sopa de verduras con pechuga de pollo (200 ml de sopa, 100 g de pollo a la plancha)',
        'Tortilla de claras con espinacas (3 claras, 1 taza de espinacas, pimientos)',
      ],
    },
    '6-10': {
      title: 'Plan de Cena: Pérdida de 6-10 kg',
      description: 'Un plan con mayor control calórico, priorizando proteínas magras y vegetales bajos en carbohidratos.',
      meals: [
        'Ensalada verde con pechuga de pavo (100 g de pavo, espinacas, pepino, sin aderezo calórico)',
        'Pescado al vapor con brócoli (120 g de pescado blanco, 150 g de brócoli al vapor)',
        'Sopa de calabacín sin crema (200 ml de sopa, calabacín, cebolla, especias)',
      ],
    },
    '11-15': {
      title: 'Plan de Cena: Pérdida de 11-15 kg',
      description: 'Un plan estricto con énfasis en alimentos ricos en fibra y muy bajos en calorías.',
      meals: [
        'Ensalada de espinacas con huevo cocido (1 taza de espinacas, 1 huevo cocido, pepino)',
        'Calabacín salteado con tofu (100 g de tofu, 150 g de calabacín, especias)',
        'Sopa de verduras bajas en carbohidratos (200 ml de sopa, coliflor, espinacas)',
      ],
    },
    '16-20': {
      title: 'Plan de Cena: Pérdida de 16-20 kg',
      description: 'Un plan riguroso con comidas muy ligeras para maximizar la pérdida de peso.',
      meals: [
        'Ensalada de lechuga con camarones (100 g de camarones cocidos, lechuga, pepino)',
        'Espárragos al vapor con huevo cocido (150 g de espárragos, 1 huevo cocido)',
        'Caldo de verduras sin grasa (200 ml de caldo, apio, zanahoria, especias)',
      ],
    },
  };

  useEffect(() => {
    console.log('Cargando pantalla CenaBajarDePeso');
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
        <Text className="text-white text-3xl font-bold">Cena para Bajar de Peso</Text>
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