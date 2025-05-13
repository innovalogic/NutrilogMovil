import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
    RutinaSuperior: undefined;
    RutinaMedio: undefined;
    RutinaInferior: undefined;
    CronometroI: undefined; 
};

type HabitScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const RutinaInferior = () => {
    const navigation = useNavigation<HabitScreenNavigationProp>();
    const [expanded, setExpanded] = useState(false); 

    // Lista de consejos con enlaces
    const tips = [
        { title: 'Tips para mejorar la técnica', url: 'https://www.youtube.com/watch?v=SasACgGscHg' },
        { title: 'Errores comunes', url: 'https://www.youtube.com/watch?v=g72DHPfg8iY' }
    ];

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
                <Text className="text-xl font-bold text-white mb-2 px-4 pt-4">Consejos</Text>
                <TouchableOpacity onPress={() => setExpanded(!expanded)} className="flex-row justify-between bg-gray-800 p-4 rounded-lg mb-2 px-4">
                    <Text className="text-white">Ver Consejos</Text>
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#fff" />
                </TouchableOpacity>
                {expanded && (
                    <View className="bg-gray-700 rounded-lg p-4 mb-4 px-4">
                        {tips.map((tip, index) => (
                            <TouchableOpacity key={index} onPress={() => Linking.openURL(tip.url)} className="flex-row items-center mb-2">
                                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                                <Text className="text-blue-400 underline ml-2">{tip.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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