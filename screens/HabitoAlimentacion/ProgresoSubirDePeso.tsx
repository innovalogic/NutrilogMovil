import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { auth, firestore } from '../../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
    chart: '📊',
    calendar: '📅'
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '📱'}
    </Text>
  );
};

// Componente de progreso circular mejorado
const CircularProgress = ({ progress, size = 120, daysCompleted, totalDays }: { 
  progress: number; 
  size?: number;
  daysCompleted: number;
  totalDays: number;
}) => {
  const getProgressColor = () => {
    if (progress >= 75) return '#10B981'; // Verde
    if (progress >= 50) return '#F59E0B'; // Amarillo
    if (progress >= 25) return '#EF4444'; // Rojo
    return '#6B7280'; // Gris
  };

  return (
    <View className="items-center">
      <View 
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 8,
          borderColor: getProgressColor(),
        }}
      >
        <Text className="text-white text-2xl font-bold">{Math.round(progress)}%</Text>
        <Text className="text-gray-300 text-sm">Progreso</Text>
      </View>
      <View className="items-center mt-3">
        <Text className="text-white text-lg font-semibold">
          {daysCompleted}/{totalDays} días
        </Text>
        <Text className="text-gray-400 text-xs">
          {totalDays - daysCompleted} días restantes
        </Text>
      </View>
    </View>
  );
};

interface UserData {
  weightGoal?: number;
  weight?: string;
  currentStreakSubirDePeso?: number;
  totalDaysTrackedSubirDePeso?: number;
  lastCompletedDaySubirDePeso?: string;
}

interface ProgresoAlimentacionProps {
  userData: UserData | null;
  onGoalUpdated?: () => void;
}

