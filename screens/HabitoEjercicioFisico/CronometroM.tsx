import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, Modal, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  RutinaMedio: {
    exercise: string;
    reps: string;
    totalTime: number;
    restTime: number;
  };
  CronometroS: undefined;
};

type CronometroNavigationProp = StackNavigationProp<RootStackParamList, 'CronometroS'>;

const App = () => {
  const navigation = useNavigation<CronometroNavigationProp>();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [exercise, setExercise] = useState('Plancha');
  const [reps, setReps] = useState('');
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Estados para los modales
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState('');

  // Estados para los valores
  const [seriesCount, setSeriesCount] = useState(3); // Ajustado a 3
  const [warmupSeconds, setWarmupSeconds] = useState(30); // Ajustado a 30
  const [workSeconds, setWorkSeconds] = useState(30); // Ajustado a 30
  const [restSecondsSetting, setRestSecondsSetting] = useState(60); // Ajustado a 60

  const exercises = ['Plancha', 'Giro ruso', 'Abdominales con peso', 'Levantamiento de piernas'];

  // Datos para la estructura del entrenamiento
  const structureData = [
    { id: '1', title: 'Número de Series', value: seriesCount.toString() },
    { id: '2', title: 'Tiempo de Calentamiento', value: `${warmupSeconds} s` },
    { id: '3', title: 'Tiempo de Trabajo', value: `${workSeconds} s` },
    { id: '4', title: 'Tiempo de Descanso', value: `${restSecondsSetting} s` },
  ];

  const [currentSeries, setCurrentSeries] = useState(1);
  const [currentPhase, setCurrentPhase] = useState('warmup'); // 'warmup', 'work', 'rest'
  const [timeLeft, setTimeLeft] = useState(warmupSeconds); // Initialize with warmup time

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    if (isRunning) {
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft(prev => prev - 1);
        } else {
          handlePhaseChange();
        }
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isRunning, timeLeft]);

  const handlePhaseChange = () => {
    if (currentPhase === 'warmup') {
      setCurrentPhase('work');
      setCurrentSeries(1); // Reset series for new cycle
      setTimeLeft(workSeconds);
    } else if (currentPhase === 'work') {
      if (currentSeries < seriesCount) {
        setCurrentSeries(prev => prev + 1);
        setCurrentPhase('rest');
        setTimeLeft(restSecondsSetting);
      } else {
        handleFinish();
      }
    } else if (currentPhase === 'rest') {
      setCurrentPhase('work');
      setTimeLeft(workSeconds);
    }
  };

  const handleStart = () => {
    Alert.alert(`Ejercicio: ${exercise}\nRepeticiones: ${reps}`);
    setSeconds(0);
    setIsRunning(true);
    setCurrentPhase('warmup');
    setTimeLeft(warmupSeconds);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setTimeLeft(0);
    setCurrentSeries(1);
    setCurrentPhase('warmup');
  };

  const handleFinish = () => {
    navigation.navigate('RutinaMedio', {
      exercise,
      reps,
      totalTime: seconds,
      restTime: restSeconds,
    });
    handleReset();
  };

  const selectExercise = (item: string) => {
    setExercise(item);
    setExpanded(false);
  };

  const showModal = (type: string) => {
    setSelectedTimeType(type);
    setModalVisible(true);
  };

  const renderNumberButtons = (
    options: number[],
    onPress: (num: number) => void
  ) => {
    return (
      <ScrollView style={{ maxHeight: 200 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'nowrap', marginVertical: 2 }}>
          {options.map(num => (
            <TouchableOpacity
              key={num}
              onPress={() => onPress(num)}
              style={{
                backgroundColor: '#4A5568',
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginRight: 6,
                borderRadius: 5,
                minWidth: 30,
                alignItems: 'center',
              }}
            >
              <Text className="text-white">{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderModalContent = () => {
    if (selectedTimeType === 'Número de Series') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Seleccionar Número de Series (3, 4, 5):
          </Text>
          {renderNumberButtons([3, 4, 5], num => setSeriesCount(num))}
        </>
      );
    } else if (selectedTimeType === 'Tiempo de Calentamiento') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Selecciona tiempo (30, 60 s):</Text>
          {renderNumberButtons([30, 60], num => setWarmupSeconds(num))}
        </>
      );
    } else if (selectedTimeType === 'Tiempo de Trabajo') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Selecciona tiempo (30, 45, 60 s):</Text>
          {renderNumberButtons([30, 45, 60], num => setWorkSeconds(num))}
        </>
      );
    } else if (selectedTimeType === 'Tiempo de Descanso') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Selecciona tiempo (60, 90 s):</Text>
          {renderNumberButtons([60, 90], num => setRestSecondsSetting(num))}
        </>
      );
    } else {
      return <Text>No hay opciones para seleccionar.</Text>;
    }
  };

  return (
    <View className="flex-1 bg-black items-center justify-center p-5">
      <Text className="text-white text-2xl font-bold mb-6">
        Cronómetro de Ejercicios
      </Text>

      <Text className="text-white mb-2">Selecciona el ejercicio:</Text>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="w-80 p-3 border border-gray-500 rounded-md bg-gray-800 mb-6"
      >
        <Text className="text-white">{exercise}</Text>
      </TouchableOpacity>

      {expanded && (
        <View className="w-80 bg-gray-800 rounded-md p-2">
          <FlatList
            data={exercises}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectExercise(item)}
                className="p-4 border-b border-gray-500"
              >
                <Text className="text-white">{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Estructura del Entrenamiento */}
      {structureData.map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => showModal(item.title)}
          className="w-80 bg-gray-800 rounded-md p-4 mb-2 flex-row justify-between border border-gray-500"
        >
          <Text className="text-white">{item.title}</Text>
          <Text className="text-white">{item.value}</Text>
        </TouchableOpacity>
      ))}

      {/* Modal para seleccionar tiempo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-md max-h-[80%] w-11/12">
            <Text className="text-lg font-bold mb-4">
              Seleccionar {selectedTimeType}
            </Text>
            <ScrollView>{renderModalContent()}</ScrollView>
            <Button title="Guardar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <View className="w-36 h-36 border-8 border-green-500 rounded-full flex items-center justify-center mb-6">
        <Text className="text-white text-4xl">{timeLeft}</Text>
        <Text className="text-white text-lg">{currentPhase === 'work' ? 'Trabajo' : currentPhase === 'rest' ? 'Descanso' : 'Calentamiento'}</Text>
        <Text className="text-white text-lg">{currentSeries} / {seriesCount}</Text>
      </View>

      <View className="flex-row justify-between w-full px-8">
        <TouchableOpacity
          className="flex-1 bg-gray-700 rounded-md p-4 mx-1 flex items-center"
          onPress={handlePause}
        >
          <Text className="text-white text-lg font-bold">Pausa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-600 rounded-md p-4 mx-1 flex items-center"
          onPress={handleStart}
        >
          <Text className="text-white text-lg font-bold">Comenzar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500 rounded-md p-4 mx-1 flex items-center"
          onPress={handleReset}
        >
          <Text className="text-white text-lg font-bold">Reiniciar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="mt-4 w-full bg-green-600 rounded-md p-4"
        onPress={handleFinish}
      >
        <Text className="text-white text-lg font-bold text-center">Finalizar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;