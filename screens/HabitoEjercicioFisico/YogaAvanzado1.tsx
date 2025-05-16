import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Timer from '../../Componentes/Cronometro'

const PantallaSesionYoga = () => {
    const [tiempo, setTiempo] = useState(30);
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;

    const incrementarTiempo = () => setTiempo(tiempo + 10);
    const disminuirTiempo = () => {
        if (tiempo > 10) setTiempo(tiempo - 10);
    };
    return (
        <View className="flex-1 items-center justify-center bg-[#595959]">
            <View className='mt-12'>
                <Text className="text-white font-extralight text-3xl mb-3">
                    YOGA: Avanzado
                </Text>
                <Text className="text-white text-center font-extralight text-xl">
                    Parada Sobre Antebrazos
                </Text>
            </View>
            
            <View className="w-[90%] h-52 mb-5 rounded-xl overflow-hidden">
                <WebView
                    source={{ uri: 'https://www.youtube.com/embed/59BofGqrqHc' }}
                    style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                />
            </View>

            <View className="flex-1 items-center  bg-white rounded-t-2xl w-full p-4">
                <View className='mt-12'>
                    <Text className="text-center text-2xl font-semibold mb-2">
                        Temporizador de Ejercicio
                    </Text>
                </View>
                

                <View className="flex-row justify-center my-10">
                    <TouchableOpacity
                        onPress={disminuirTiempo}
                        className="bg-white px-16 py-2 rounded-full shadow-lg shadow-black mr-8"

                    >
                        <Text className="text-black text-lg text-center">-10s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={incrementarTiempo}
                        className="bg-white px-16 py-2 rounded-full shadow-lg shadow-black"
                    >
                        <Text className="text-black text-lg text-center">+10s</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-center mt-4 space-x-5">
                    <View className="items-center mx-2">
                        <Text className="bg-black text-white text-5xl font-thin text-center px-5 py-3 rounded-2xl min-w-[80px]">
                            {String(minutos).padStart(2, '0')}
                        </Text>
                        <Text className="mt-1 text-lg text-black">Minutos</Text>
                    </View>

                    <View className="items-center mx-2">
                        <Text className="bg-black text-white text-5xl font-thin text-center px-5 py-3 border-black rounded-2xl min-w-[80px]">
                            {String(segundos).padStart(2, '0')}
                        </Text>
                        <Text className="mt-1 text-lg text-black">Segundos</Text>
                    </View>
                </View>

                <View className="p-2 shadow-2xl shadow-gray">
                    <Timer
                        tiempoObjetivo={tiempo}
                        onTimeUp={() => alert('¡El tiempo ha finalizado!')}
                    />
                </View>
            </View>
        </View>
    );
};

export default PantallaSesionYoga;