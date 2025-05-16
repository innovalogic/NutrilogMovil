import React, { useState, useCallback } from 'react';
import { Text, TouchableOpacity, View, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { auth, firestore } from '../../firebase'; // Asegúrate de que la importación sea correcta
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  RegistroEjercicios: undefined;
  Principiante: undefined,
  Intermedio: undefined,
  Avanzado: undefined,
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const niveles = [
  {
    nombre: 'Principiante',
    descripcion: 'Ideal para quienes comienzan. Aprende posturas básicas y mejora tu flexibilidad.',
    icono: require('../../assets/yoga1.png'),
    route: 'Yoga',
  },
  {
    nombre: 'Intermedio',
    descripcion: 'Para quienes ya tienen experiencia. Aumenta la dificultad y controla tu respiración.',
    icono: require('../../assets/yoga2.jpg'),
    route: 'YogaIntermedio',
  },
  {
    nombre: 'Avanzado',
    descripcion: 'Para practicantes experimentados. Desafía tu cuerpo con posturas avanzadas y relajación profunda.',
    icono: require('../../assets/yoga3.jpg'),
    route: 'YogaAvanzado'
  }
];

const RegisterYogaLevelScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setSelectedLevel(null);
    }, [])
  );

  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
  };

  // const handleSave = async () => {
    // if (!selectedLevel) {
    //   Alert.alert('Selecciona un nivel antes de guardar.');
    //   return;
    // }

    // try {
    //   const user = auth.currentUser;

    //   if (!user) {
    //     Alert.alert('No se encontró un usuario autenticado.');
    //     return;
    //   }

    //   const userRef = doc(firestore, 'usuariohabitosactividadfisica', user.uid);
    //   const userDoc = await getDoc(userRef);

    //   if (!userDoc.exists()) {
    //     // Si el documento no existe, crearlo
    //     await setDoc(userRef, {
    //       niveles: arrayUnion({ nivel: selectedLevel, actividad: 'Yoga', timestamp: new Date() }),
    //     });
    //   } else {
    //     // Si el documento existe, actualizarlo
    //     await updateDoc(userRef, {
    //       niveles: arrayUnion({ nivel: selectedLevel, actividad: 'Yoga', timestamp: new Date() }),
    //     });
    //   }

    //   Alert.alert('Nivel guardado exitosamente!');
    //   navigation.navigate('RegistroEjercicios');
    // } catch (error) {
    //   console.error(error);
    //   Alert.alert('Error al guardar el nivel.');
    // }
  // };

  return (
    <View className="flex-1 justify-center items-center bg-gray-700">

      <View className="mt-12">
        <Text className="text-white text-3xl font-extralight mb-5">Selecciona tu nivel</Text>
        {/* <Text className="text-white text-lg mb-10">Actividad: Yoga</Text> */}
      </View>

      <View>
        <Image
          source={require('../../assets/menuYoga.jpg')}
          className="rounded-2xl w-[363] h-[222]"
        />
      </View>

      <View className="flex-1 items-center justify-center mt-[-20] rounded-t-3xl px-5 bg-white">
        {niveles.map((level, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-3 my-3 rounded-3x1 w-full rounded-2xl bg-gray-500 shadow-2xl shadow-black`}
            onPress={() => {setSelectedLevel(level.nombre);
              handleNavigation(level.route as keyof RootStackParamList);  }
            } 
          >
            <View className='flex-1'>
              <Text className={`text-3xl font-extralight text-white mb-1`}>
                {level.nombre}
              </Text>
              <Text className={`text-base text-gray-300`}>
                {level.descripcion}
              </Text>
            </View>
            <Image source={level.icono} className="w-16 h-16 ml-2 rounded-full" />
          </TouchableOpacity>
        ))}

        {/* <TouchableOpacity
          className="bg-[#595959] px-5 py-3 rounded-lg mt-6"
          onPress={handleSave}>
          <Text className="text-white text-lg font-extralight">Guardar y Volver</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default RegisterYogaLevelScreen;
