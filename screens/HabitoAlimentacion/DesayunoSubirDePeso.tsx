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
  SubirDePeso: undefined;
  DesayunoSubirDePeso: undefined;
  AlmuerzoSubirDePeso: undefined;
  CenaSubirDePeso: undefined;
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

export default function DesayunoSubirDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight gain goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan de Desayuno: Aumento de 1-5 kg',
      description: 'Un plan ligero pero nutritivo para un aumento de peso moderado, enfocado en alimentos ricos en calorías.',
      meals: [
        'Tortilla de huevo con espinacas y queso (2 huevos, 100 g de espinacas, 30 g de queso)',
        'Batido de plátano y mantequilla de maní (1 plátano, 2 cucharadas de mantequilla de maní, 200 ml de leche)',
        'Avena con miel y nueces (150 g de avena, 1 cucharada de miel, 30 g de nueces)',
      ],
    },
    '6-10': {
      title: 'Plan de Desayuno: Aumento de 6-10 kg',
      description: 'Un plan equilibrado con mayor control calórico y énfasis en proteínas y carbohidratos saludables.',
      meals: [
        'Batido de proteínas con avena y frutas (1 scoop de proteína, 50 g de avena, 1 taza de frutas variadas)',
        'Pan integral con aguacate y pavo (1 rebanada de pan integral, 1/2 aguacate, 100 g de pavo)',
        'Yogur griego con granola y miel (200 g de yogur, 50 g de granola)',
      ],
    },
    '11-15': {
      title: 'Plan de Desayuno: Aumento de 11-15 kg',
      description: 'Un plan más sustancial con alimentos ricos en calorías y proteínas.',
      meals: [
        'Huevos revueltos con jamón y queso (3 huevos, 50 g de jamón, 30 g de queso)',
        'Tostadas francesas con jarabe de arce (2 rebanadas de pan, 2 huevos, 30 ml de jarabe)',
        'Batido de aguacate y plátano (1 aguacate, 1 plátano, 200 ml de leche)',
      ],
    },
    '16-20': {
      title: 'Plan de Desayuno: Aumento de 16-20 kg',
      description: 'Un plan riguroso con enfoque en alimentos muy calóricos y saciantes.',
      meals: [
        'Smoothie de chocolate y mantequilla de maní (1 scoop de proteína de chocolate, 2 cucharadas de mantequilla de maní, 200 ml de leche)',
        'Pancakes de avena con frutas (100 g de avena, 2 huevos, 100 g de frutas)',
        'Tortilla de tres huevos con vegetales y queso (3 huevos, 100 g de vegetales, 50 g de queso)',
      ],
    },
  };

  useEffect(() => {
    console.log('Cargando pantalla DesayunoSubirDePeso');
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
        <Text className="text-white text-3xl font-bold">Desayuno para Subir de Peso</Text>
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