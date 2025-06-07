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
  totalBreakfasts?: number;
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

// Componente de icono personalizado (usando emojis por simplicidad)
const Icon = ({ name, size = 24, color = '#1F2A44' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: string } = {
    breakfast: '🍳',
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
  const colors = ['bg-yellow-50', 'bg-orange-50', 'bg-gray-50'];
  const bgColor = colors[index % colors.length];
  
  return (
    <View className={`${bgColor} rounded-xl p-4 mb-4 shadow-sm border border-gray-200`}>
      <View className="flex-row items-start">
        <View className="bg-yellow-100 rounded-full p-2 mr-3">
          <Text className="text-yellow-900 font-semibold">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 text-sm leading-5">{meal}</Text>
        </View>
      </View>
    </View>
  );
};

export default function DesayunoSubirDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight gain goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-2': {
      title: 'Plan Hipercalórico',
      description: 'Desayunos energéticos y nutritivos para ayudarte a ganar peso de manera saludable y sostenida.',
      calories: '500-600 cal',
      difficulty: 'Fácil',
      meals: [
        '🥞 Panqueques de avena con plátano, miel y nueces (2 panqueques, 1 plátano, 1 cda miel, 20g nueces)',
        '🍞 Tostadas integrales con mantequilla de maní y rodajas de plátano (2 rebanadas, 2 cdas mantequilla de maní, 1 plátano)',
        '🥚 Huevos revueltos con queso y jamón, más un vaso de leche entera (2 huevos, 30g queso, 30g jamón, 200ml leche)',
      ],
      tips: [
        'Incluye frutos secos o semillas en tus desayunos para sumar calorías saludables',
        'Prefiere leche entera o yogur griego para más aporte energético',
        'Acompaña siempre tu desayuno con una fruta',
      ]
    },
    '3-4': {
      title: 'Plan Proteico-Energético',
      description: 'Desayunos con alto aporte de proteínas y carbohidratos para favorecer el aumento de masa muscular.',
      calories: '600-700 cal',
      difficulty: 'Moderado',
      meals: [
        '🥣 Avena cocida con leche entera, pasas, almendras y miel (60g avena, 200ml leche, 20g pasas, 20g almendras, 1 cda miel)',
        '🍳 Omelette de 2 huevos con queso, jamón y pan integral (2 huevos, 30g queso, 30g jamón, 2 rebanadas pan)',
        '🥛 Batido de plátano, leche entera, cacahuate y cacao (1 plátano, 200ml leche, 1 cda cacahuate, 1 cda cacao)',
      ],
      tips: [
        'No te saltes el desayuno, es clave para tu objetivo',
        'Añade mantequilla de maní o crema de frutos secos a tus tostadas',
        'Elige panes integrales para un aporte sostenido de energía',
      ]
    },
    '5': {
      title: 'Plan Súper Energético',
      description: 'Desayunos muy calóricos y completos para quienes buscan un aumento de peso más rápido.',
      calories: '700-800 cal',
      difficulty: 'Avanzado',
      meals: [
        '🥯 Bagel con queso crema, salmón ahumado y aguacate (1 bagel, 40g queso crema, 50g salmón, 1/2 aguacate)',
        '🍫 Tostadas francesas con mantequilla y mermelada, más vaso de leche entera (2 tostadas, 1 cda mantequilla, 1 cda mermelada, 200ml leche)',
        '🥤 Batido hipercalórico: leche entera, avena, plátano, chocolate y nueces (200ml leche, 40g avena, 1 plátano, 1 cda cacao, 20g nueces)',
      ],
      tips: [
        'Aumenta gradualmente las porciones si te cuesta terminar el desayuno',
        'Incluye siempre una fuente de proteína y una de grasa saludable',
        'Si tienes poco apetito por la mañana, opta por batidos energéticos',
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
            
            // Determine the meal plan based on weight gain goal
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
          <Text className="text-gray-100 mt-4 text-base font-medium">Preparando tu plan de desayuno...</Text>
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
        <View className="bg-yellow-900 pt-12 pb-8 px-6 rounded-b-2xl shadow-md">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-yellow-800/30 rounded-full p-2"
            >
              <Icon name="back" size={20} color="#F5F5F5" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Icon name="breakfast" size={28} color="#F5F5F5" />
              <Text className="text-gray-100 text-xl font-semibold mt-2">Desayuno Energético</Text>
              <Text className="text-gray-300 text-sm">Comienza el día sumando energía</Text>
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
                  color="bg-yellow-50"
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
                    <View className="bg-yellow-100 rounded-lg px-4 py-2">
                      <Text className="text-yellow-900 text-xs font-medium">
                        <Icon name="apple" size={12} color="#1F2A44" /> {mealPlan.calories}
                      </Text>
                    </View>
                    <View className="bg-orange-100 rounded-lg px-4 py-2">
                      <Text className="text-orange-900 text-xs font-medium">
                        <Icon name="clock" size={12} color="#1F2A44" /> 10-15 min
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Meal Options */}
              {mealPlan && (
                <View className="mb-6">
                  <Text className="text-gray-100 text-lg font-semibold mb-4 text-center">
                    🍽️ Opciones de Desayuno
                  </Text>
                  {mealPlan.meals.map((meal, index) => (
                    <MealCard key={index} meal={meal} index={index} />
                  ))}
                </View>
              )}

              {/* Tips Section */}
              {mealPlan?.tips && (
                <View className="bg-orange-50 rounded-2xl p-6 mb-6 border border-orange-100">
                  <View className="flex-row items-center mb-4">
                    <Icon name="lightbulb" size={24} />
                    <Text className="text-orange-900 text-lg font-semibold ml-2">Consejos Útiles</Text>
                  </View>
                  {mealPlan.tips.map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-orange-600 mr-2">•</Text>
                      <Text className="text-orange-700 text-sm flex-1 leading-5">{tip}</Text>
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
              <View className="bg-yellow-50 rounded-2xl p-6 mb-6 border border-yellow-100">
                <Text className="text-yellow-900 text-lg font-semibold mb-2 text-center">
                  🌟 Motivación del Día
                </Text>
                <Text className="text-yellow-700 text-center text-sm leading-6">
                  "Cada desayuno es una oportunidad para acercarte a tu meta. ¡Suma energía y sigue avanzando!"
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
                Para obtener tu plan personalizado de desayuno, primero necesitas establecer tu meta de peso en la pantalla principal.
              </Text>
              <TouchableOpacity
                className="bg-yellow-600 py-3 px-6 rounded-lg shadow-sm"
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
