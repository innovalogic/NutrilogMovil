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
  BajarDePeso: undefined;
  RegistroDietaMantenerPeso: undefined;
  RegistroDietaSubirPeso: undefined;
  RegistroLecturaDiaria: undefined;
  AudioInspira: undefined;
  Origami: undefined;
  RegistroHabitosCategorias:undefined;
};

type HabitosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HabitosScreen() {
  const navigation = useNavigation<HabitosScreenNavigationProp>();
  const [habitosFisicos, setHabitosFisicos] = useState<string[]>([]);
  const [habitosAlimenticios, setHabitosAlimenticios] = useState<string[]>([]);
  const [habitosSaludMental, setHabitosSaludMental] = useState<string[]>([]);

  useEffect(() => {
    const fetchHabitos = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Recuperar hábitos físicos
          const habitosFisicosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosFisicos');
          const fisicosSnapshot = await getDocs(habitosFisicosRef);
          const habitosFisicos = fisicosSnapshot.docs.map(doc => doc.data().habitoSeleccionado);
          setHabitosFisicos(habitosFisicos);

          // Recuperar hábitos alimenticios
          const habitosAlimenticiosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios');
          const alimenticiosSnapshot = await getDocs(habitosAlimenticiosRef);
          const habitosAlimenticios = alimenticiosSnapshot.docs.map(doc => doc.data().habitoSeleccionado);
          setHabitosAlimenticios(habitosAlimenticios);

          // Recuperar hábitos de salud mental
          const habitosSaludMentalRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosSaludMental');
          const saludMentalSnapshot = await getDocs(habitosSaludMentalRef);
          const habitosSaludMental = saludMentalSnapshot.docs.map(doc => doc.data().habitoSeleccionado);
          setHabitosSaludMental(habitosSaludMental);
        } catch (error) {
          console.error('Error al obtener los hábitos:', error);
          Alert.alert('Error', 'No se pudieron cargar tus hábitos.');
        }
      }
    };

    fetchHabitos();
  }, []);

  const handleHabitPress = (habit: string) => {
    // Hábitos físicos
    if (habit === 'Yoga') {
      navigation.navigate('RegistroYogaLevel');
    } else if (habit === 'Entrenamiento') {
      navigation.navigate('Entrenamiento');
    } else if (habit === 'Cardio') {
      navigation.navigate('RegistroCardioLevel');
    }
    // Hábitos alimenticios
    else if (habit === 'Dieta Para Bajar de Peso') {
      navigation.navigate('BajarDePeso');
    } else if (habit === 'Dieta Para Mantener el Peso') {
      navigation.navigate('RegistroDietaMantenerPeso');
    } else if (habit === 'Dieta Para Subir de Peso') {
      navigation.navigate('RegistroDietaSubirPeso');
    }
    // Hábitos de salud mental
    else if (habit === 'Lectura diaria') {
      navigation.navigate('RegistroLecturaDiaria');
    } else if (habit === 'Audio-Inspira') {
      navigation.navigate('AudioInspira');
    } else if (habit === 'Origami Diario') {
      navigation.navigate('Origami');
    }
  };

  // Mapear imágenes según el hábito
  const habitImages: Record<string, any> = {
    'Yoga': require('../assets/yogamenu.png'),
    'Entrenamiento': require('../assets/gymmenu.png'),
    'Cardio': require('../assets/cardiomenu.png'),
    'Dieta Para Bajar de Peso': require('../assets/DietaBajarPeso.png'),
    'Dieta Para Mantener el Peso': require('../assets/DietaMantenerPeso.png'),
    'Dieta Para Subir de Peso': require('../assets/DietaSubirPeso.png'),
    'Lectura diaria': require('../assets/LecturaDiaria.png'),
    'Video-Inspira': require('../assets/VideoInspira.png'),
    'Origami Diario': require('../assets/Origami.png'),
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="items-center mt-12 mb-6 px-4">
        <Text className="text-2xl font-bold text-white">Tus Hábitos</Text>
      </View>

      <View className="flex-1 px-6">
        {habitosFisicos.length > 0 || habitosAlimenticios.length > 0 || habitosSaludMental.length > 0 ? (
          <>
            {/* Hábitos físicos */}
            {habitosFisicos.length > 0 && (
              <>
                <Text className="text-xl font-semibold text-white mb-4">Hábitos Físicos</Text>
                <FlatList
                  data={habitosFisicos}
                  keyExtractor={(item, index) => `fisico-${index}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
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
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {/* Hábitos alimenticios */}
            {habitosAlimenticios.length > 0 && (
              <>
                <Text className="text-xl font-semibold text-white mb-4">Hábitos Alimenticios</Text>
                <FlatList
                  data={habitosAlimenticios}
                  keyExtractor={(item, index) => `alimenticio-${index}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
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
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {/* Hábitos de salud mental */}
            {habitosSaludMental.length > 0 && (
              <>
                <Text className="text-xl font-semibold text-white mb-4">Hábitos de Salud Mental</Text>
                <FlatList
                  data={habitosSaludMental}
                  keyExtractor={(item, index) => `saludMental-${index}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
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
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">No tienes hábitos registrados aún.</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('RegistroHabitosCategorias')}
        style={{
          backgroundColor: '#2563eb',
          borderRadius: 30,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+ Añadir Hábito</Text>
      </TouchableOpacity>

      <BottomNavBar />
    </View>
  );
}