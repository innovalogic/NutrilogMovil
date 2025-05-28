import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import ReminderButton from 'Componentes/ReminderButton';

// Define the navigation stack's param list
type RootStackParamList = {
  DesayunoBajarDePeso: undefined;
  AlmuerzoBajarDePeso: undefined;
  CenaBajarDePeso: undefined;
};

// Define navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  weightGoal?: number;
  weight?: string;
  breakfastReminder?: string;
  lunchReminder?: string;
  dinnerReminder?: string;
}

export default function BajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightGoalInput, setWeightGoalInput] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data() as UserData);
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const saveWeightGoal = async () => {
    if (!auth.currentUser || !weightGoalInput) return;
    
    try {
      const weightGoal = parseFloat(weightGoalInput);
      if (isNaN(weightGoal)) {
        alert('Ingrese un número válido');
        return;
      }
      if (weightGoal <= 0) {
        alert('La meta debe ser un número positivo mayor a 0');
        return;
      }

      await setDoc(doc(firestore, 'users', auth.currentUser.uid), 
        { weightGoal }, 
        { merge: true }
      );
      setModalVisible(false);
      setWeightGoalInput('');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-6">
      <View className="py-24 items-center">
        <Text className="text-white text-3xl font-bold">Habito Para Bajar de Peso</Text>
      </View>

      <View className="bg-gray-800 rounded-2xl p-8 mb-6">
        <Text className="text-white text-xl font-semibold mb-2">Tu progreso</Text>
        <Text className="text-white mb-1">
          Peso actual: {userData?.weight ? `${userData.weight} kg` : 'No disponible'}
        </Text>
        <Text className="text-white mb-4">
          Meta: {userData?.weightGoal ? `Bajar ${userData.weightGoal} kg` : 'Sin meta'}
        </Text>
        
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-lg"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white text-center font-semibold">
            {userData?.weightGoal ? 'Cambiar meta' : 'Establecer meta'}
          </Text>
        </TouchableOpacity>
      </View>

      {userData?.weightGoal && (
        <View className="mb-6">
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className="bg-green-500 py-3 px-4 rounded-lg flex-1 mr-2"
              onPress={() => navigation.navigate('DesayunoBajarDePeso')}
            >
              <Text className="text-white text-center font-semibold">Desayuno</Text>
            </TouchableOpacity>
            <ReminderButton 
              reminderTime={userData?.breakfastReminder} 
              fieldName="breakfastReminder" 
              label="Recordatorio Desayuno" 
            />
          </View>
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className="bg-yellow-500 py-3 px-4 rounded-lg flex-1 mr-2"
              onPress={() => navigation.navigate('AlmuerzoBajarDePeso')}
            >
              <Text className="text-white text-center font-semibold">Almuerzo</Text>
            </TouchableOpacity>
            <ReminderButton 
              reminderTime={userData?.lunchReminder} 
              fieldName="lunchReminder" 
              label="Recordatorio Almuerzo" 
            />
          </View>
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className="bg-red-500 py-3 px-4 rounded-lg flex-1 mr-2"
              onPress={() => navigation.navigate('CenaBajarDePeso')}
            >
              <Text className="text-white text-center font-semibold">Cena</Text>
            </TouchableOpacity>
            <ReminderButton 
              reminderTime={userData?.dinnerReminder} 
              fieldName="dinnerReminder" 
              label="Recordatorio Cena" 
            />
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-gray-800 rounded-xl p-6 w-4/5">
            <Text className="text-white text-xl font-semibold mb-4">Nueva meta de peso</Text>
            
            <Text className="text-white mb-2">
              Peso actual: {userData?.weight ? `${userData.weight} kg` : 'No disponible'}
            </Text>
            
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-6"
              placeholder="¿Cuántos kg quieres bajar?"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={weightGoalInput}
              onChangeText={setWeightGoalInput}
            />
            
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-600 px-6 py-2 rounded-lg"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-blue-500 px-6 py-2 rounded-lg"
                onPress={saveWeightGoal}
              >
                <Text className="text-white">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}