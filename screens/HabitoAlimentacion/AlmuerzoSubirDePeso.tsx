import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
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
  currentStreak?: number;
  totalLunches?: number;
}

interface MealPlan {
  title: string;
  description: string;
  meals: string[];
  calories: string;
  difficulty: string;
  tips: string[];
}

const { width } = Dimensions.get('window');

// Componente de icono personalizado
const Icon = ({ name, size = 24, color = '#1F2A44' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: string } = {
    lunch: '🍽️',
    target: '🎯',
    fire: '🔥',
    apple: '🍎',
    check: '✅',
    star: '⭐',
    clock: '⏰',
    lightbulb: '💡',
    chef: '👨‍🍳',
    healthy: '🥗',
    back: '⬅️'
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '📱'}
    </Text>
  );
};

// Componente de estadística
const StatCard = ({ icon, value, label, color = 'bg-gray-100' }: {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}) => (
  <View className={`${color} rounded-xl p-4 flex-1 mx-2 shadow-sm border border-gray-200`}>
    <View className="items-center">
      <Icon name={icon} size={20} color="#1F2A44" />
      <Text className="text-gray-900 text-lg font-semibold mt-2">{value}</Text>
      <Text className="text-gray-500 text-xs text-center">{label}</Text>
    </View>
  </View>
);

// Componente de meal card
const MealCard = ({ meal, index }: { meal: string; index: number }) => {
  const colors = ['bg-orange-50', 'bg-amber-50', 'bg-yellow-50'];
  const bgColor = colors[index % colors.length];
  
  return (
    <View className={`${bgColor} rounded-xl p-4 mb-4 shadow-sm border border-gray-200`}>
      <View className="flex-row items-start">
        <View className="bg-orange-100 rounded-full p-2 mr-3">
          <Text className="text-orange-900 font-semibold">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 text-sm leading-5">{meal}</Text>
        </View>
      </View>
    </View>
  );
};

