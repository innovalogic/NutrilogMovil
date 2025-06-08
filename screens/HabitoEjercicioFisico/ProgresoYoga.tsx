import { View, Text, Image } from 'react-native'
import { collection, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const ProgresoYoga = ({ }) => {
    const [niveles, setNiveles] = useState<any[]>([]);

    const ObtenerNivelesYoga = async () => {

        const usuario = auth.currentUser;
        if (!usuario) {
            console.log("Usuario no autenticado")
            return;
        }

        try {
            const leerNiveles = await getDocs(collection(firestore, 'users', usuario.uid, 'ejerciciosYoga'));
            const datosNiveles = leerNiveles.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    minutos: data.minutos,
                    segundos: data.segundos,
                    nivel: data.nivel,
                    sesiones: data.sesiones,
                };
            });
            setNiveles(datosNiveles);
        } catch (error) {
            console.error('Error al obtener los documentos:', error);
        }
    };
    useEffect(() => {
        ObtenerNivelesYoga();
    }, []);

    const formatearTiempo = (minutos: number, segundos: number) => {
        const hora = Math.floor(minutos / 60);
        const nuevosMinutos = Math.floor(minutos % 60);
        return hora.toString().padStart(2, '0') + ":" +
            nuevosMinutos.toString().padStart(2, '0') + ":" +
            segundos.toString().padStart(2, '0');
    };


    return (
        <>
            <View className="bg-gray-800 rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700">
                <View className=" items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">Progreso Yoga</Text>
                    <View className="items-center">
                        {niveles.map((item) => (
                            <View
                                key={item.nivel}
                                className="p-4 justify-between items-center"
                            >
                                <LinearGradient
                                    colors={['#424799', '#5a189a']} // #202938, #424799, #121826
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={{ borderRadius: 16 }}
                                    className='flex-row justify-between items-center border border-gray-700'
                                >

                                    <View className="rounded-full p-3">
                                        <Image
                                            source={require('../../assets/yoga1.png')}
                                            className="w-[50] h-[50] rounded-full"
                                        />
                                    </View>

                                    <View className="ml-4 flex-1 mb-1">
                                        <Text className="text-white text-xl font-bold">{item.nivel}</Text>
                                        <Text className="text-white text-sm mt-1 font-light">Tiempo Total 🕒 </Text>
                                        <Text className="text-white text-2xl font-light mt-1">
                                            {formatearTiempo(item.minutos, item.segundos)}
                                        </Text>
                                        <Text className="text-white text-sm font-light mt-1">Sesiones ✅ </Text>
                                        <Text className="text-white text-sm font-light mt-1">
                                            {item.sesiones}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>

                        ))}
                    </View>

                </View>
            </View>

        </>
    );
};

export default ProgresoYoga;