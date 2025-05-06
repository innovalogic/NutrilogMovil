import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UpperBodyWorkout() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="p-4 border-b border-gray-700">
                <Text className="text-2xl font-bold text-white">Rutina Superior</Text>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1">
                {/* Hero Image */}
                <View className="h-64 w-full bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                        source={require('../../assets/pull_up.jpg')}
                        className="w-full h-full object-cover"
                    />
                </View>

                {/* Workout Description */}
                <View className="p-4">
                    <Text className="text-gray-300 mb-4">
                        Fortalece la parte superior del cuerpo con estos ejercicios.
                    </Text>

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

                    {/* Tips Section */}
                    <Text className="text-xl font-bold text-white mb-2">Consejos</Text>
                    <View className="mb-4">
                        {['Tips para mejorar la técnica', 'Errores comunes'].map((tip, index) => (
                            <TouchableOpacity key={index} className="flex-row justify-between bg-gray-800 p-4 rounded-lg mb-2">
                                <Text className="text-white">{tip}</Text>
                                <Text className="text-gray-400">→</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Progress Section */}
                    <Text className="text-xl font-bold text-white mb-2">Tu Progreso</Text>
                    <View className="mb-4">
                        <Text className="text-gray-400">Peso levantado</Text>
                        <View className="flex-row items-baseline mb-2">
                            <Text className="text-3xl font-bold text-white">100lb</Text>
                            <Text className="ml-2 text-green-500">+20%</Text>
                        </View>
                        <Text className="text-gray-400 text-sm mb-2">1y</Text>

                        {/* Progress Graph */}
                        <View className="h-24 w-full bg-gray-700 rounded-lg mb-2">
                            <Text className="text-center text-gray-400">[Estadísticas]</Text>
                        </View>

                        {/* Months */}
                        <View className="flex-row justify-between text-gray-400">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                                <Text key={month}>{month}</Text>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Start Workout Button */}
            <View className="p-4">
                <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-lg">
                    <Text className="text-center text-white font-bold">Iniciar ejercicio</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}