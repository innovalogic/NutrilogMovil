import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  RutinaSuperior: { 
    exercise: string; 
    reps: string; 
    totalTime: number; 
    restTime: number; 
  };
  CronometroS: undefined; 
};

type CronometroNavigationProp = StackNavigationProp<RootStackParamList, 'CronometroS'>;

const App = () => {
  const navigation = useNavigation<CronometroNavigationProp>(); // Usar el tipo correcto
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [exercise, setExercise] = useState('Flexiones de brazos');
  const [reps, setReps] = useState('');
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const exercises = ['Flexiones de brazos', 'Press de banca', 'Dominadas', 'Elevacion de Hombros'];

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined; 
    if (isRunning) {
      timerInterval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (isResting) {
      timerInterval = setInterval(() => {
        setRestSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isRunning, isResting]);

  const handleStart = () => {
    Alert.alert(`Ejercicio: ${exercise}\nRepeticiones: ${reps}`);
    setSeconds(0);
    setIsRunning(true);
    setIsResting(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setRestSeconds(0);
    setIsResting(false);
  };

  const handleRestStart = () => {
    setIsRunning(false);
    setIsResting(true);
    setRestSeconds(0);
  };

  const handleFinish = () => {
    navigation.navigate('RutinaSuperior', {
      exercise,
      reps,
      totalTime: seconds,
      restTime: restSeconds,
    });
    handleReset();
  };

  const selectExercise = (item: string) => {
    setExercise(item);
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-black items-center justify-center p-5">
      <Text className="text-white text-2xl font-bold mb-6">Cronómetro de Ejercicios</Text>

      <Text className="text-white mb-2">Selecciona el ejercicio:</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} className="w-80 p-3 border border-gray-500 rounded-md bg-gray-800 mb-6">
        <Text className="text-white">{exercise}</Text>
      </TouchableOpacity>

      <Text className="text-white mb-2">Estructura del entrenamiento:</Text>
      <TextInput
        className="w-80 p-3 border border-gray-500 rounded-md bg-gray-800 text-white mb-6"
        value={reps}
        onChangeText={setReps}
        placeholder="Repeticiones"
        placeholderTextColor="#aaa"
      />

      <View className="w-36 h-36 border-8 border-green-500 rounded-full flex items-center justify-center mb-6">
        <Text className="text-white text-4xl">{isResting ? restSeconds : seconds} s</Text>
      </View>

      <View className="flex-row justify-between w-full px-8">
        <TouchableOpacity className="flex-1 bg-gray-700 rounded-md p-4 mx-1 flex items-center" onPress={handlePause}>
          <Ionicons name="pause" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-blue-600 rounded-md p-4 mx-1 flex items-center" onPress={isResting ? handleRestStart : handleStart}>
          <Text className="text-white text-lg font-bold">{isResting ? 'Iniciar Descanso' : 'Comenzar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-500 rounded-md p-4 mx-1 flex items-center" onPress={handleReset}>
          <Ionicons name="reload" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="mt-4 w-full bg-green-600 rounded-md p-4" onPress={handleFinish}>
        <Text className="text-white text-lg font-bold text-center">Finalizar</Text>
      </TouchableOpacity>

      {/* Modal para seleccionar ejercicio */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 bg-white p-5">
          <Text className="text-lg font-bold mb-4">Selecciona un ejercicio</Text>
          <FlatList
            data={exercises}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectExercise(item)} className="p-4 border-b border-gray-300">
                <Text className="text-lg">{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 p-3 bg-blue-600 rounded-md">
            <Text className="text-white text-center">Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default App;