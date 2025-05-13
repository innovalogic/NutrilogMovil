import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
    UpperBodyWorkout: { 
        exercise: string; 
        reps: string; 
        totalTime: number; 
        restTime: number; 
    };
    CronometroS: undefined; 
};

type UpperBodyWorkoutNavigationProp = StackNavigationProp<RootStackParamList, 'UpperBodyWorkout'>;
type UpperBodyWorkoutRouteProp = RouteProp<RootStackParamList, 'UpperBodyWorkout'>;

export default function RutinaSuperior() {
    const navigation = useNavigation<UpperBodyWorkoutNavigationProp>();
    const route = useRoute<UpperBodyWorkoutRouteProp>(); // Obtener los parámetros de la ruta

    const { exercise, reps, totalTime, restTime } = route.params || {}; // Usa el tipo correcto
    const [expanded, setExpanded] = useState(false); // Estado para controlar el despliegue

    // Lista de consejos con enlaces
    const tips = [
        { title: 'Tips para mejorar la técnica', url: 'https://www.youtube.com/watch?v=H_e0t3iwyrM' },
        { title: 'Errores comunes', url: 'https://www.youtube.com/shorts/m4baLYJPFs4' }
    ];

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="p-4 border-b border-gray-700" style={{ marginTop: StatusBar.currentHeight }}>
                <Text className="text-2xl font-bold text-white">Rutina Superior</Text>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1">
                {/* Hero Image */}
                <View className="h-64 w-full bg-gray-700 rounded-lg overflow-hidden">
                    <Image source={require('../../assets/pull_up.jpg')} className="w-full h-full object-cover" />
                </View>

                {/* Workout Description */}
                <View className="p-4">
                    <Text className="text-gray-300 mb-4">Fortalece la parte superior del cuerpo con estos ejercicios.</Text>

                    {/* Exercises Section */}
                    <Text className="text-xl font-bold text-white mb-2">Ejercicios</Text>
                    <View className="mb-4">
                        {[
                            { name: 'Flexión de brazos', weight: 'Peso corporal', sets: '3x15' },
                            { name: 'Press de Banca', weight: '90lb', sets: '5x5' },
                            { name: 'Dominadas', weight: 'Peso corporal', sets: '3x10' },
                            { name: 'Elevación de Hombros', weight: '15lb', sets: '3x12' },
                        ].map((exercise, index) => (
                            <View key={index} className="flex-row bg-gray-800 rounded-lg p-4 mb-2">
                                <View className="flex-1">
                                    <Text className="font-bold text-white">{exercise.name}</Text>
                                    <Text className="text-gray-400">{exercise.weight}</Text>
                                    <Text className="text-gray-400">{exercise.sets}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Mostrar los datos del cronómetro */}
                    {exercise && (
                        <Text className="text-white">Ejercicio: {exercise}</Text>
                    )}
                    {reps && (
                        <Text className="text-white">Repeticiones: {reps}</Text>
                    )}
                    {totalTime !== undefined && (
                        <Text className="text-white">Tiempo total: {totalTime} s</Text>
                    )}
                    {restTime !== undefined && (
                        <Text className="text-white">Tiempo de descanso: {restTime} s</Text>
                    )}

                    {/* Tips Section */}
                    <Text className="text-xl font-bold text-white mb-2">Consejos</Text>
                    <TouchableOpacity onPress={() => setExpanded(!expanded)} className="flex-row justify-between bg-gray-800 p-4 rounded-lg mb-2">
                        <Text className="text-white">Ver Consejos</Text>
                        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#fff" />
                    </TouchableOpacity>
                    {expanded && (
                        <View className="bg-gray-700 rounded-lg p-4 mb-4">
                            {tips.map((tip, index) => (
                                <TouchableOpacity key={index} onPress={() => Linking.openURL(tip.url)} className="flex-row items-center mb-2">
                                    <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                                    <Text className="text-blue-400 underline ml-2">{tip.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Start Workout Button */}
            <View className="p-4">
                <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-lg" onPress={() => navigation.navigate('CronometroS')}>
                    <Text className="text-center text-white font-bold">Iniciar Ejercicio</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}