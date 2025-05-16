import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

type RootStackParamList = {
    RutinaSuperior: undefined;
    RutinaMedio: undefined;
    RutinaInferior: undefined;
    CronometroI: undefined; 
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const RutinaInferior = () => {
    const navigation = useNavigation<HabitScreenNavigationProp>();

    const handleStart = () => {
        navigation.navigate('CronometroI'); 
    };

    return (
        <View className="flex-1 bg-[#111418] justify-between">
            <ScrollView>
                <View className="flex flex-row items-center bg-[#111418] p-4 pb-2 justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="text-white size-12 shrink-0 items-center"
                    >
                        <Text className="text-white text-2xl">←</Text>
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold leading-tight flex-1 text-center pr-12">
                        Rutina Inferior
                    </Text>
                </View>

                <ImageBackground
                    source={{
                        uri: "https://cdn.usegalileo.ai/sdxl10/feffc400-caea-4fa2-b73a-07d60dd4e149.png",
                    }}
                    className="w-full bg-center bg-no-repeat flex flex-col justify-end overflow-hidden rounded-xl min-h-[218px]"
                    style={{ aspectRatio: 16 / 9 }}
                />

                <Text className="text-white text-[22px] font-bold leading-tight px-4 text-left pb-3 pt-5">
                    Fortalece tus piernas y mejora tu potencia
                </Text>
                <Text className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
                    Esta rutina está diseñada para trabajar la parte inferior del cuerpo, enfocándose en los músculos de las piernas y glúteos.
                </Text>

                <Text className="text-white text-lg font-bold leading-tight px-4 pb-2 pt-4">Ejercicios</Text>

                {[
                    {
                        name: 'Sentadillas',
                        sets: '3 series, 12 reps',
                    },
                    {
                        name: 'Peso Muerto',
                        sets: '3 series, 12 reps',
                    },
                    {
                        name: 'Zancadas',
                        sets: '3 series, 12 reps',
                    },
                    {
                        name: 'Elevaciones de talones',
                        sets: '3 series, 12 reps',
                    },
                ].map((exercise, index) => (
                    <View
                        key={index}
                        className="flex flex-row gap-4 bg-[#111418] px-4 min-h-[72px] py-2 justify-between"
                    >
                        <View className="flex flex-col justify-center">
                            <Text className="text-white text-base font-medium leading-normal">
                                {exercise.name}
                            </Text>
                            <Text className="text-[#9caaba] text-sm font-normal leading-normal">
                                {exercise.sets}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Tips Section */}
                <Text className="text-xl font-bold text-white mb-2">Consejos</Text>
                    <View className="w-full h-64 mb-5 rounded-xl overflow-hidden border border-gray-600">
                        <WebView 
                            source={{ uri: 'https://www.youtube.com/watch?v=SasACgGscHg' }} 
                            style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}

                        />
                    </View>

                    <Text className="text-xl font-bold text-white mb-2">Errores</Text>
                    <View className="w-full h-64 mb-5 rounded-xl overflow-hidden border border-gray-600">
                        <WebView 
                            source={{ uri: 'https://www.youtube.com/watch?v=g72DHPfg8iY' }} 
                            style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}

                        />
                    </View>

            </ScrollView>

            {/* Start Workout Button */}
            <View className="p-4">
                <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-lg" onPress={handleStart}>
                    <Text className="text-center text-white font-bold">Iniciar Ejercicio</Text>
                </TouchableOpacity>
            </View>

            <View className="h-5 bg-[#111418]" />
        </View>
    );
};

export default RutinaInferior;