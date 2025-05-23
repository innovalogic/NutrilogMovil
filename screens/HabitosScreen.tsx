import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import BottomNavBar from '../Componentes/BottomNavBar';

type RootStackParamList = {
  Habitos: undefined;
  Entrenamiento: undefined;
  Yoga: undefined;
  RegistroCardioLevel: undefined;
  RegistroYogaLevel: undefined;
};

type HabitosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HabitosScreen() {
  const navigation = useNavigation<HabitosScreenNavigationProp>();
  const [habitosFisicos, setHabitosFisicos] = useState<string[]>([]);

  useEffect(() => {
    const fetchHabitos = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const habitosFisicosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosFisicos');
          const snapshot = await getDocs(habitosFisicosRef);

          const habitos = snapshot.docs.map(doc => doc.data().habitoSeleccionado);
          setHabitosFisicos(habitos);
        } catch (error) {
          console.error('Error al obtener los hábitos:', error);
          Alert.alert('Error', 'No se pudieron cargar tus hábitos.');
        }
      }
    };

    fetchHabitos();
  }, []);

  const handleHabitPress = (habit: string) => {
    if (habit === 'Yoga') {
      navigation.navigate('RegistroYogaLevel');
    } else if (habit === 'Entrenamiento') {
      navigation.navigate('Entrenamiento');
    } else if (habit === 'Cardio') {
      navigation.navigate('RegistroCardioLevel');
    }
  };

  // ✅ Puedes mapear imágenes según el hábito
  const habitImages: Record<string, any> = {
    'Yoga': require('../assets/yogamenu.png'),
    'Entrenamiento': require('../assets/gymmenu.png'),
    'Cardio': require('../assets/cardiomenu.png'),
    // Puedes agregar más aquí si quieres.
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="items-center mt-12 mb-6 px-4">
        <Text className="text-2xl font-bold text-white">Tus Hábitos Físicos</Text>
      </View>

      <View className="flex-1 px-6">
        {habitosFisicos.length > 0 ? (
          <FlatList
            data={habitosFisicos}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleHabitPress(item)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  paddingVertical: 20,
                  paddingHorizontal: 20,
                  marginBottom: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 6,
                }}
              >
                {/* Imagen arriba */}
                <Image
                  source={habitImages[item] || require('../assets/yogamenu.png')}
                  style={{
                    width: 80,
                    height: 80,
                    marginBottom: 12,
                    borderRadius: 40,
                    resizeMode: 'cover',
                  }}
                />
                {/* Texto debajo */}
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">No tienes hábitos registrados aún.</Text>
          </View>
        )}
      </View>

      <BottomNavBar />
    </View>
  );
}
