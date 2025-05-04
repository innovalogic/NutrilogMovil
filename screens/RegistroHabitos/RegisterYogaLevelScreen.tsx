import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { auth, firestore } from '../../firebase'; // Asegúrate de que la importación sea correcta

type RootStackParamList = {
  RegistroEjercicios: undefined;
};

const levels = ['Principiante', 'Intermedio', 'Avanzado'];

const RegisterYogaLevelScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selectedLevel) {
      Alert.alert('Selecciona un nivel antes de guardar.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('No se encontró un usuario autenticado.');
        return;
      }

      const userRef = doc(firestore, 'usuariohabitosactividadfisica', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Si el documento no existe, crearlo
        await setDoc(userRef, {
          niveles: arrayUnion({ nivel: selectedLevel, actividad: 'Yoga', timestamp: new Date() }),
        });
      } else {
        // Si el documento existe, actualizarlo
        await updateDoc(userRef, {
          niveles: arrayUnion({ nivel: selectedLevel, actividad: 'Yoga', timestamp: new Date() }),
        });
      }

      Alert.alert('Nivel guardado exitosamente!');
      navigation.navigate('RegistroEjercicios');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al guardar el nivel.');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-blue-500">
      <Text className="text-white text-3xl font-bold mb-5">Selecciona tu nivel de inicio</Text>
      <Text className="text-white text-lg mb-10">Actividad: Yoga</Text>

      {levels.map((level) => (
        <TouchableOpacity
          key={level}
          className={`py-3 px-8 rounded-md mb-5 w-64 items-center ${
            selectedLevel === level ? 'bg-yellow-400' : 'bg-orange-600'
          }`}
          onPress={() => setSelectedLevel(level)}
        >
          <Text className="text-white text-lg font-bold">{level}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        className="bg-green-600 py-3 px-8 rounded-md w-64 items-center"
        onPress={handleSave}
      >
        <Text className="text-white text-lg font-bold">Guardar y Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterYogaLevelScreen;
