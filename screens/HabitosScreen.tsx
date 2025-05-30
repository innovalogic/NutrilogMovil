import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import BottomNavBar from '../Componentes/BottomNavBar';

type RootStackParamList = {
  Habitos: undefined;
  Entrenamiento: undefined;
  Yoga: undefined;
  RegistroCardioLevel: undefined;
  RegistroYogaLevel: undefined;
  RegistroDietaBajarPeso: undefined;
  DietaMantenerPeso: undefined;
  BajarDePeso: undefined;
  RegistroDietaMantenerPeso: undefined;
  RegistroDietaSubirPeso: undefined;
  RegistroLecturaDiaria: undefined;
  AudioInspira: undefined;
  Origami: undefined;
  RegistroHabitosCategorias: undefined;
};

type HabitosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HabitosScreen() {
  const navigation = useNavigation<HabitosScreenNavigationProp>();
  const [habitosFisicos, setHabitosFisicos] = useState<{ id: string; habito: string }[]>([]);
  const [habitosAlimenticios, setHabitosAlimenticios] = useState<{ id: string; habito: string }[]>([]);
  const [habitosSaludMental, setHabitosSaludMental] = useState<{ id: string; habito: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<{ id: string; habito: string; category: string } | null>(null);

  useEffect(() => {
    const fetchHabitos = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Recuperar hábitos físicos
          const habitosFisicosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosFisicos');
          const fisicosSnapshot = await getDocs(habitosFisicosRef);
          const habitosFisicos = fisicosSnapshot.docs.map(doc => ({
            id: doc.id,
            habito: doc.data().habitoSeleccionado,
          }));
          setHabitosFisicos(habitosFisicos);

          // Recuperar hábitos alimenticios
          const habitosAlimenticiosRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosAlimenticios');
          const alimenticiosSnapshot = await getDocs(habitosAlimenticiosRef);
          const habitosAlimenticios = alimenticiosSnapshot.docs.map(doc => ({
            id: doc.id,
            habito: doc.data().habitoSeleccionado,
          }));
          setHabitosAlimenticios(habitosAlimenticios);

          // Recuperar hábitos de salud mental
          const habitosSaludMentalRef = collection(firestore, 'habitosUsuarios', user.uid, 'habitosSaludMental');
          const saludMentalSnapshot = await getDocs(habitosSaludMentalRef);
          const habitosSaludMental = saludMentalSnapshot.docs.map(doc => ({
            id: doc.id,
            habito: doc.data().habitoSeleccionado,
          }));
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
      navigation.navigate('DietaMantenerPeso');
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

  const handleLongPress = (id: string, habito: string, category: string) => {
    setSelectedHabit({ id, habito, category });
    setModalVisible(true);
  };

  const handleDeleteHabit = async () => {
    if (!selectedHabit) return;

    const user = auth.currentUser;
    if (user) {
      try {
        const collectionPath =
          selectedHabit.category === 'fisicos'
            ? 'habitosFisicos'
            : selectedHabit.category === 'alimenticios'
            ? 'habitosAlimenticios'
            : 'habitosSaludMental';
        const habitDocRef = doc(firestore, 'habitosUsuarios', user.uid, collectionPath, selectedHabit.id);
        await deleteDoc(habitDocRef);

        // Update state to remove the deleted habit
        if (selectedHabit.category === 'fisicos') {
          setHabitosFisicos(habitosFisicos.filter(habit => habit.id !== selectedHabit.id));
        } else if (selectedHabit.category === 'alimenticios') {
          setHabitosAlimenticios(habitosAlimenticios.filter(habit => habit.id !== selectedHabit.id));
        } else {
          setHabitosSaludMental(habitosSaludMental.filter(habit => habit.id !== selectedHabit.id));
        }

        setModalVisible(false);
        setSelectedHabit(null);
        Alert.alert('Éxito', 'El hábito ha sido eliminado.');
      } catch (error) {
        console.error('Error al eliminar el hábito:', error);
        Alert.alert('Error', 'No se pudo eliminar el hábito.');
      }
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
    'Audio-Inspira': require('../assets/AudioInspira.png'),
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
                  keyExtractor={item => `fisico-${item.id}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleHabitPress(item.habito)}
                      onLongPress={() => handleLongPress(item.id, item.habito, 'fisicos')}
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
                        source={habitImages[item.habito] || require('../assets/yogamenu.png')}
                        style={{
                          width: 80,
                          height: 80,
                          marginBottom: 12,
                          borderRadius: 40,
                          resizeMode: 'cover',
                        }}
                      />
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item.habito}</Text>
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
                  keyExtractor={item => `alimenticio-${item.id}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleHabitPress(item.habito)}
                      onLongPress={() => handleLongPress(item.id, item.habito, 'alimenticios')}
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
                        source={habitImages[item.habito] || require('../assets/yogamenu.png')}
                        style={{
                          width: 80,
                          height: 80,
                          marginBottom: 12,
                          borderRadius: 40,
                          resizeMode: 'cover',
                        }}
                      />
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item.habito}</Text>
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
                  keyExtractor={item => `saludMental-${item.id}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleHabitPress(item.habito)}
                      onLongPress={() => handleLongPress(item.id, item.habito, 'saludMental')}
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
                        source={habitImages[item.habito] || require('../assets/yogamenu.png')}
                        style={{
                          width: 80,
                          height: 80,
                          marginBottom: 12,
                          borderRadius: 40,
                          resizeMode: 'cover',
                        }}
                      />
                      <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937' }}>{item.habito}</Text>
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

      {/* Modal para confirmar eliminación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '80%', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              ¿Deseas eliminar este hábito?
            </Text>
            <Text style={{ fontSize: 16, color: '#4b5563', marginBottom: 20, textAlign: 'center' }}>
              Todos los datos asociados a "{selectedHabit?.habito}" serán eliminados permanentemente.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: '#6b7280',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  flex: 1,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteHabit}
                style={{
                  backgroundColor: '#dc2626',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  flex: 1,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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