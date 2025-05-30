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

export default function AlmuerzoSubirDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight gain goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan de Almuerzo: Aumento de 1-5 kg',
      description: 'Un plan equilibrado con porciones ricas en nutrientes para favorecer un aumento de peso saludable.',
      meals: [
        'Wrap de pollo con aguacate y frijoles (150 g de pollo, 1 tortilla, 1/4 de aguacate)',
        'Pasta integral con salsa de tomate y atún (100 g de pasta, 120 g de atún)',
        'Ensalada de garbanzos con vegetales y aceite de oliva (100 g de garbanzos, tomate, pepino)',
      ],
    },
    '6-10': {
      title: 'Plan de Almuerzo: Aumento de 6-10 kg',
      description: 'Un plan con mayor enfoque en proteínas y calorías para un aumento de peso efectivo.',
      meals: [
        'Pechuga de pollo al horno con arroz integral y brócoli (200 g de pollo, 150 g de arroz, 100 g de brócoli)',
        'Salmón a la plancha con quinoa y espinacas (150 g de salmón, 100 g de quinoa)',
        'Tortilla de huevos con espinacas y queso (3 huevos, 100 g de espinacas, 50 g de queso)',
      ],
    },
    '11-15': {
      title: 'Plan de Almuerzo: Aumento de 11-15 kg',
      description: 'Un plan sustancial para aquellos que buscan un aumento de peso más significativo.',
      meals: [
        'Hamburguesa de carne magra con pan integral y batata (150 g de carne, 1 pan integral, 100 g de batata)',
        'Tazón de arroz con pollo y aguacate (150 g de pollo, 200 g de arroz, 1/2 aguacate)',
        'Pasta con pesto, pollo y nueces (100 g de pasta, 150 g de pollo, 30 g de nueces)',
      ],
    },
    '16-20': {
      title: 'Plan de Almuerzo: Aumento de 16-20 kg',
      description: 'Un plan riguroso con enfoque en alimentos densos en calorías y nutrientes.',
      meals: [
        'Bowl de quinoa con salmón y aguacate (150 g de salmón, 200 g de quinoa, 1/2 aguacate)',
        'Ensalada de pollo con nueces y aderezo de aceite de oliva (200 g de pollo, 30 g de nueces)',
        'Fajitas de carne con pimientos y tortillas de harina (150 g de carne, 2 tortillas, 100 g de pimientos)',
      ],
    },
  };

  useEffect(() => {
    console.log('Cargando pantalla AlmuerzoSubirDePeso');
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
        <Text className="text-white text-3xl font-bold">Almuerzo para Subir de Peso</Text>
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