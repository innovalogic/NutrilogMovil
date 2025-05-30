import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, Modal, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

type RootStackParamList = {
  RutinaMedia: {
    ejercicio: string;
    repeticiones: string;
    tiempoTotal: number;
    tiempoDescanso: number;
  };
  CronometroM: undefined;
};

type CronometroNavigationProp = StackNavigationProp<RootStackParamList, 'CronometroM'>;

const App = () => {
  const navigation = useNavigation<CronometroNavigationProp>();
  const [segundos, setSegundos] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [ejercicio, setEjercicio] = useState('Plancha');
  const [repeticiones, setRepeticiones] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTiempoSeleccionado, setTipoTiempoSeleccionado] = useState('');
  const [numeroDeSeries, setNumeroDeSeries] = useState(3);
  const [tiempoCalentamiento, setTiempoCalentamiento] = useState(30);
  const [tiempoTrabajo, setTiempoTrabajo] = useState(30);
  const [tiempoDescansoConfigurado, setTiempoDescansoConfigurado] = useState(60);

  const ejercicios = ['Plancha', 'Giro ruso', 'Abdominales con peso', 'Levantamiento de piernas'];
  const estructuraDatos = [
    { id: '1', title: 'Número de Series', value: numeroDeSeries.toString() },
    { id: '2', title: 'Tiempo de Calentamiento', value: `${tiempoCalentamiento} s` },
    { id: '3', title: 'Tiempo de Trabajo', value: `${tiempoTrabajo} s` },
    { id: '4', title: 'Tiempo de Descanso', value: `${tiempoDescansoConfigurado} s` },
  ];

  const [serieActual, setSerieActual] = useState(1);
  const [faseActual, setFaseActual] = useState('calentamiento');
  const [tiempoRestante, setTiempoRestante] = useState(tiempoCalentamiento);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    if (isRunning) {
      timerInterval = setInterval(() => {
        if (tiempoRestante > 0) {
          setTiempoRestante(prev => prev - 1);
        } else {
          handlePhaseChange();
        }
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isRunning, tiempoRestante]);

  const handlePhaseChange = () => {
    if (faseActual === 'calentamiento') {
      setFaseActual('trabajo');
      setTiempoRestante(tiempoTrabajo);
    } else if (faseActual === 'trabajo') {
      if (serieActual < numeroDeSeries) {
        setSerieActual(prev => prev + 1);
        setFaseActual('descanso');
        setTiempoRestante(tiempoDescansoConfigurado);
      } else {
        handleFinish();
      }
    } else if (faseActual === 'descanso') {
      setFaseActual('trabajo');
      setTiempoRestante(tiempoTrabajo);
    }
  };

  const handleStart = () => {
    Alert.alert(`Ejercicio: ${ejercicio}\nRepeticiones: ${repeticiones}`);
    setIsRunning(true);
    setFaseActual('calentamiento');
    setTiempoRestante(tiempoCalentamiento);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTiempoRestante(0);
    setSerieActual(1);
    setFaseActual('calentamiento');
  };

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('Usuario no autenticado');
      return;
    }
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      onSnapshot(userRef, async (userSnap) => {
        if (!userSnap.exists()) {
          console.log('No se encontró perfil de usuario');
          return;
        }
        
        const userData = userSnap.data();
        const peso = parseFloat(userData.weight);
        if (isNaN(peso)) {
          console.log('Peso inválido en perfil de usuario');
          return;
        }
        
        const tiempoTotalTrabajo = numeroDeSeries * tiempoTrabajo;
        const calorias = calcularCalorias(peso, tiempoTotalTrabajo);
        
        await guardarProgresoRutina('tren_medio', ejercicio, tiempoTotalTrabajo, calorias);
        
        navigation.navigate('RutinaMedia', {
          ejercicio,
          repeticiones,
          tiempoTotal: 0,
          tiempoDescanso: 0,
        });
        
        handleReset();
      });
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  };

  const calcularCalorias = (pesoKg: number, tiempoSegundos: number, MET: number = 3): number => {
    const tiempoMinutos = tiempoSegundos / 60;
    return (MET * 3.5 * pesoKg * tiempoMinutos) / 200;
  };

  const guardarProgresoRutina = async (routineId: string, tipoEjercicio: string, tiempoTrabajoSegundos: number, caloriasQuemadas: number) => {
    const user = auth.currentUser;
    if (!user) {
      console.log('Usuario no autenticado');
      return;
    }
    
    try {
      const sessionId = Date.now().toString();
      const sessionRef = doc(firestore, 'users', user.uid, 'ejercicioRutinas', routineId, 'sesiones', sessionId);
      await setDoc(sessionRef, {
        tipoEjercicio,
        fechaSesion: new Date().toISOString(), // Cambiado a fecha actual
        tiempoTrabajoSegundos,
        caloriasQuemadas,
      });
      console.log('Progreso guardado correctamente');
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  };

  const selectExercise = (item: string) => {
    setEjercicio(item);
    setExpanded(false);
  };

  const showModal = (type: string) => {
    setTipoTiempoSeleccionado(type);
    setModalVisible(true);
  };

  const renderNumberButtons = (options: number[], onPress: (num: number) => void) => {
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
    if (tipoTiempoSeleccionado === 'Número de Series') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Seleccionar Número de Series (3, 4, 5):
          </Text>
          {renderNumberButtons([3, 4, 5], num => setNumeroDeSeries(num))}
        </>
      );
    } else if (tipoTiempoSeleccionado === 'Tiempo de Calentamiento') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Selecciona tiempo (30, 60 s):</Text>
          {renderNumberButtons([30, 60], num => setTiempoCalentamiento(num))}
        </>
      );
    } else if (tipoTiempoSeleccionado === 'Tiempo de Trabajo') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Selecciona tiempo (30, 45, 60 s):</Text>
          {renderNumberButtons([30, 45, 60], num => setTiempoTrabajo(num))}
        </>
      );
    } else if (tipoTiempoSeleccionado === 'Tiempo de Descanso') {
      return (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Selecciona tiempo (60, 90 s):</Text>
          {renderNumberButtons([60, 90], num => setTiempoDescansoConfigurado(num))}
        </>
      );
    } else {
      return <Text>No hay opciones para seleccionar.</Text>;
    }
  };

  return (
    <View className="flex-1 bg-black items-center justify-center p-5">
      <Text className="text-white text-2xl font-bold mb-6">Cronómetro de Ejercicios</Text>
      <Text className="text-white mb-2">Selecciona el ejercicio:</Text>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="w-80 p-3 border border-gray-500 rounded-md bg-gray-800 mb-6"
      >
        <Text className="text-white">{ejercicio}</Text>
      </TouchableOpacity>

      {expanded && (
        <View className="w-80 bg-gray-800 rounded-md p-2">
          <FlatList
            data={ejercicios}
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
      {estructuraDatos.map(item => (
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
            <Text className="text-lg font-bold mb-4">Seleccionar {tipoTiempoSeleccionado}</Text>
            <ScrollView>{renderModalContent()}</ScrollView>
            <Button title="Guardar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <View className="w-36 h-36 border-8 border-green-500 rounded-full flex items-center justify-center mb-6">
        <Text className="text-white text-4xl">{tiempoRestante}</Text>
        <Text className="text-white text-lg">{faseActual === 'trabajo' ? 'Trabajo' : faseActual === 'descanso' ? 'Descanso' : 'Calentamiento'}</Text>
        <Text className="text-white text-lg">{serieActual} / {numeroDeSeries}</Text>
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