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

export default function CenaSubirDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight gain goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan de Cena: Aumento de 1-5 kg',
      description: 'Un plan ligero y nutritivo para favorecer un aumento de peso saludable.',
      meals: [
        'Tortilla de huevo con espinacas y queso (2 huevos, 100 g de espinacas, 30 g de queso)',
        'Pasta con pollo y brócoli (150 g de pollo, 100 g de pasta, 100 g de brócoli)',
        'Ensalada de garbanzos con atún (100 g de garbanzos, 100 g de atún, vegetales al gusto)',
      ],
    },
    '6-10': {
      title: 'Plan de Cena: Aumento de 6-10 kg',
      description: 'Un plan equilibrado con mayor enfoque en calorías y proteínas.',
      meals: [
        'Salmón a la parrilla con quinoa (150 g de salmón, 100 g de quinoa)',
        'Wrap de pollo y aguacate (150 g de pollo, 1 tortilla, 1/2 aguacate)',
        'Pasta integral con salsa de pesto y pollo (100 g de pasta, 150 g de pollo, 50 g de pesto)',
      ],
    },
    '11-15': {
      title: 'Plan de Cena: Aumento de 11-15 kg',
      description: 'Un plan más sustancial, ideal para quienes buscan aumentar de peso significativamente.',
      meals: [
        'Hamburguesa de carne magra con pan integral y batata (150 g de carne, 1 pan integral, 100 g de batata)',
        'Arroz con pollo y verduras (200 g de pollo, 150 g de arroz, vegetales al gusto)',
        'Tazón de quinoa con verduras y tofu (150 g de quinoa, 100 g de tofu, vegetales variados)',
      ],
    },
    '16-20': {
      title: 'Plan de Cena: Aumento de 16-20 kg',
      description: 'Un plan riguroso con comidas densas en calorías.',
      meals: [
        'Bowl de arroz con carne y aguacate (150 g de carne, 200 g de arroz, 1/2 aguacate)',
        'Tortilla de tres huevos con vegetales (3 huevos, espinacas, pimientos)',
        'Ensalada de pasta con pollo y aderezo de aceite de oliva (100 g de pasta, 150 g de pollo, 30 ml de aceite)',
      ],
    },
  };

  useEffect(() => {
    console.log('Cargando pantalla CenaSubirDePeso');
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
        <Text className="text-white text-3xl font-bold">Cena para Subir de Peso</Text>
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