import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

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
  onSetGoalPress: () => void;
}

const ProgresoAlimentacion: React.FC<ProgresoAlimentacionProps> = ({ 
  userData, 
  onSetGoalPress 
}) => {
  const calculateProgress = () => {
    if (!userData?.weightGoal || !userData?.weight) return 0;
    const currentWeight = parseFloat(userData.weight);
    const goalWeight = currentWeight - userData.weightGoal;
    // Simulamos progreso basado en días rastreados (esto se puede mejorar con datos reales)
    const daysProgress = (userData.totalDaysTracked || 0) * 2;
    return Math.min(daysProgress, 100);
  };

  return (
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
        onPress={onSetGoalPress}
      >
        <Text className="text-white text-center font-bold text-lg">
          {userData?.weightGoal ? '✏️ Cambiar Meta' : '🎯 Establecer Meta'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProgresoAlimentacion;