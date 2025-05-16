import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import BottomNavBar from '../Componentes/BottomNavBar';
import { useNavigation } from '@react-navigation/native';

interface UserData {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  height?: string;
  weight?: string;
}

export default function HomePerfilScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error('Error al obtener datos de Firestore:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        navigation.navigate('Login' as never);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigation]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-700 items-center justify-center">
        <Text className="text-white text-lg">Cargando...</Text>
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  const birthDate = userData.birthDate
    ? new Date(userData.birthDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'No disponible';

  return (
    <View className="flex-1 bg-gray-700 relative">
      <View className="items-center p-16">
        <Text className="text-white text-2xl font-bold">Perfil</Text>
      </View>
      <View className="p-16">
        <View className="mt-[-10%] flex-row items-center">
          <Image
            source={require('../assets/Perfil.png')}
            className="w-36 h-80"
            resizeMode="contain"
          />
          <Text className="text-white text-3xl font-semibold ml-12 flex-1">
            {userData.fullName || 'Usuario sin nombre'}
          </Text>
        </View>
        <View>
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