import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput 
} from 'react-native';
import { auth, firestore } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

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

interface UserData {
  weightGoal?: number;
  weight?: string;
  currentStreak?: number;
  totalDaysTracked?: number;
}

interface ProgresoAlimentacionProps {
  userData: UserData | null;
  onGoalUpdated?: () => void; // Callback opcional para notificar cambios
}

const ProgresoAlimentacion: React.FC<ProgresoAlimentacionProps> = ({ 
  userData, 
  onGoalUpdated 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [weightGoalInput, setWeightGoalInput] = useState('');

  const calculateProgress = () => {
    if (!userData?.weightGoal || !userData?.weight) return 0;
    const currentWeight = parseFloat(userData.weight);
    const goalWeight = currentWeight - userData.weightGoal;
    // Simulamos progreso basado en días rastreados (esto se puede mejorar con datos reales)
    const daysProgress = (userData.totalDaysTracked || 0) * 2;
    return Math.min(daysProgress, 100);
  };

  const handleSetGoalPress = () => {
    setModalVisible(true);
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
      
      // Notificar al componente padre si hay callback
      onGoalUpdated?.();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la meta. Intenta nuevamente.');
    }
  };

  return (
    <>
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
          onPress={handleSetGoalPress}
        >
          <Text className="text-white text-center font-bold text-lg">
            {userData?.weightGoal ? '✏️ Cambiar Meta' : '🎯 Establecer Meta'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para establecer/cambiar meta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-gray-800 rounded-3xl p-8 w-4/5 max-w-sm border border-gray-600 shadow-2xl">
            <View className="items-center mb-6">
              <Text style={{ fontSize: 40 }}>🎯</Text>
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
    </>
  );
};

export default ProgresoAlimentacion;