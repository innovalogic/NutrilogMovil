import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Image, Animated, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useStepCounter } from 'useStepCounter'; 

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Cardiocaminar: undefined;
  CardioTrotar: undefined;
  CardioCorrer: undefined;
};

const Cardiocaminar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  
  // Usar el hook personalizado
  const { steps, isActive, dailyStats, startCounting, stopCounting } = useStepCounter();
  
  const [pasosMeta, setPasosMeta] = useState(10000);
  const [progress] = useState(new Animated.Value(0));
  const [guardadoHoy, setGuardadoHoy] = useState(false);
  const [time, setTime] = useState(0);

  // Iniciar contador automáticamente cuando entra a la pantalla
  useEffect(() => {
    if (isFocused && !isActive) {
      const iniciarContador = async () => {
        try {
          await startCounting();
          Alert.alert(
            '🚶‍♂️ Contador Iniciado',
            'El contador de pasos está activo y funcionará en segundo plano',
            [{ text: 'OK' }]
          );
        } catch (error) {
          Alert.alert(
            '❌ Error',
            'No se pudo iniciar el contador de pasos. Verifica los permisos.',
            [{ text: 'OK' }]
          );
        }
      };
      iniciarContador();
    }
  }, [isFocused, startCounting, isActive]);

  // Actualizar animación de progreso
  useEffect(() => {
    const porcentaje = Math.min(steps / pasosMeta, 1);
    Animated.timing(progress, {
      toValue: porcentaje,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [steps, pasosMeta]);

  // Cronómetro basado en estadísticas diarias
  useEffect(() => {
    setTime(dailyStats.activeTime);
  }, [dailyStats.activeTime]);

  // Verificar si ya se guardaron pasos hoy
  useEffect(() => {
    const verificarGuardadoHoy = async () => {
      const hoy = new Date().toISOString().split('T')[0];
      const guardado = await AsyncStorage.getItem(`pasosGuardados_${hoy}`);
      setGuardadoHoy(guardado === 'true');
    };
    verificarGuardadoHoy();
  }, []);

  // Función para guardar pasos en Firebase (actualizada)
  const guardarPasosDiarios = async (pasosHoy: number) => {
    const user = auth.currentUser;
    if (!user) {
      console.log('Usuario no autenticado');
      return false;
    }

    try {
      const hoy = new Date();
      const fechaId = hoy.toISOString().split('T')[0];
      const pasosRef = doc(firestore, 'users', user.uid, 'pasosDiarios', fechaId);

      const docSnap = await getDoc(pasosRef);
      
      if (docSnap.exists()) {
        await updateDoc(pasosRef, {
          totalPasos: pasosHoy,
          distancia: dailyStats.distance,
          calorias: dailyStats.calories,
          tiempoActivo: dailyStats.activeTime,
          ultimaActualizacion: new Date().toISOString()
        });
      } else {
        await setDoc(pasosRef, {
          totalPasos: pasosHoy,
          distancia: dailyStats.distance,
          calorias: dailyStats.calories,
          tiempoActivo: dailyStats.activeTime,
          fecha: fechaId,
          fechaCompleta: new Date().toISOString(),
          creadoEl: new Date().toISOString(),
          ultimaActualizacion: new Date().toISOString()
        });
      }
      
      console.log('Pasos guardados correctamente');
      return true;
    } catch (error) {
      console.error('Error guardando pasos:', error);
      return false;
    }
  };

  // Manejar guardado y salida
  const handleGuardarYVolver = async () => {
    if (guardadoHoy) {
      navigation.goBack();
      return;
    }
    
    const hoy = new Date().toISOString().split('T')[0];
    const success = await guardarPasosDiarios(steps);
    
    if (success) {
      await AsyncStorage.setItem(`pasosGuardados_${hoy}`, 'true');
      setGuardadoHoy(true);
      
      Alert.alert(
        '✅ Guardado',
        `Se han guardado ${steps} pasos del día de hoy. El contador seguirá activo en segundo plano.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      Alert.alert('❌ Error', 'No se pudieron guardar los pasos. Intenta de nuevo.');
    }
  };

  // Formatear tiempo
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: 'white',
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center bg-black pb-10">
          <View className="mt-10">
            <Text className="text-white text-3xl font-mono mb-5">Caminar</Text>
            {isActive && (
              <View className="bg-green-600 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-bold">🟢 Activo en segundo plano</Text>
              </View>
            )}
          </View>

          <View>
            <Image
              source={require('../../assets/cardioCaminar.png')}
              className="rounded-2xl w-[200] h-[200]"
            />
          </View>

          <View className="flex-1 items-center justify-center mt-[-20] rounded-t-3xl px-5 w-full">
            <Text className="text-white text-3xl font-mono mb-5">Resumen</Text>

            <View className="flex-row flex-wrap justify-between w-full">
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Velocidad</Text>
                <Text className="text-3xl font-bold text-white">
                  {time > 0 ? (dailyStats.distance / (time / 3600)).toFixed(2) : '0.00'} km/h
                </Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Distancia</Text>
                <Text className="text-3xl font-bold text-white">{dailyStats.distance.toFixed(2)} km</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Tiempo</Text>
                <Text className="text-3xl font-bold text-white">{formatTime(time)}</Text>
              </View>

              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Pasos</Text>
                <Text className="text-3xl font-bold text-white">{steps}</Text>
              </View>

              {/* Nueva tarjeta de calorías */}
              <View className="bg-[#202938] w-[48%] h-36 mb-4 rounded-xl justify-center items-center">
                <Text className="text-xl font-bold text-white">Calorías</Text>
                <Text className="text-3xl font-bold text-white">{dailyStats.calories}</Text>
              </View>
            </View>

            <Text className="text-white text-lg font-bold mb-2">Selecciona tu meta de pasos:</Text>
            <View className="w-full bg-[#202938] rounded-xl px-4 py-2 mb-4">
              <Picker
                selectedValue={pasosMeta}
                style={{ height: 50, width: '100%', color: 'white' }}
                onValueChange={(itemValue) => setPasosMeta(itemValue)}
              >
                <Picker.Item label="5000 pasos" value={5000} />
                <Picker.Item label="8000 pasos" value={8000} />
                <Picker.Item label="10000 pasos" value={10000} />
                <Picker.Item label="12000 pasos" value={12000} />
                <Picker.Item label="15000 pasos" value={15000} />
              </Picker>
            </View>

            <View className="w-full mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-bold">Progreso de pasos:</Text>
                <Text className="text-white font-bold">{steps} / {pasosMeta}</Text>
              </View>

              <View className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <Animated.View
                  className="h-full bg-[#2563ea] rounded-full"
                  style={{
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>

              <Text className="text-white text-right mt-1">
                {Math.round((steps / pasosMeta) * 100)}% completado
              </Text>
            </View>

            <TouchableOpacity
              className={`py-3 px-6 rounded-full w-full ${guardadoHoy ? 'bg-gray-600' : 'bg-[#2563ea]'}`}
              onPress={handleGuardarYVolver}
            >
              <Text className="text-white font-bold text-center">
                {guardadoHoy ? 'Guardado hoy ✓' : 'Guardar y Volver'}
              </Text>
            </TouchableOpacity>
            
            {guardadoHoy && (
              <Text className="text-green-400 mt-2 text-center">
                Ya has guardado tus pasos hoy. El contador sigue activo en segundo plano.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cardiocaminar;