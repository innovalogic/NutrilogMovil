import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RootStackParamList = {
  Habitos: { selectedHabit: 'Dieta Para Bajar de Peso' | 'Dieta Para Mantener el Peso' | 'Dieta Para Subir de Peso' };
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CategoriasAlimentacion() {
  const navigation = useNavigation<HabitScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'Dieta Para Bajar de Peso' | 'Dieta Para Mantener el Peso' | 'Dieta Para Subir de Peso' | null>(null);

  const handleNavigation = (route: 'Dieta Para Bajar de Peso' | 'Dieta Para Mantener el Peso' | 'Dieta Para Subir de Peso') => {
    setSelectedRoute(route);
    setModalVisible(true);
  };

  const handleModalAccept = async () => {
    setModalVisible(false);

    if (selectedRoute) {
      const user = auth.currentUser;
      if (user) {
        try {
          // Referencia a la subcolección de hábitos alimenticios dentro del usuario actual
          const habitosAlimenticiosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios');
          
          // Agregar un nuevo documento con el hábito seleccionado
          await addDoc(habitosAlimenticiosRef, {
            habitoSeleccionado: selectedRoute,
            timestamp: serverTimestamp()
          });

          console.log('Hábito alimenticio registrado correctamente');
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
        <Text className="text-4xl font-bold text-white">Hábito de Alimentación</Text>
        <Text className="text-2xl font-medium text-white mt-1">Selecciona tus Hábitos</Text>
      </View>

      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 mb-10 w-3/4"
          onPress={() => handleNavigation('Dieta Para Bajar de Peso')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/DietaBajarPeso.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Dieta Para Bajar de Peso</Text>
              <Text className="text-white font-medium text-left mt-7">
                Control calórico, pérdida de grasa
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 mb-10 w-3/4"
          onPress={() => handleNavigation('Dieta Para Mantener el Peso')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/DietaMantenerPeso.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Dieta Para Mantener el Peso</Text>
              <Text className="text-white font-medium text-left mt-7">
                Equilibrio nutricional, estabilidad
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-lg py-6 px-14 w-3/4"
          onPress={() => handleNavigation('Dieta Para Subir de Peso')}
        >
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/DietaSubirPeso.png')}
              className="w-16 h-28 mr-4 ml-[-24px]"
            />
            <View>
              <Text className="text-white text-2xl font-bold">Dieta Para Subir de Peso</Text>
              <Text className="text-white font-medium text-left mt-7">
                Aumento muscular, ganancia calórica
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}