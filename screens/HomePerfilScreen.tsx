import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase'; // Importa desde tu archivo firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import BottomNavBar from '../Componentes/BottomNavBar';
import { useNavigation } from '@react-navigation/native'; // Asegúrate de importar useNavigation

// Definir un tipo para los datos del usuario
interface UserData {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  height?: string;
  weight?: string;
}

export default function HomePerfilScreen() {
  const navigation = useNavigation(); // Tipado automático con useNavigation
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData); // Casteo explícito a UserData
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error('Error al obtener datos de Firestore:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        navigation.navigate('Login' as never); // Casteo para evitar errores de navegación
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigation]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#5F75E4] items-center justify-center">
        <Text className="text-white text-lg">Cargando...</Text>
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  // Formatear la fecha de nacimiento
  const birthDate = userData.birthDate
    ? new Date(userData.birthDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'No disponible';

  return (
    <View className="flex-1 bg-[#5F75E4] relative">
      <View className="items-center p-20">
        <Text className="text-white text-2xl font-bold">Perfil</Text>
      </View>
      <View className="p-4">
        <View className="mt-[-10%]">
          <Image
            source={require('../assets/Perfil.png')}
            className="w-36 h-80 ml-8"
            resizeMode="contain"
          />
        </View>
        <View>
          <Text className="text-white text-lg font-semibold mt-4 ml-8">
            {userData.fullName || 'Usuario sin nombre'}
          </Text>
          <Text className="text-white text-base mt-2 ml-8">
            Fecha de nacimiento: {birthDate}
          </Text>
          <Text className="text-white text-base mt-2 ml-8">
            Género: {userData.gender || 'No especificado'}
          </Text>
          <Text className="text-white text-base mt-2 ml-8">
            Altura: {userData.height ? `${userData.height} m` : 'No disponible'}
          </Text>
          <Text className="text-white text-base mt-2 ml-8">
            Peso: {userData.weight ? `${userData.weight} kg` : 'No disponible'}
          </Text>
          <TouchableOpacity
            className="bg-[#FF6464] rounded-full py-3 px-4 mt-4 ml-32 w-[150px] items-center"
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <Text className="text-white text-base font-semibold">Editar perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="absolute bottom-0 w-full">
        <BottomNavBar />
      </View>
    </View>
  );
}