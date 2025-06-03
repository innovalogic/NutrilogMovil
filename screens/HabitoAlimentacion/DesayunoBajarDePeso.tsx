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

// Componente de icono personalizado
const Icon = ({ name, size = 24, color = '#FFFFFF' }: { name: string; size?: number; color?: string }) => {
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
const StatCard = ({ icon, value, label, color = 'bg-gray-700' }: {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}) => (
  <View className={`${color} rounded-2xl p-4 flex-1 mx-1`}>
    <View className="items-center">
      <Icon name={icon} size={24} />
      <Text className="text-white text-xl font-bold mt-2">{value}</Text>
      <Text className="text-gray-300 text-sm text-center">{label}</Text>
    </View>
  </View>
);

// Componente de meal card
const MealCard = ({ meal, index }: { meal: string; index: number }) => {
  const colors = ['bg-green-600', 'bg-blue-600', 'bg-purple-600'];
  const bgColor = colors[index % colors.length];
  
  return (
    <View className={`${bgColor} rounded-2xl p-4 mb-4 shadow-lg`}>
      <View className="flex-row items-start">
        <View className="bg-white/20 rounded-full p-2 mr-3">
          <Text className="text-white font-bold">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-base leading-6">{meal}</Text>
        </View>
      </View>
    </View>
  );
};

export default function DesayunoBajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation<NavigationProp>();

  // Define meal plans based on weight loss goals
  const mealPlans: { [key: string]: MealPlan } = {
    '1-5': {
      title: 'Plan Equilibrado',
      description: 'Desayunos nutritivos y balanceados para una pérdida de peso saludable y sostenible.',
      calories: '300-400 cal',
      difficulty: 'Fácil',
      meals: [
        '🥣 Avena con leche descremada y frutas frescas (150g avena, 200ml leche, 100g fresas)',
        '🥛 Yogur griego bajo en grasa con semillas de chía y manzana (150g yogur, 1 cda chía)',
        '🍞 Tostada integral con aguacate y huevo cocido (1 rebanada pan, 1/4 aguacate, 1 huevo)',
      ],
      tips: [
        'Bebe agua tibia con limón al despertar',
        'Mastica lentamente para mejor digestión',
        'Evita azúcares añadidos en las frutas'
      ]
    },
    '6-10': {
      title: 'Plan Proteico',
      description: 'Mayor control calórico con énfasis en proteínas magras para acelerar el metabolismo.',
      calories: '250-350 cal',
      difficulty: 'Moderado',
      meals: [
        '🥤 Batido de proteínas con espinacas, plátano y leche de almendras (1 scoop proteína, 1 taza espinacas, 1 plátano)',
        '🍳 Claras de huevo con espinacas y tomate (3 claras, 1 taza espinacas, 1/2 tomate)',
        '🧀 Pan integral con queso cottage bajo en grasa y pepino (1 rebanada, 100g cottage, 1/2 pepino)',
      ],
      tips: [
        'Prepara batidos la noche anterior',
        'Usa especias para dar sabor sin calorías',
        'Combina siempre proteína con vegetales'
      ]
    },
    '11-15': {
      title: 'Plan Intensivo',
      description: 'Alimentos ricos en fibra y bajos en carbohidratos refinados para resultados más rápidos.',
      calories: '200-300 cal',
      difficulty: 'Avanzado',
      meals: [
        '🥬 Batido verde con kale, manzana y proteína en polvo (1 taza kale, 1 manzana, 1 scoop proteína)',
        '🍄 Omelette de claras con champiñones y espinacas (4 claras, 100g champiñones, 1 taza espinacas)',
        '🫐 Yogur natural bajo en grasa con frutos rojos y linaza (150g yogur, 100g frutos rojos, 1 cda linaza)',
      ],
      tips: [
        'Aumenta gradualmente los vegetales verdes',
        'Bebe té verde 30 min antes de comer',
        'Mantén horarios regulares de comida'
      ]
    },
    '16-20': {
      title: 'Plan Extremo',
      description: 'Enfoque riguroso en alimentos saciantes y muy bajos en calorías para máximos resultados.',
      calories: '150-250 cal',
      difficulty: 'Experto',
      meals: [
        '🥒 Batido de espinacas, pepino y proteína sin azúcar (1 taza espinacas, 1/2 pepino, 1 scoop proteína)',
        '🥚 Huevo cocido con espárragos al vapor (2 huevos, 100g espárragos)',
        '🍵 Té verde con pan integral y queso fresco bajo en grasa (1 rebanada pan, 50g queso fresco)',
      ],
      tips: [
        'Consulta con un nutricionista',
        'Toma suplementos vitamínicos',
        'Monitorea tu energía diariamente'
      ]
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
            
            // Animate content appearance
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
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
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white mt-4 text-lg">Preparando tu plan de desayuno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="bg-green-600 pt-12 pb-8 px-6 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-white/20 rounded-full p-2"
            >
              <Icon name="back" size={24} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Icon name="breakfast" size={32} />
              <Text className="text-white text-2xl font-bold mt-2">Desayuno Saludable</Text>
              <Text className="text-green-200 text-base">Comienza el día con energía</Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        <View className="px-6 mt-6">
          {userData?.weightGoal ? (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Stats Section */}
              <View className="flex-row mb-6">
                <StatCard 
                  icon="target" 
                  value={`${userData.weightGoal} kg`} 
                  label="Meta de Peso" 
                  color="bg-purple-600"
                />
                <StatCard 
                  icon="fire" 
                  value={userData.currentStreak || 0} 
                  label="Días Seguidos" 
                  color="bg-orange-600"
                />
                <StatCard 
                  icon="check" 
                  value={userData.totalBreakfasts || 0} 
                  label="Desayunos" 
                  color="bg-green-600"
                />
              </View>

              {/* Plan Info Card */}
              {mealPlan && (
                <View className="bg-gray-800 rounded-3xl p-6 mb-6 border border-gray-700">
                  <View className="flex-row items-center justify-between mb-4">
                    <View>
                      <Text className="text-white text-xl font-bold">{mealPlan.title}</Text>
                      <Text className="text-gray-400 text-sm mt-1">
                        <Icon name="chef" size={16} /> Plan personalizado para ti
                      </Text>
                    </View>
                    <View className="items-center">
                      <Icon name="star" size={28} color="#F59E0B" />
                      <Text className="text-yellow-400 text-xs">{mealPlan.difficulty}</Text>
                    </View>
                  </View>

                  <Text className="text-gray-300 text-base leading-6 mb-4">
                    {mealPlan.description}
                  </Text>

                  <View className="flex-row justify-between">
                    <View className="bg-blue-600 rounded-xl px-4 py-2">
                      <Text className="text-white text-sm font-medium">
                        <Icon name="apple" size={14} /> {mealPlan.calories}
                      </Text>
                    </View>
                    <View className="bg-green-600 rounded-xl px-4 py-2">
                      <Text className="text-white text-sm font-medium">
                        <Icon name="clock" size={14} /> 10-15 min
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Meal Options */}
              {mealPlan && (
                <View className="mb-6">
                  <Text className="text-white text-xl font-bold mb-4 text-center">
                    🍽️ Opciones de Desayuno
                  </Text>
                  {mealPlan.meals.map((meal, index) => (
                    <MealCard key={index} meal={meal} index={index} />
                  ))}
                </View>
              )}

              {/* Tips Section */}
              {mealPlan?.tips && (
                <View className="bg-indigo-800 rounded-2xl p-6 mb-6 border border-indigo-600">
                  <View className="flex-row items-center mb-4">
                    <Icon name="lightbulb" size={24} color="#F59E0B" />
                    <Text className="text-white text-lg font-bold ml-2">Consejos Pro</Text>
                  </View>
                  {mealPlan.tips.map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-indigo-300 mr-2">•</Text>
                      <Text className="text-indigo-200 text-sm flex-1 leading-5">{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Weekly Calendar */}
              {mealPlan && (
                <View className="bg-gray-800 rounded-2xl p-4 mb-6">
                  <Text className="text-white text-lg font-bold mb-4 text-center">
                    📅 Planificador Semanal
                  </Text>
                  <WeeklyCalendar meals={mealPlan.meals} />
                </View>
              )}

              {/* Motivation Card */}
              <View className="bg-green-800 rounded-2xl p-6 mb-6">
                <Text className="text-white text-lg font-bold mb-2 text-center">
                  🌟 Motivación del Día
                </Text>
                <Text className="text-green-200 text-center text-base leading-6">
                  "Un desayuno saludable es el primer paso hacia tus metas. ¡Cada día es una nueva oportunidad para cuidarte!"
                </Text>
              </View>
            </Animated.View>
          ) : (
            /* No Goal Set */
            <View className="bg-gray-800 rounded-3xl p-8 items-center">
              <Icon name="target" size={48} color="#EF4444" />
              <Text className="text-white text-xl font-bold mt-4 mb-2 text-center">
                Meta No Establecida
              </Text>
              <Text className="text-gray-400 text-center text-base leading-6 mb-6">
                Para obtener tu plan personalizado de desayuno, primero necesitas establecer tu meta de peso en la pantalla principal.
              </Text>
              <TouchableOpacity
                className="bg-blue-500 py-3 px-6 rounded-2xl"
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