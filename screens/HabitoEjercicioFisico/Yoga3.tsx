import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Timer from '../../Componentes/Cronometro'
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

type RootStackParamList = {
    Yoga3: { minutos: number; segundos: number };
    mensaje: { nivel: string; motivacion: string; minutos: number; segundos:number };
};

type siguienteYoga = StackNavigationProp<RootStackParamList>;
type Yoga3RouteProp = RouteProp<RootStackParamList, 'Yoga3'>;

const PantallaSesionYoga = () => {
    const route = useRoute<Yoga3RouteProp>();
    const { minutos: minutosRecibidos, segundos: segundosRecibidos } = route.params;
    const [tiempo, setTiempo] = useState(30);
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;

    const incrementarTiempo = () => setTiempo(tiempo + 10);
    const disminuirTiempo = () => {
        if (tiempo > 10) setTiempo(tiempo - 10);
    };

    const navigation = useNavigation<siguienteYoga>();

    return (
        <View className="flex-1 items-center justify-center bg-black">
            <View className='mt-12'>
                <Text className="text-white font-extralight text-3xl mb-2">
                    YOGA: Principiante
                </Text>
            </View>

            <View className="w-[90%] h-52 mb-5 rounded-xl overflow-hidden">
                <WebView
                    source={{ uri: 'https://www.youtube.com/embed/cFcNQjKDI58' }}
                    style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                />
            </View>
            <View className="flex-1 overflow-hidden">
                <LinearGradient
                    colors={['#00353f', '#006d5b']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    className="items-center justify-center"
                >
                    <View className="flex-1 items-center w-full p-4">
                        <View className='mt-5'>
                            <Text className="text-center text-3xl font-light text-green-200">
                                Temporizador de Ejercicio
                            </Text>
                        </View>

                        <View className="flex-row justify-center my-10">
                            <TouchableOpacity
                                onPress={disminuirTiempo}
                                className="px-14 py-2 rounded-full bg-green-300/50 shadow-lg shadow-black mr-4"
                            >
                                <Text className="text-white text-xl text-center">-10s</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={incrementarTiempo}
                                className="bg-green-300/50 px-14 py-2 rounded-full shadow-lg shadow-black ml-4"
                            >
                                <Text className="text-white text-xl text-center">+10s</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-center mt-4 space-x-5">
                            <View className="items-center mx-2">
                                <Text className="bg-black text-white text-5xl text-center px-5 py-3 rounded-2xl min-w-[80px]">
                                    {String(minutos).padStart(2, '0')}
                                </Text>
                                <Text className="text-lg text-white text-light">Minutos</Text>
                            </View>

                            <View className="items-center mx-2">
                                <Text className="bg-black text-white text-5xl text-light text-center px-5 py-3 rounded-2xl min-w-[80px]">
                                    {String(segundos).padStart(2, '0')}
                                </Text>
                                <Text className="text-lg text-white text-light">Segundos</Text>
                            </View>
                        </View>

                        <View className="p-2 shadow-2xl shadow-gray">
                            <Timer
                                tiempoObjetivo={tiempo}
                                onTimeUp={() => alert('¡El tiempo ha finalizado!')}
                            />
                        </View>
                    </View>
                    <View className='mb-10'>
                        <TouchableOpacity
                            onPress={() => {
                                const totalSegundos = minutosRecibidos * 60 + segundosRecibidos + tiempo;
                                const minutosTotales = Math.floor(totalSegundos / 60);
                                const segundosTotales = totalSegundos % 60;

                                navigation.navigate('mensaje', {
                                    nivel: 'Principiante',
                                    motivacion: '¡Incéndiate, rompe límites y deja huella!',
                                    minutos: minutosTotales,
                                    segundos: segundosTotales,
                                });
                            }}
                            className="bg-green-300/30 px-5 py-2 rounded-lg ">
                            <Text className="text-white text-lg">Siguiente Ejercicio</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

            </View>
        </View>
    );
};

export default PantallaSesionYoga;