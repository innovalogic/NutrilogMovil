import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { auth, firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import BajarDePesoComponent from './BajarDePesoComponent';

interface UserData {
  weightGoal?: number;
  weight?: string;  // Cambiado a string para coincidir con HomePerfilScreen
}

export default function BajarDePeso() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightGoalInput, setWeightGoalInput] = useState('');

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
      <View className="py-14 items-center">
        <Text className="text-white text-3xl font-bold">Control de Peso</Text>
      </View>

      <View className="bg-gray-800 rounded-2xl p-6 mb-6">
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-gray-800 rounded-xl p-6 w-4/5">
            <Text className="text-white text-xl font-semibold mb-4">Nueva meta de peso</Text>
            
            {/* Muestra el peso actual (recuperado de Firestore) */}
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

      <BajarDePesoComponent userData={userData} />
    </SafeAreaView>
  );
}