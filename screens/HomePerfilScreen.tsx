import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import BottomNavBar from '../Componentes/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface UserData {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  height?: string;
  weight?: string;
}

const wellnessTips = [
  { category: 'Physical', tip: '¡Intenta una caminata de 10 minutos para aumentar tu energía hoy!' },
  { category: 'Mental', tip: 'Realiza 5 respiraciones profundas para reducir el estrés.' },
  { category: 'Nutrition', tip: '¡Agrega una verdura colorida a tu próxima comida!' },
  { category: 'Physical', tip: 'Estírate durante 5 minutos para mejorar la flexibilidad.' },
  { category: 'Mental', tip: 'Escribe 3 cosas por las que estés agradecido.' },
  { category: 'Nutrition', tip: 'Mantente hidratado, ¡Siempre es un buen momento para beber agua!' },
];

export default function HomePerfilScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState(wellnessTips[0]);

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
        navigation.navigate('InicioSesion' as never); // Cambiado a InicioSesion
      }
      setLoading(false);
    });

    const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    setDailyTip(randomTip);

    return () => unsubscribe();
  }, [navigation]);

  const handleSignOut = async () => {
    setLoading(true); // Mostrar pantalla de carga durante el cierre
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Inicio' as never }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLoading(false); // Ocultar carga en caso de error
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg font-medium">Cargando...</Text>
      </SafeAreaView>
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
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="items-center py-14 bg-gray-900 shadow-md">
        <Text className="text-white text-3xl font-bold tracking-tight">Mi Perfil</Text>
      </View>

      <View className="flex-1 px-6 py-16">
        <View className="bg-gray-800 rounded-2xl shadow-lg p-6 mx-2">
          <View className="flex-row items-center mb-6">
            <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FF6464] shadow-md">
              <Image
                source={require('../assets/Perfil.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-2xl font-semibold tracking-wide">
                {userData.fullName || 'Usuario sin nombre'}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Miembro desde 2025</Text>
            </View>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#FF6464" />
              <Text className="text-white text-base ml-3">
                Fecha de nacimiento: {birthDate}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={20} color="#FF6464" />
              <Text className="text-white text-base ml-3">
                Género: {userData.gender || 'No especificado'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="resize-outline" size={20} color="#FF6464" />
              <Text className="text-white text-base ml-3">
                Altura: {userData.height ? `${userData.height} m` : 'No disponible'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="barbell-outline" size={20} color="#FF6464" />
              <Text className="text-white text-base ml-3">
                Peso: {userData.weight ? `${userData.weight} kg` : 'No disponible'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="mt-8 rounded-full overflow-hidden"
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <LinearGradient
              colors={['#FF6464', '#FF8A8A']}
              className="py-3 px-6 items-center rounded-full"
            >
              <Text className="text-white text-base font-semibold tracking-wide">
                Editar Perfil
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 rounded-full overflow-hidden"
            onPress={handleSignOut}
          >
            <LinearGradient
              colors={['#FF6464', '#FF8A8A']}
              className="py-3 px-6 items-center rounded-full"
            >
              <Text className="text-white text-base font-semibold tracking-wide">
                Cerrar Sesión
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View className="mt-6 bg-gray-800 rounded-2xl shadow-lg p-6 mx-2">
          <Text className="text-white text-xl font-semibold mb-3">Consejo del Día</Text>
          <View className="flex-row items-center">
            <Ionicons
              name={
                dailyTip.category === 'Physical'
                  ? 'bicycle-outline'
                  : dailyTip.category === 'Mental'
                  ? 'heart-outline'
                  : 'nutrition-outline'
              }
              size={24}
              color="#FF6464"
            />
            <Text className="text-white text-base ml-3 flex-1">{dailyTip.tip}</Text>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 w-full">
        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
}