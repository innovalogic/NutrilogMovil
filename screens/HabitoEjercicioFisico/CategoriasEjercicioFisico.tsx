import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Pressable,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RootStackParamList = { 
  Yoga: undefined;
  Entrenamiento: undefined;
  Cardio: undefined;
  Habitos: { selectedHabit: 'Yoga' | 'Entrenamiento' | 'Cardio' }; // Define selectedHabit as a literal union type
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CategoriasEjercicioFisico() {
  const navigation = useNavigation<HabitScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'Yoga' | 'Entrenamiento' | 'Cardio' | null>(null);

  const handleNavigation = (route: 'Yoga' | 'Entrenamiento' | 'Cardio') => {
    setSelectedRoute(route);
    setModalVisible(true);
  };

  const handleModalAccept = async () => {
    setModalVisible(false);

    if (selectedRoute) {
      const user = auth.currentUser;
      if (user) {
        try {
          // Referencia a la subcolección de hábitos físicos dentro del usuario actual
          const habitosFisicosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosFisicos');
          
          // Agregar un nuevo documento con el hábito seleccionado
          await addDoc(habitosFisicosRef, {
            habitoSeleccionado: selectedRoute,
            timestamp: serverTimestamp()
          });

          console.log('Hábito registrado correctamente');
        } catch (error) {
          console.error('Error al registrar el hábito:', error);
          Alert.alert('Error', 'Hubo un problema al registrar tu hábito.');
        }
      } else {
        Alert.alert('Error', 'Usuario no autenticado.');
      }

      navigation.navigate('Habitos', { selectedHabit: selectedRoute });
    }
  };


  return (
    <View className="flex-1 bg-gray-700">
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-3/4 items-center">
            <Text className="text-xl font-bold text-black mb-4">
              Hábito Seleccionado Correctamente
            </Text>
            <Pressable
              className="bg-blue-500 rounded-lg py-2 px-4"
              onPress={handleModalAccept}
            >
              <Text className="text-white font-medium text-lg">Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View className="items-center pt-24">
        <Text className="text-4xl font-bold text-white">Hábito de Actividad Física</Text>
        <Text className="text-2xl font-medium text-white mt-1">Selecciona tus Hábitos</Text>
      </View>

      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 mb-10 w-3/4"
          onPress={() => handleNavigation('Yoga')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Yoga.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Yoga</Text>
              <Text className="text-white font-medium text-left mt-7">
                Alivio del estrés, flexibilidad, fuerza
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 mb-10 w-3/4"
          onPress={() => handleNavigation('Entrenamiento')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Entrenamiento.png')}
              className="w-20 h-28 mr-4 ml-[-34px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Entrenamiento</Text>
              <Text className="text-white font-medium text-left mt-7">
                Desarrollo muscular, aumento del metabolismo
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 w-3/4"
          onPress={() => handleNavigation('Cardio')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Cardio.png')}
              className="w-20 h-28 mr-4 ml-[-34px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Cardio</Text>
              <Text className="text-white font-medium text-left mt-7">
                Salud cardiovascular, pérdida de peso
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}