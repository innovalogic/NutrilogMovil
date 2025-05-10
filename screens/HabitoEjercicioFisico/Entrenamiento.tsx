import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    RutinaSuperior: undefined;
    RutinaMedio: undefined;
    RutinaInferior: undefined;
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const EntrenamientoScreen = () => {
    const navigation = useNavigation<HabitScreenNavigationProp>();

    const handleNavigation = (route: keyof RootStackParamList) => {
        navigation.navigate(route);
    };

    return (
        <View className="flex-1 bg-blue-200 items-center justify-center p-5">
            <Text className="text-2xl font-bold mb-2">Actividad de Entrenamiento</Text>
            <Text className="text-xl mb-5">Selecciona tu nivel de inicio</Text>

            <TouchableOpacity className="bg-white rounded-lg p-4 mb-2 w-full shadow-md" onPress={() => handleNavigation('RutinaSuperior')}>
                <Text className="text-lg font-semibold">Rutina de Tren Superior</Text>
                <Text className="text-sm text-gray-600">Enfocada en el fortalecimiento de la parte superior del cuerpo</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-lg p-4 mb-2 w-full shadow-md" onPress={() => handleNavigation('RutinaMedio')}>
                <Text className="text-lg font-semibold">Rutina de Tren Medio</Text>
                <Text className="text-sm text-gray-600">Favorece la estabilidad, el equilibrio y la postura</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-lg p-4 mb-2 w-full shadow-md" onPress={() => handleNavigation('RutinaInferior')}>
                <Text className="text-lg font-semibold">Rutina de Tren Inferior</Text>
                <Text className="text-sm text-gray-600">Aumenta la potencia, la resistencia y la movilidad</Text>
            </TouchableOpacity>
        </View>
    );
};

export default EntrenamientoScreen;