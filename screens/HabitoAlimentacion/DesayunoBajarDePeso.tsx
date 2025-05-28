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

export default function DesayunoBajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight loss goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan de Desayuno: Pérdida de 1-5 kg',
      description: 'Un plan ligero para una pérdida de peso moderada, enfocado en alimentos bajos en calorías pero nutritivos.',
      meals: [
        'Avena con leche descremada y frutas frescas (150 g de avena, 200 ml de leche, 100 g de fresas)',
        'Yogur griego bajo en grasa con semillas de chía y una manzana (150 g de yogur, 1 cucharada de chía)',
        'Tostada integral con aguacate y huevo cocido (1 rebanada de pan integral, 1/4 de aguacate, 1 huevo)',
      ],
    },
    '6-10': {
      title: 'Plan de Desayuno: Pérdida de 6-10 kg',
      description: 'Un plan equilibrado con mayor control calórico y énfasis en proteínas magras.',
      meals: [
        'Batido de proteínas con espinacas, plátano y leche de almendras (1 scoop de proteína, 1 taza de espinacas, 1 plátano)',
        'Claras de huevo con espinacas y tomate (3 claras, 1 taza de espinacas, 1/2 tomate)',
        'Pan integral con queso cottage bajo en grasa y pepino (1 rebanada de pan, 100 g de queso cottage, 1/2 pepino)',
      ],
    },
    '11-15': {
      title: 'Plan de Desayuno: Pérdida de 11-15 kg',
      description: 'Un plan más estricto con alimentos ricos en fibra y bajos en carbohidratos refinados.',
      meals: [
        'Batido verde con kale, manzana y proteína en polvo (1 taza de kale, 1 manzana, 1 scoop de proteína)',
        'Omelette de claras con champiñones y espinacas (4 claras, 100 g de champiñones, 1 taza de espinacas)',
        'Yogur natural bajo en grasa con frutos rojos y linaza (150 g de yogur, 100 g de frutos rojos, 1 cucharada de linaza)',
      ],
    },
    '16-20': {
      title: 'Plan de Desayuno: Pérdida de 16-20 kg',
      description: 'Un plan riguroso con enfoque en alimentos saciantes y muy bajos en calorías.',
      meals: [
        'Batido de espinacas, pepino y proteína sin azúcar (1 taza de espinacas, 1/2 pepino, 1 scoop de proteína)',
        'Huevo cocido con espárragos al vapor (2 huevos, 100 g de espárragos)',
        'Té verde con una rebanada de pan integral y queso fresco bajo en grasa (1 rebanada de pan, 50 g de queso fresco)',
      ],
    },
  };

  useEffect(() => {
    console.log('Cargando pantalla DesayunoBajarDePeso');
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
        <Text className="text-white text-3xl font-bold">Desayuno para Bajar de Peso</Text>
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