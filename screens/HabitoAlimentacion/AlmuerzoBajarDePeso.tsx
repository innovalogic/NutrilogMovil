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
  BajarDePeso: undefined;
  DesayunoBajarDePeso: undefined;
  AlmuerzoBajarDePeso: undefined;
  CenaBajarDePeso: undefined;
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

export default function AlmuerzoBajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight loss goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan Equilibrado',
      description: 'Almuerzos nutritivos y balanceados para una pérdida de peso saludable y sostenible.',
      calories: '400-500 cal',
      difficulty: 'Fácil',
      meals: [
        '🥗 Ensalada de pollo a la plancha con quinoa (150g pollo, 100g quinoa cocida, lechuga, tomate)',
        '🐟 Pescado al horno con vegetales asados (150g pescado blanco, 200g calabacín y zanahoria)',
        '🌯 Wrap integral con pechuga de pavo y aguacate (1 tortilla integral, 100g pavo, 1/4 aguacate)',
      ],
      tips: [
        'Usa aderezos bajos en calorías como limón o vinagre',
        'Incorpora una variedad de vegetales coloridos',
        'Controla las porciones para mantener el déficit calórico'
      ]
    },
    '6-10': {
      title: 'Plan Proteico',
      description: 'Mayor control calórico con énfasis en proteínas magras y vegetales para acelerar la pérdida de peso.',
      calories: '300-400 cal',
      difficulty: 'Moderado',
      meals: [
        '🍗 Pechuga de pollo a la plancha con brócoli al vapor (150g pollo, 200g brócoli)',
        '🐟 Salmón a la parrilla con ensalada verde (120g salmón, lechuga, espinacas, pepino)',
        '🥗 Lentejas con vegetales (100g lentejas cocidas, zanahoria, calabacín, sin aceite adicional)',
      ],
      tips: [
        'Prioriza proteínas magras para mantener la masa muscular',
        'Evita salsas o aderezos ricos en grasas',
        'Bebe agua durante la comida para mayor saciedad'
      ]
    },
    '11-15': {
      title: 'Plan Intensivo',
      description: 'Almuerzos ricos en fibra y bajos en carbohidratos refinados para resultados más rápidos.',
      calories: '250-350 cal',
      difficulty: 'Avanzado',
      meals: [
        '🥗 Ensalada de atún con espinacas y garbanzos (100g atún al natural, 1 taza espinacas, 50g garbanzos)',
        '🍗 Pollo al horno con coliflor asada (120g pollo, 200g coliflor)',
        '🥬 Tofu salteado con vegetales bajos en carbohidratos (100g tofu, brócoli, pimientos)',
      ],
      tips: [
        'Aumenta la ingesta de vegetales ricos en fibra',
        'Evita carbohidratos simples como pan blanco o arroz blanco',
        'Planifica tus comidas para mantener la consistencia'
      ]
    },
    '16-20': {
      title: 'Plan Extremo',
      description: 'Enfoque riguroso en almuerzos bajos en calorías y altos en nutrientes para máxima pérdida de peso.',
      calories: '200-300 cal',
      difficulty: 'Experto',
      meals: [
        '🥗 Ensalada de espinacas con huevo cocido (1 taza espinacas, 2 huevos cocidos, pepino)',
        '🐟 Pescado al vapor con espárragos (100g pescado blanco, 150g espárragos)',
        '🥒 Calabacín relleno con carne magra (100g carne molida de pavo, 1 calabacín mediano)',
      ],
      tips: [
        'Consulta con un nutricionista para este plan',
        'Considera suplementos si reduces demasiado las calorías',
        'Mantén horarios regulares para optimizar el metabolismo'
      ]
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
              <Text className="text-gray-100 text-xl font-semibold mt-2">Almuerzo Saludable</Text>
              <Text className="text-gray-300 text-sm">Nutre tu día con equilibrio</Text>
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
                  "Un almuerzo saludable impulsa tu día. ¡Cada elección te lleva más cerca de tu meta!"
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
                onPress={() => navigation.navigate('BajarDePeso')}
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