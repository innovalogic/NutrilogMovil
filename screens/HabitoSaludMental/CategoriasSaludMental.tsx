import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RootStackParamList = {
  Habitos: { selectedHabit: 'Lectura diaria' | 'Video-Inspira' | 'Origami Diario' };
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CategoriasSaludMental() {
  const navigation = useNavigation<HabitScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'Lectura diaria' | 'Audio-Inspira' | 'Origami Diario' | null>(null);

  const handleNavigation = (route: 'Lectura diaria' | 'Audio-Inspira' | 'Origami Diario') => {
    setSelectedRoute(route);
    setModalVisible(true);
  };

  const handleModalAccept = async () => {
    setModalVisible(false);

    if (selectedRoute) {
      const user = auth.currentUser;
      if (user) {
        try {
          // Referencia a la subcolección de hábitos de salud mental dentro del usuario actual
          const habitosSaludMentalRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosSaludMental');
          
          // Agregar un nuevo documento con el hábito seleccionado
          await addDoc(habitosSaludMentalRef, {
            habitoSeleccionado: selectedRoute,
            timestamp: serverTimestamp()
          });

          console.log('Hábito de salud mental registrado correctamente');
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
    <View className="flex-1 bg-gray-900">
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
        <Text className="text-4xl font-bold text-white">Hábito de Salud Mental</Text>
        <Text className="text-2xl font-medium text-white mt-1">Selecciona tus Hábitos</Text>
      </View>

      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 mb-10 w-3/4"
          onPress={() => handleNavigation('Lectura diaria')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/LecturaDiaria.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Lectura diaria</Text>
              <Text className="text-white font-medium text-left mt-7">
                Fomenta la concentración y el aprendizaje
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 mb-10 w-3/4"
          onPress={() => handleNavigation('Audio-Inspira')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/AudioInspira.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Audio-Inspira</Text>
              <Text className="text-white font-medium text-left mt-7">
                Motivación y bienestar emocional
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 w-3/4"
          onPress={() => handleNavigation('Origami Diario')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/Origami.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Origami Diario</Text>
              <Text className="text-white font-medium text-left mt-7">
                Creatividad y relajación mental
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}