export default function AlmuerzoSubirDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight gain goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-2': {
      title: 'Plan Energético',
      description: 'Almuerzos ricos en calorías y nutrientes para ayudarte a ganar peso de forma saludable.',
      calories: '600-700 cal',
      difficulty: 'Fácil',
      meals: [
        '🍚 Arroz integral con pollo al curry y verduras (150g pollo, 120g arroz, 100g verduras, salsa curry suave)',
        '🥩 Bistec de res a la plancha con puré de papas y ensalada de aguacate (120g bistec, 200g papa, 1/2 aguacate)',
        '🍝 Pasta con salsa boloñesa y queso parmesano (100g pasta, 80g carne molida, salsa tomate, 20g queso)',
      ],
      tips: [
        'Añade aceite de oliva extra virgen a tus platos para sumar calorías saludables',
        'Incluye una porción de pan o tortilla para acompañar',
        'No olvides una fruta o jugo natural para completar tu comida'
      ]
    },
    '3-4': {
      title: 'Plan Proteico-Calórico',
      description: 'Almuerzos con mayor aporte de proteínas y grasas saludables para favorecer el aumento de masa muscular.',
      calories: '700-800 cal',
      difficulty: 'Moderado',
      meals: [
        '🍗 Pollo asado con arroz y guacamole (150g pollo, 120g arroz, 1/2 aguacate, tomate, cebolla)',
        '🐟 Salmón a la plancha con papas al vapor y ensalada de quinoa (100g salmón, 150g papa, 60g quinoa)',
        '🥘 Lentejas guisadas con chorizo y arroz (100g lentejas, 50g chorizo, 100g arroz)',
      ],
      tips: [
        'Usa frutos secos o semillas como topping en las ensaladas',
        'Prefiere carnes magras pero no elimines las grasas saludables',
        'Incluye batidos de frutas con leche entera como postre'
      ]
    },
    '5': {
      title: 'Plan Súper Calórico',
      description: 'Almuerzos muy energéticos, ideales para quienes buscan un aumento de peso más rápido.',
      calories: '800-900 cal',
      difficulty: 'Avanzado',
      meals: [
        '🍔 Hamburguesa casera de carne con queso, pan integral y aguacate (100g carne, 1 pan, 1/2 aguacate, 20g queso)',
        '🥓 Pasta carbonara con bacon y huevo (100g pasta, 40g bacon, 1 huevo, salsa carbonara)',
        '🍛 Arroz chaufa con pollo, huevo y verduras (120g arroz, 100g pollo, 1 huevo, 80g verduras)',
      ],
      tips: [
        'Aumenta las porciones si te cuesta llegar a la meta calórica',
        'No temas añadir queso o salsas saludables a tus platos',
        'Si tienes poco apetito, reparte el almuerzo en dos tomas'
      ]
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserData;
            setUserData(data);
            
            // Determine the meal plan based on weight goal
            if (data.weightGoal) {
              if (data.weightGoal >= 1 && data.weightGoal <= 2) {
                setMealPlan(mealPlans['1-2']);
              } else if (data.weightGoal >= 3 && data.weightGoal <= 4) {
                setMealPlan(mealPlans['3-4']);
              } else if (data.weightGoal >= 5) {
                setMealPlan(mealPlans['5']);
              } else {
                setMealPlan(null);
              }
            }

            // Animate content appearance with fade and scale
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              })
            ]).start();
          }
          setLoading(false);
        }, (error) => {
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <View className="items-center">
          <ActivityIndicator size="large" color="#1F2A44" />
          <Text className="text-gray-100 mt-4 text-base font-medium">Preparando tu plan de almuerzo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="bg-orange-900 pt-12 pb-8 px-6 rounded-b-2xl shadow-md">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-orange-800/30 rounded-full p-2"
            >
              <Icon name="back" size={20} color="#F5F5F5" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Icon name="lunch" size={28} color="#F5F5F5" />
              <Text className="text-gray-100 text-xl font-semibold mt-2">Almuerzo Energético</Text>
              <Text className="text-gray-300 text-sm">¡Suma calorías y nutrientes a tu día!</Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        <View className="px-6 mt-6">
          {userData?.weightGoal ? (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              {/* Stats Section */}
              <View className="flex-row mb-6 justify-center">
                <StatCard 
                  icon="target" 
                  value={`${userData.weightGoal} kg`} 
                  label="Meta de Peso" 
                  color="bg-orange-50"
                />
              </View>

              {/* Plan Info Card */}
              {mealPlan && (
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                  <View className="flex-row items-center justify-between mb-4">
                    <View>
                      <Text className="text-gray-900 text-lg font-semibold">{mealPlan.title}</Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        <Icon name="chef" size={14} color="#1F2A44" /> Plan personalizado para ti
                      </Text>
                    </View>
                    <View className="items-center">
                      <Icon name="star" size={24} color="#D4A017" />
                      <Text className="text-gray-600 text-xs">{mealPlan.difficulty}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm leading-6 mb-4">
                    {mealPlan.description}
                  </Text>

                  <View className="flex-row justify-between">
                    <View className="bg-orange-100 rounded-lg px-4 py-2">
                      <Text className="text-orange-900 text-xs font-medium">
                        <Icon name="apple" size={12} color="#1F2A44" /> {mealPlan.calories}
                      </Text>
                    </View>
                    <View className="bg-amber-100 rounded-lg px-4 py-2">
                      <Text className="text-amber-900 text-xs font-medium">
                        <Icon name="clock" size={12} color="#1F2A44" /> 15-20 min
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Meal Options */}
              {mealPlan && (
                <View className="mb-6">
                  <Text className="text-gray-100 text-lg font-semibold mb-4 text-center">
                    🍽️ Opciones de Almuerzo
                  </Text>
                  {mealPlan.meals.map((meal, index) => (
                    <MealCard key={index} meal={meal} index={index} />
                  ))}
                </View>
              )}

              {/* Tips Section */}
              {mealPlan?.tips && (
                <View className="bg-amber-50 rounded-2xl p-6 mb-6 border border-amber-100">
                  <View className="flex-row items-center mb-4">
                    <Icon name="lightbulb" size={24} />
                    <Text className="text-amber-900 text-lg font-semibold ml-2">Consejos Útiles</Text>
                  </View>
                  {mealPlan.tips.map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-amber-600 mr-2">•</Text>
                      <Text className="text-amber-700 text-sm flex-1 leading-5">{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Weekly Calendar */}
              {mealPlan && (
                <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-200">
                  <Text className="text-gray-900 text-lg font-semibold mb-4 text-center">
                    📅 Planificador Semanal
                  </Text>
                  <WeeklyCalendar meals={mealPlan.meals} />
                </View>
              )}

              {/* Motivation Card */}
              <View className="bg-orange-50 rounded-2xl p-6 mb-6 border border-orange-100">
                <Text className="text-orange-900 text-lg font-semibold mb-2 text-center">
                  🌟 Motivación del Día
                </Text>
                <Text className="text-orange-700 text-center text-sm leading-6">
                  "Cada almuerzo completo suma en tu camino. ¡Disfruta, gana energía y acércate a tu meta!"
                </Text>
              </View>
            </Animated.View>
          ) : (
            /* No Goal Set */
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-200">
              <Icon name="target" size={40} color="#EF4444" />
              <Text className="text-gray-900 text-lg font-semibold mt-4 mb-2 text-center">
                Meta No Establecida
              </Text>
              <Text className="text-gray-600 text-center text-sm leading-6 mb-6">
                Para obtener tu plan personalizado de almuerzo, primero necesitas establecer tu meta de peso en la pantalla principal.
              </Text>
              <TouchableOpacity
                className="bg-orange-600 py-3 px-6 rounded-lg shadow-sm"
                onPress={() => navigation.navigate('SubirDePeso')}
              >
                <Text className="text-white font-semibold">Establecer Meta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
