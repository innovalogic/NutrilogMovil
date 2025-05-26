import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';

type RootStackParamList = {
    UpperBodyWorkout: undefined;
    CronometroS: undefined;
};

type UpperBodyWorkoutNavigationProp = StackNavigationProp<RootStackParamList, 'UpperBodyWorkout'>;

export default function RutinaSuperior() {
    const navigation = useNavigation<UpperBodyWorkoutNavigationProp>();

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="p-4 border-b border-gray-700" style={{ marginTop: StatusBar.currentHeight }}>
                <Text className="text-2xl font-bold text-white">Rutina Superior</Text>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="text-white size-12 shrink-0 items-center"
                >
                    <Text className="text-white text-2xl">←</Text>
                </TouchableOpacity>

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

                    {/* Tips Section with WebView */}
                    <Text className="text-xl font-bold text-white mb-2">Consejos</Text>
                    <View className="w-full h-64 mb-5 rounded-xl overflow-hidden border border-gray-600">
                        <WebView 
                            source={{ uri: 'https://youtu.be/H_e0t3iwyrM?si=hcvvdmsKlQlVNTbe' }} 
                            style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                        />
                    </View>

                    <Text className="text-xl font-bold text-white mb-2">Errores</Text>
                    <View className="w-full h-64 mb-5 rounded-xl overflow-hidden border border-gray-600">
                        <WebView 
                            source={{ uri: 'https://www.youtube.com/shorts/m4baLYJPFs4' }} 
                            style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                        />
                    </View>
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

