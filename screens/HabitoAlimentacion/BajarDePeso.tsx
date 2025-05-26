import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { auth, firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import BajarDePeso from './BajarDePeso';

export default function HomePerfilScreen() {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightGoal, setWeightGoal] = useState<number | null>(null);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData(data);
          setWeightGoal(data.weightGoal || null);
        } else {
          setUserData(null);
          setWeightGoal(null);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      setUserData(null);
      setWeightGoal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData();
      } else {
        setUserData(null);
        setWeightGoal(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg font-medium">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-6">
      <View className="py-14 items-center">
        <Text className="text-white text-3xl font-bold tracking-tight">Mi Perfil</Text>
      </View>
      <View className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <Text className="text-white text-2xl font-semibold mb-4">
          Tu Meta de Peso
        </Text>
        {weightGoal !== null ? (
          <Text className="text-white text-base">
            Tu meta es bajar {weightGoal} kg.
          </Text>
        ) : (
          <Text className="text-gray-400 text-base">
            No tienes una meta de peso configurada.
          </Text>
        )}
        <TouchableOpacity
          className="mt-4 bg-blue-500 py-3 px-6 rounded-lg"
          onPress={fetchUserData}
        >
          <Text className="text-white font-semibold text-center">
            Actualizar Meta
          </Text>
        </TouchableOpacity>
      </View>
      <BajarDePeso />
    </SafeAreaView>
  );
}
