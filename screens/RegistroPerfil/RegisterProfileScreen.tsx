import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { RadioButton } from 'react-native-paper'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  RegistroHabitosCategorias: undefined;
};

const RegisterProfileScreen = () => {
  const [fullName, setFullName] = useState<string>('');
  const [gender, setGender] = useState<string>(''); 
  const [birthDate, setBirthDate] = useState<Date>(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false); 
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  const handleSubmitProfile = async () => {
    if (!fullName || !gender || !birthDate || !height || !weight) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    const user = auth.currentUser; 

    if (!user) {
      Alert.alert('Error', 'No se encontró un usuario autenticado');
      console.log('No authenticated user found');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        fullName,
        gender,
        birthDate: birthDate.toISOString(), 
        height,
        weight,
      });

      Alert.alert('¡Perfil Guardado!', 'Tu perfil ha sido guardado exitosamente.');
      console.log('Navigating to RegistroHabitosCategorias');
      navigation.navigate('RegistroHabitosCategorias');
    } catch (error: any) {
      Alert.alert('Error', 'Hubo un problema al guardar tu perfil');
      console.error('Firebase error:', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-red-500 p-5">
      <Text className="text-3xl font-bold text-black mb-2">Empecemos a conocerte!</Text>
      <Text className="text-sm text-black mb-5 text-center mx-2">Nosotros usaremos esta información para sugerirte hábitos saludables.</Text>

      <TextInput
        className="w-full h-12 bg-white border-2 border-black rounded-md mb-5 px-3"
        placeholder="Nombre Usuario"
        value={fullName}
        onChangeText={setFullName}
      />

      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)} 
        className="w-full h-12 bg-white border-2 border-black rounded-md mb-5 px-3 justify-center"
      >
        <Text className="text-black text-lg">
          {birthDate ? birthDate.toLocaleDateString() : 'Fecha de Nacimiento (MM/DD/YYYY)'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text className="text-lg font-bold text-black mb-3">Género</Text>
      <View className="flex-row items-center mb-5">
        <RadioButton
          value="Femenino"
          status={gender === 'Femenino' ? 'checked' : 'unchecked'}
          onPress={() => setGender('Femenino')}
        />
        <Text>Femenino</Text>
        <RadioButton
          value="Masculino"
          status={gender === 'Masculino' ? 'checked' : 'unchecked'}
          onPress={() => setGender('Masculino')}
        />
        <Text>Masculino</Text>
        <RadioButton
          value="Otro"
          status={gender === 'Otro' ? 'checked' : 'unchecked'}
          onPress={() => setGender('Otro')}
        />
        <Text>Otro</Text>
      </View>

      <TextInput
        className="w-full h-12 bg-white border-2 border-black rounded-md mb-5 px-3"
        placeholder="Altura (ej. 1.75)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <TextInput
        className="w-full h-12 bg-white border-2 border-black rounded-md mb-5 px-3"
        placeholder="Peso (ej. 60kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <TouchableOpacity 
        className="items-center bg-blue-600 w-full py-3 rounded-md mb-5"
        onPress={() => handleSubmitProfile()}
      >
        <Text className="text-white font-bold text-lg">Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterProfileScreen;