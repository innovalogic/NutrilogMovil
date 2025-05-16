import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';

type RootStackParamList = {
    RutinaSuperior: undefined;
    RutinaMedio: undefined;
    RutinaInferior: undefined;
    CronometroM: undefined; 
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const RutinaMedia = () => {
    const navigation = useNavigation<HabitScreenNavigationProp>();
    
    const handleStart = () => {
        navigation.navigate('CronometroM'); 
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
                        Rutina Media
                    </Text>
                </View>

                <ImageBackground
                    source={{
                        uri: "https://cdn.usegalileo.ai/sdxl10/7c047579-e4a2-4638-8b3a-450b8441d314.png",
                    }}
                    className="w-full bg-center bg-no-repeat flex flex-col justify-end overflow-hidden rounded-xl min-h-[218px]"
                    style={{ aspectRatio: 16 / 9 }}
                />

                <Text className="text-white text-[22px] font-bold leading-tight px-4 text-left pb-3 pt-5">
                    Fortalece tu core y mejora la estabilidad
                </Text>
                <Text className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
                    Esta rutina está diseñada para trabajar la zona media del cuerpo, trabajando el abdomen, los oblicuos y la espalda baja. Estos ejercicios mejorarán el equilibrio y el control corporal.
                </Text>

                <Text className="text-white text-lg font-bold leading-tight px-4 pb-2 pt-4">Rutina</Text>

                {[
                    {
                        name: 'Plancha',
                        focus: 'Zona media',
                        sets: '3 serie, 30 segundos',
                        image: 'https://cdn.usegalileo.ai/sdxl10/da353b31-520a-46dc-994b-fbc30075aafa.png',
                    },
                    {
                        name: 'Giro ruso',
                        focus: 'Abdominales oblicuos',
                        sets: '3 serie, 10 reps',
                        image: 'https://cdn.usegalileo.ai/sdxl10/b151a634-139f-47b6-a95c-e5e4e9a7ee86.png',
                    },
                    {
                        name: 'Abdominales con peso',
                        focus: 'Zona media',
                        sets: '3 serie, 10 reps',
                        image: 'https://cdn.usegalileo.ai/sdxl10/b4f5e0c4-8285-4910-b1b3-8e0685f5c382.png',
                    },
                    {
                        name: 'Levantamientos de piernas',
                        focus: 'Abdominales inferiores',
                        sets: '3 serie, 10 reps',
                        image: 'https://cdn.usegalileo.ai/sdxl10/2d5017c3-cc4f-4308-96f1-32ecd1608626.png',
                    },
                ].map((exercise, index) => (
                    <View
                        key={index}
                        className="flex flex-row gap-4 bg-[#111418] px-4 py-3"
                    >
                        <Image
                            source={{ uri: exercise.image }}
                            className="bg-center bg-no-repeat aspect-video bg-cover rounded-lg h-[70px] w-24"
                        />
                        <View className="flex flex-1 flex-col justify-center">
                            <Text className="text-white text-base font-medium leading-normal">
                                {exercise.name}
                            </Text>
                            <Text className="text-[#9caaba] text-sm font-normal leading-normal">
                                Focus: {exercise.focus}
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
                        source={{ uri: 'https://www.youtube.com/watch?v=RPfxeHWm8Oo' }} 
                        style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                
                    />
                </View>
                
                <Text className="text-xl font-bold text-white mb-2">Errores</Text>
                <View className="w-full h-64 mb-5 rounded-xl overflow-hidden border border-gray-600">
                    <WebView 
                         source={{ uri: 'https://www.youtube.com/shorts/wiOhtcjzPv4' }} 
                         style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                
                    />
                </View>
            </ScrollView>

            <View className="h-5 bg-[#111418]" />
            {/* Start Workout Button */}
                        <View className="p-4">
                            <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-lg" onPress={() => navigation.navigate('CronometroM')}>
                                <Text className="text-center text-white font-bold">Iniciar Ejercicio</Text>
                            </TouchableOpacity>
                        </View>
        </View>
    );
};

export default RutinaMedia;