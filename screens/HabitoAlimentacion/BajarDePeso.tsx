import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Modal, 
  TextInput,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import ReminderButton from 'Componentes/ReminderButton';


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
  weight?: string;
  breakfastReminder?: string;
  lunchReminder?: string;
  dinnerReminder?: string;
  currentStreak?: number;
  totalDaysTracked?: number;
}

const { width } = Dimensions.get('window');

// Componente de icono personalizado
const Icon = ({ name, size = 24, color = '#FFFFFF' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: string } = {
    target: '🎯',
    scale: '⚖️',
    breakfast: '🍳',
    lunch: '🍽️',
    dinner: '🌙',
    trophy: '🏆',
    fire: '🔥',
    chart: '📊'
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '📱'}
    </Text>
  );
};

// Componente de progreso circular simplificado
const CircularProgress = ({ progress, size = 120 }: { 
  progress: number; 
  size?: number; 
}) => {
  return (
    <View 
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: progress > 50 ? '#4F46E5' : progress > 25 ? '#F59E0B' : '#EF4444',
      }}
    >
      <Text className="text-white text-2xl font-bold">{Math.round(progress)}%</Text>
      <Text className="text-gray-300 text-sm">Progreso</Text>
    </View>
  );
};

export default function BajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightGoalInput, setWeightGoalInput] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data() as UserData);
            // Animar la entrada de datos
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }
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

  const calculateProgress = () => {
    if (!userData?.weightGoal || !userData?.weight) return 0;
    const currentWeight = parseFloat(userData.weight);
    const goalWeight = currentWeight - userData.weightGoal;
    // Simulamos progreso basado en días rastreados (esto se puede mejorar con datos reales)
    const daysProgress = (userData.totalDaysTracked || 0) * 2;
    return Math.min(daysProgress, 100);
  };

  const saveWeightGoal = async () => {
    if (!auth.currentUser || !weightGoalInput) return;
    
    try {
      const weightGoal = parseFloat(weightGoalInput);
      if (isNaN(weightGoal)) {
        alert('Ingrese un número válido');
        return;
      }
      if (weightGoal <= 0) {
        alert('La meta debe ser un número positivo mayor a 0');
        return;
      }
      if (weightGoal > 20) {
        alert('La meta no puede ser mayor a 20 kg');
        return;
      }

      await setDoc(doc(firestore, 'users', auth.currentUser.uid), 
        { 
          weightGoal,
          totalDaysTracked: userData?.totalDaysTracked || 0,
          currentStreak: userData?.currentStreak || 0
        }, 
        { merge: true }
      );
      setModalVisible(false);
      setWeightGoalInput('');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleMealPress = (mealType: string) => {
    console.log(`Botón ${mealType} presionado`);
    switch (mealType) {
      case 'Desayuno':
        navigation.navigate('DesayunoBajarDePeso');
        break;
      case 'Almuerzo':
        navigation.navigate('AlmuerzoBajarDePeso');
        break;
      case 'Cena':
        navigation.navigate('CenaBajarDePeso');
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-purple-900 items-center justify-center">
        <View className="items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white mt-4 text-lg">Cargando tu progreso...</Text>
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
        {/* Header con gradiente */}
        <View className="bg-purple-600 pt-12 pb-8 px-6 rounded-b-3xl">
          <View className="items-center">
            <Icon name="target" size={32} />
            <Text className="text-white text-2xl font-bold mt-2">Transformación Personal</Text>
            <Text className="text-purple-200 text-base mt-1">Tu camino hacia una vida más saludable</Text>
          </View>
        </View>

        <View className="px-6 mt-6">
          {/* Card de progreso principal */}
          <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white text-xl font-bold">Tu Progreso</Text>
                <Text className="text-gray-400 text-sm">Sigue así, vas genial! 💪</Text>
              </View>
              <Icon name="chart" size={28} />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="mb-4">
                  <Text className="text-gray-300 text-sm mb-1">Peso Actual</Text>
                  <View className="flex-row items-center">
                    <Icon name="scale" size={20} />
                    <Text className="text-white text-lg font-semibold ml-2">
                      {userData?.weight ? `${userData.weight} kg` : 'No registrado'}
                    </Text>
                  </View>
                </View>
                
                <View className="mb-4">
                  <Text className="text-gray-300 text-sm mb-1">Meta</Text>
                  <Text className="text-purple-400 text-lg font-semibold">
                    {userData?.weightGoal ? `Bajar ${userData.weightGoal} kg` : 'Sin meta definida'}
                  </Text>
                </View>

                {userData?.weightGoal && (
                  <View className="flex-row items-center space-x-4">
                    <View className="items-center">
                      <Icon name="fire" size={18} />
                      <Text className="text-orange-400 text-sm font-medium">
                        {userData?.currentStreak || 0} días
                      </Text>
                      <Text className="text-gray-400 text-xs">Racha</Text>
                    </View>
                    <View className="items-center">
                      <Icon name="trophy" size={18} />
                      <Text className="text-yellow-400 text-sm font-medium">
                        {userData?.totalDaysTracked || 0} días
                      </Text>
                      <Text className="text-gray-400 text-xs">Total</Text>
                    </View>
                  </View>
                )}
              </View>

              {userData?.weightGoal && (
                <View className="ml-4">
                  <CircularProgress progress={calculateProgress()} />
                </View>
              )}
            </View>
            
            <TouchableOpacity
              className="bg-purple-500 py-4 rounded-2xl mt-6 shadow-lg"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white text-center font-bold text-lg">
                {userData?.weightGoal ? '✏️ Cambiar Meta' : '🎯 Establecer Meta'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sección de comidas */}
          {userData?.weightGoal && (
            <Animated.View 
              style={{ opacity: animatedValue }}
              className="mb-6"
            >
              <Text className="text-white text-xl font-bold mb-4 text-center">
                📅 Plan de Alimentación Diario
              </Text>
              
              {[
                { name: 'Desayuno', icon: 'breakfast', color: 'bg-green-500', time: userData?.breakfastReminder },
                { name: 'Almuerzo', icon: 'lunch', color: 'bg-yellow-500', time: userData?.lunchReminder },
                { name: 'Cena', icon: 'dinner', color: 'bg-red-500', time: userData?.dinnerReminder }
              ].map((meal, index) => (
                <View key={meal.name} className="mb-4">
                  <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                      className={`${meal.color} py-4 px-6 rounded-2xl flex-1 shadow-lg`}
                      onPress={() => handleMealPress(meal.name)}
                    >
                      <View className="flex-row items-center justify-center">
                        <Icon name={meal.icon} size={24} />
                        <Text className="text-white text-center font-bold text-lg ml-2">
                          {meal.name}
                        </Text>
                      </View>
                      {meal.time && (
                        <Text className="text-white/80 text-center text-sm mt-1">
                          🔔 {meal.time}
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    <ReminderButton 
                      reminderTime={meal.time} 
                      fieldName={`${meal.name.toLowerCase()}Reminder`} 
                      label={`Recordatorio ${meal.name}`} 
                    />
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Consejos motivacionales */}
          {userData?.weightGoal && (
            <View className="bg-indigo-800 rounded-2xl p-6 mb-6 border border-indigo-600">
              <Text className="text-white text-lg font-bold mb-2">💡 Consejo del Día</Text>
              <Text className="text-indigo-200 text-base leading-6">
                "Cada pequeño paso cuenta. Mantén la consistencia y celebra cada logro en tu camino hacia una vida más saludable."
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal mejorado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-gray-800 rounded-3xl p-8 w-4/5 max-w-sm border border-gray-600 shadow-2xl">
            <View className="items-center mb-6">
              <Icon name="target" size={40} />
              <Text className="text-white text-2xl font-bold mt-2">Nueva Meta</Text>
              <Text className="text-gray-400 text-center mt-1">
                Define cuánto peso quieres perder
              </Text>
            </View>
            
            {userData?.weight && (
              <View className="bg-gray-700 rounded-2xl p-4 mb-6">
                <Text className="text-gray-300 text-sm">Peso Actual</Text>
                <Text className="text-white text-xl font-semibold">
                  {userData.weight} kg
                </Text>
              </View>
            )}
            
            <TextInput
              className="bg-gray-700 text-white p-4 rounded-2xl mb-6 text-lg"
              placeholder="Ej: 5 kg (Máximo 20 kg)"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={weightGoalInput}
              onChangeText={setWeightGoalInput}
              style={{
                borderWidth: 2,
                borderColor: 'rgba(139, 92, 246, 0.3)',
              }}
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="bg-gray-600 px-6 py-4 rounded-2xl flex-1"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-purple-500 px-6 py-4 rounded-2xl flex-1 shadow-lg"
                onPress={saveWeightGoal}
              >
                <Text className="text-white text-center font-bold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}