const ProgresoAlimentacion: React.FC<ProgresoAlimentacionProps> = ({ 
  userData, 
  onGoalUpdated 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [weightGoalInput, setWeightGoalInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserData | null>(userData);

  // Constante para días objetivo (30 días = 1 mes)
  const TARGET_DAYS = 30;

  useEffect(() => {
    setLocalUserData(userData);
  }, [userData]);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setLocalUserData(doc.data() as UserData);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const calculateProgress = () => {
    if (!localUserData?.totalDaysTrackedSubirDePeso) return 0;
    const daysCompleted = localUserData.totalDaysTrackedSubirDePeso;
    const progressPercentage = Math.min((daysCompleted / TARGET_DAYS) * 100, 100);
    return progressPercentage;
  };

  const getDaysInfo = () => {
    const daysCompleted = localUserData?.totalDaysTrackedSubirDePeso || 0;
    const remainingDays = Math.max(TARGET_DAYS - daysCompleted, 0);
    return {
      completed: daysCompleted,
      remaining: remainingDays,
      total: TARGET_DAYS,
      isCompleted: daysCompleted >= TARGET_DAYS
    };
  };

  const getMotivationalMessage = () => {
    const progress = calculateProgress();
    const daysInfo = getDaysInfo();
    
    if (daysInfo.isCompleted) {
      return "¡Felicidades! 🎉 Has completado tu primer mes de transformación. ¡Sigue así!";
    }
    
    if (progress >= 75) {
      return `¡Increíble! Solo te faltan ${daysInfo.remaining} días para completar tu primer mes 💪`;
    }
    
    if (progress >= 50) {
      return `¡Vas por la mitad! Ya llevas ${daysInfo.completed} días, mantén el ritmo 🚀`;
    }
    
    if (progress >= 25) {
      return `¡Buen comienzo! Llevas ${daysInfo.completed} días, cada día cuenta 🌟`;
    }
    
    return `¡Empezaste tu transformación! Cada día es un paso hacia tu meta 🎯`;
  };

  const handleSetGoalPress = () => {
    setWeightGoalInput(localUserData?.weightGoal?.toString() || '');
    setModalVisible(true);
  };

  const saveWeightGoal = async () => {
    if (!auth.currentUser || !weightGoalInput) return;
    
    try {
      setSaving(true);
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
          totalDaysTrackedSubirDePeso: localUserData?.totalDaysTrackedSubirDePeso || 0,
          currentStreakSubirDePeso: localUserData?.currentStreakSubirDePeso || 0
        }, 
        { merge: true }
      );
      
      setModalVisible(false);
      setWeightGoalInput('');
      onGoalUpdated?.();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la meta. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const daysInfo = getDaysInfo();

  return (
    <>
      <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-xl font-bold">Tu Progreso</Text>
            <Text className="text-gray-400 text-sm">{getMotivationalMessage()}</Text>
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
                  {localUserData?.weight ? `${localUserData.weight} kg` : 'No registrado'}
                </Text>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-1">Meta</Text>
              <Text className="text-purple-400 text-lg font-semibold">
                {localUserData?.weightGoal ? `Subir ${localUserData.weightGoal} kg` : 'Sin meta definida'}
              </Text>
            </View>

            {localUserData?.weightGoal && (
              <View className="space-y-3">
                <View className="flex-row items-center space-x-4">
                  <View className="items-center">
                    <Icon name="fire" size={18} />
                    <Text className="text-orange-400 text-sm font-medium">
                      {localUserData?.currentStreakSubirDePeso || 0} días
                    </Text>
                    <Text className="text-gray-400 text-xs">Racha</Text>
                  </View>
                  <View className="items-center">
                    <Icon name="calendar" size={18} />
                    <Text className="text-blue-400 text-sm font-medium">
                      {daysInfo.completed} días
                    </Text>
                    <Text className="text-gray-400 text-xs">Completados</Text>
                  </View>
                  <View className="items-center">
                    <Icon name="trophy" size={18} />
                    <Text className="text-yellow-400 text-sm font-medium">
                      {daysInfo.remaining} días
                    </Text>
                    <Text className="text-gray-400 text-xs">Restantes</Text>
                  </View>
                </View>
                
                {/* Barra de progreso lineal adicional */}
                <View className="bg-gray-700 rounded-full h-2 mt-2">
                  <View 
                    className={`h-2 rounded-full ${
                      calculateProgress() >= 75 ? 'bg-green-500' :
                      calculateProgress() >= 50 ? 'bg-yellow-500' :
                      calculateProgress() >= 25 ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </View>
              </View>
            )}
          </View>

          {localUserData?.weightGoal && (
            <View className="ml-4">
              <CircularProgress 
                progress={calculateProgress()} 
                daysCompleted={daysInfo.completed}
                totalDays={daysInfo.total}
              />
            </View>
          )}
        </View>
        
        <TouchableOpacity
          className="bg-purple-500 py-4 rounded-2xl mt-6 shadow-lg"
          onPress={handleSetGoalPress}
        >
          <Text className="text-white text-center font-bold text-lg">
            {localUserData?.weightGoal ? '✏️ Cambiar Meta' : '🎯 Establecer Meta'}
          </Text>
        </TouchableOpacity>

        {/* Información adicional sobre el ciclo de 30 días */}
        {localUserData?.weightGoal && (
          <View className="bg-gray-700 rounded-2xl p-4 mt-4">
            <Text className="text-gray-300 text-sm font-medium mb-1">
              📋 Ciclo de Transformación (30 días)
            </Text>
            <Text className="text-gray-400 text-xs">
              {daysInfo.isCompleted 
                ? "¡Completaste tu primer ciclo! Puedes empezar uno nuevo o ajustar tu meta."
                : `Te encuentras en el día ${daysInfo.completed} de tu ciclo de transformación de 30 días.`
              }
            </Text>
          </View>
        )}
      </View>

      {/* Modal para establecer/cambiar meta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !saving && setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-gray-800 rounded-3xl p-8 w-4/5 max-w-sm border border-gray-600 shadow-2xl">
            <View className="items-center mb-6">
              <Text style={{ fontSize: 40 }}>🎯</Text>
              <Text className="text-white text-2xl font-bold mt-2">Nueva Meta</Text>
              <Text className="text-gray-400 text-center mt-1">
                Define cuánto peso quieres ganar en 30 días
              </Text>
            </View>
            
            {localUserData?.weight && (
              <View className="bg-gray-700 rounded-2xl p-4 mb-6">
                <Text className="text-gray-300 text-sm">Peso Actual</Text>
                <Text className="text-white text-xl font-semibold">
                  {localUserData.weight} kg
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
                onPress={() => !saving && setModalVisible(false)}
                disabled={saving}
              >
                <Text className="text-white text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-purple-500 px-6 py-4 rounded-2xl flex-1"
                onPress={saveWeightGoal}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-center font-bold">Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProgresoAlimentacion;