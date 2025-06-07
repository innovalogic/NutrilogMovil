import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { auth, firestore } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';

export default function ProgresoAudioInspira() {
  const [listenedCount, setListenedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAudioProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const audiosRef = collection(firestore, 'users', user.uid, 'audios');
      const snapshot = await getDocs(audiosRef);
      setListenedCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching audio progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioProgress();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAudioProgress();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View className="bg-blue-800 rounded-3xl p-6 mb-6 shadow-2xl border border-blue-700">
      <View className="items-center">
        <Text style={{ fontSize: 48 }}>🎧</Text>
        <Text className="text-white text-xl font-bold mt-4 text-center">Progreso de Audios</Text>
        <Text className="text-gray-200 text-base mt-2 text-center">
          Has escuchado <Text className="font-bold">{listenedCount}</Text> audios hasta ahora.
        </Text>
      </View>
    </View>
  );
}
