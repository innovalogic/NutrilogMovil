import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ProgresoAudioInspira() {
  const [loading, setLoading] = useState(true);
  const [totalListened, setTotalListened] = useState(0);

  useEffect(() => {
    const fetchAudioProgress = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const categoriasRef = collection(
          firestore,
          'users',
          user.uid,
          'audioInspira'
        );
        const categoriasSnap = await getDocs(categoriasRef);
        let count = 0;

        for (const catDoc of categoriasSnap.docs) {
          const audiosRef = collection(
            firestore,
            'users',
            user.uid,
            'audioInspira',
            catDoc.id,
            'audios'
          );
          const audiosSnap = await getDocs(audiosRef);
          count += audiosSnap.size;
        }

        setTotalListened(count);
      } catch (error) {
        console.error('Error loading audio progres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioProgress();
  }, []);

  if (loading) {
    return (
      <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700 items-center">
        <ActivityIndicator size="large" color="#90cdf4" />
        <Text className="text-white mt-2">Cargando progreso de audio...</Text>
      </View>
    );
  }

  return (
    <View className="bg-green-800 rounded-3xl p-6 mb-6 shadow-2xl border border-green-700">
      <View className="items-center">
        <Text style={{ fontSize: 48 }}>🔊</Text>
        <Text className="text-white text-xl font-bold mt-4">Progreso Audio Inspira</Text>
        <Text className="text-gray-200 text-base mt-2 text-center">
          Has escuchado <Text className="font-semibold">{totalListened}</Text> audios inspiradores.
        </Text>
      </View>
    </View>
  );
}
