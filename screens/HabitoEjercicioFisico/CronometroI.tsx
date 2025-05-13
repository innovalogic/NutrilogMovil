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
  CronometroI: undefined;
};

type CronometroNavigationProp = StackNavigationProp<RootStackParamList, 'CronometroI'>;

const CronometroI = () => {
  const navigation = useNavigation<CronometroNavigationProp>();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [exercise, setExercise] = useState('Sentadillas');
  const [reps, setReps] = useState('');
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState('');

  const [seriesCount, setSeriesCount] = useState(1);
  const [warmupMinutes, setWarmupMinutes] = useState(0);
  const [warmupSeconds, setWarmupSeconds] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [restMinutes, setRestMinutes] = useState(0);
  const [restSecondsSetting, setRestSecondsSetting] = useState(15);

  const exercises = ['Sentadillas', 'Peso Muerto', 'Zancadas', 'Elevaciones de talones'];

  const structureData = [
    { id: '1', title: 'Número de Series', value: seriesCount.toString() },
    { id: '2', title: 'Tiempo de Calentamiento', value: `${warmupMinutes} min ${warmupSeconds} s` },
    { id: '3', title: 'Tiempo de Trabajo', value: `${workMinutes} min ${workSeconds} s` },
    { id: '4', title: 'Tiempo de Descanso', value: `${restMinutes} min ${restSecondsSetting} s` },
  ];

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
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
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
    start: number,
    end: number,
    onPress: (num: number) => void
  ) => {
    const buttons = [];
    const buttonsPerRow = 10;

    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }

    const rows = [];
    for (let i = 0; i < buttons.length; i += buttonsPerRow) {
      rows.push(buttons.slice(i, i + buttonsPerRow));
    }

    return (
      <ScrollView style={{ maxHeight: 200 }}>
        {rows.map((row, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              flexWrap: 'nowrap',
              marginVertical: 2,
            }}
          >
            {row.map(num => (
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
        ))}
      </ScrollView>
    );
  };

  const renderModalContent = () => {
    if (selectedTimeType === 'Número de Series') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Seleccionar Número de Series (1-99):
          </Text>
          {renderNumberButtons(1, 99, num => setSeriesCount(num))}
        </>
      );
    } else if (
      selectedTimeType === 'Tiempo de Calentamiento' ||
      selectedTimeType === 'Tiempo de Trabajo' ||
      selectedTimeType === 'Tiempo de Descanso'
    ) {
      let curMin = 0;
      let curSec = 0;
      let setMin: (val: number) => void = () => {};
      let setSec: (val: number) => void = () => {};

      if (selectedTimeType === 'Tiempo de Calentamiento') {
        curMin = warmupMinutes;
        curSec = warmupSeconds;
        setMin = setWarmupMinutes;
        setSec = setWarmupSeconds;
      } else if (selectedTimeType === 'Tiempo de Trabajo') {
        curMin = workMinutes;
        curSec = workSeconds;
        setMin = setWorkMinutes;
        setSec = setWorkSeconds;
      } else if (selectedTimeType === 'Tiempo de Descanso') {
        curMin = restMinutes;
        curSec = restSecondsSetting;
        setMin = setRestMinutes;
        setSec = setRestSecondsSetting;
      }

      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Minutos (0-59):</Text>
          {renderNumberButtons(0, 59, num => setMin(num))}
          <Text
            style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 12 }}
          >
            Segundos (0-59):
          </Text>
          {renderNumberButtons(0, 59, num => setSec(num))}
          <Text style={{ marginTop: 8 }}>
            Seleccionado: {curMin} min {curSec} s
          </Text>
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
        <Text className="text-white text-4xl">
          {isResting ? restSeconds : seconds} s
        </Text>
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

export default CronometroI;
