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
  totalDinners?: number;
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
    dinner: '🍽️',
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
  const colors = ['bg-blue-50', 'bg-indigo-50', 'bg-purple-50'];
  const bgColor = colors[index % colors.length];
  
  return (
    <View className={`${bgColor} rounded-xl p-4 mb-4 shadow-sm border border-gray-200`}>
      <View className="flex-row items-start">
        <View className="bg-blue-100 rounded-full p-2 mr-3">
          <Text className="text-blue-900 font-semibold">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 text-sm leading-5">{meal}</Text>
        </View>
      </View>
    </View>
  );
};

export default function CenaSubirDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight gain goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan Energético',
      description: 'Cenas ricas en calorías y nutrientes para favorecer el aumento de peso saludable.',
      calories: '500-650 cal',
      difficulty: 'Fácil',
      meals: [
        '🍝 Pasta integral con pollo, crema y aguacate (100g pasta, 100g pollo, 1/2 aguacate, 1 cda crema)',
        '🥪 Sándwich de pan integral con atún, huevo y mayonesa (2 rebanadas pan, 1 lata atún, 1 huevo, 1 cda mayonesa)',
        '🥔 Puré de patata con queso rallado y jamón cocido (200g patata, 30g queso, 50g jamón)',
      ],
      tips: [
        'Añade frutos secos o semillas a tus platos para sumar calorías',
        'Utiliza aceites saludables como oliva o aguacate en preparaciones',
        'Incluye una bebida láctea o batido en la cena para mayor aporte calórico'
      ]
    },
    '6-10': {
      title: 'Plan Equilibrado para Subir de Peso',
      description: 'Cenas completas y balanceadas, con énfasis en proteínas, carbohidratos y grasas saludables.',
      calories: '600-750 cal',
      difficulty: 'Moderado',
      meals: [
        '🍚 Arroz integral con salmón a la plancha y brócoli (100g arroz, 120g salmón, 100g brócoli)',
        '🌮 Tacos de tortilla de trigo con carne magra, queso y guacamole (2 tortillas, 100g carne, 30g queso, 2 cdas guacamole)',
        '🥗 Ensalada de garbanzos con huevo, atún, aguacate y aceite de oliva (100g garbanzos, 1 huevo, 50g atún, 1/2 aguacate)',
      ],
      tips: [
        'No te saltes la cena, es clave para sumar calorías diarias',
        'Aumenta las porciones de carbohidratos complejos en tus platos',
        'Incluye siempre una fuente de proteína y otra de grasa saludable'
      ]
    },
    '11-15': {
      title: 'Plan Intensivo de Masa',
      description: 'Cenas muy densas en energía para favorecer el desarrollo muscular y el aumento de peso.',
      calories: '700-900 cal',
      difficulty: 'Avanzado',
      meals: [
        '🍔 Hamburguesa casera de ternera con pan integral, queso y aguacate (120g ternera, 2 panes, 30g queso, 1/2 aguacate)',
        '🥘 Lasaña de pollo y espinacas con salsa bechamel (150g pollo, 100g pasta, 50g espinaca, 50g bechamel)',
        '🍛 Curry de garbanzos con arroz y frutos secos (100g garbanzos, 100g arroz, 30g frutos secos)',
      ],
      tips: [
        'Puedes añadir una rebanada de pan extra o un postre lácteo para incrementar calorías',
        'No olvides hidratarte bien, pero evita beber mucha agua justo antes de cenar',
        'Entrena fuerza para potenciar el aumento de masa muscular'
      ]
    },
    '16-20': {
      title: 'Plan Extremo para Ganancia Rápida',
      description: 'Cenas muy calóricas y completas para quienes buscan un aumento de peso acelerado.',
      calories: '900-1100 cal',
      difficulty: 'Experto',
      meals: [
        '🍕 Pizza casera con pollo, queso extra y vegetales (2-3 porciones, 150g pollo, 80g queso, vegetales al gusto)',
        '🥩 Filete de res con papas al horno y ensalada de aguacate (150g res, 200g papas, 1/2 aguacate)',
        '🥯 Bagel integral con salmón, queso crema y nueces picadas (1 bagel, 80g salmón, 30g queso, 20g nueces)',
      ],
      tips: [
        'Consulta con un nutricionista si buscas un aumento muy rápido',
        'Incluye snacks nocturnos saludables si tienes hambre después de cenar',
        'Escucha a tu cuerpo y ajusta cantidades según tu progreso'
      ]
    },
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
              }
            }

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
          <Text className="text-gray-100 mt-4 text-base font-medium">Preparando tu plan de cena...</Text>
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
        <View className="bg-blue-900 pt-12 pb-8 px-6 rounded-b-2xl shadow-md">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-blue-800/30 rounded-full p-2"
            >
              <Icon name="back" size={20} color="#F5F5F5" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Icon name="dinner" size={28} color="#F5F5F5" />
              <Text className="text-gray-100 text-xl font-semibold mt-2">Cena para Subir de Peso</Text>
              <Text className="text-gray-300 text-sm">Termina el día sumando energía</Text>
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
                  color="bg-blue-50"
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
                    <View className="bg-blue-100 rounded-lg px-4 py-2">
                      <Text className="text-blue-900 text-xs font-medium">
                        <Icon name="apple" size={12} color="#1F2A44" /> {mealPlan.calories}
                      </Text>
                    </View>
                    <View className="bg-indigo-100 rounded-lg px-4 py-2">
                      <Text className="text-indigo-900 text-xs font-medium">
                        <Icon name="clock" size={12} color="#1F2A44" /> 15-25 min
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Meal Options */}
              {mealPlan && (
                <View className="mb-6">
                  <Text className="text-gray-100 text-lg font-semibold mb-4 text-center">
                    🍽️ Opciones de Cena
                  </Text>
                  {mealPlan.meals.map((meal, index) => (
                    <MealCard key={index} meal={meal} index={index} />
                  ))}
                </View>
              )}

              {/* Tips Section */}
              {mealPlan?.tips && (
                <View className="bg-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100">
                  <View className="flex-row items-center mb-4">
                    <Icon name="lightbulb" size={24} />
                    <Text className="text-indigo-900 text-lg font-semibold ml-2">Consejos Útiles</Text>
                  </View>
                  {mealPlan.tips.map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-indigo-600 mr-2">•</Text>
                      <Text className="text-indigo-700 text-sm flex-1 leading-5">{tip}</Text>
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
              <View className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
                <Text className="text-blue-900 text-lg font-semibold mb-2 text-center">
                  🌟 Motivación del Día
                </Text>
                <Text className="text-blue-700 text-center text-sm leading-6">
                  "Cada cena nutritiva es un paso más hacia tu meta. ¡Suma energía y sigue avanzando!"
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
                Para obtener tu plan personalizado de cena, primero necesitas establecer tu meta de peso en la pantalla principal.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 py-3 px-6 rounded-lg shadow-sm"
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
