import { View, Text, TouchableOpacity } from 'react-native'
import { collection, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import BarraProgreso from '../../Componentes/BarraProgreso';
import React, { useState, useEffect } from 'react';

const ProgresoLectura = ({ }) => {
    const [libros, setLibros] = useState<any[]>([]);
    const [librosTerminado, setLibrosTerminados] = useState<any[]>([]);
    const [librosProgreso, setLibrosProgreso] = useState<any[]>([]);

    const obtenerLibros = async () => {
        const usuario = auth.currentUser;
        if (!usuario) {
            console.log("Usuario no autenticado")
            return;
        }

        try {
            const leerLibros = await getDocs(collection(firestore, 'users', usuario.uid, 'Libros'));
            const datosNiveles = leerLibros.docs.map(doc => {
                const data = doc.data();
                return {
                    titulo: data.titulo,
                    paginas: data.paginas,
                    paginasLeidas: data.paginasLeidas,
                };
            });
            setLibros(datosNiveles);
            // console.log(datosNiveles)
        } catch (error) {
            console.error('Error al obtener los documentos:', error);
        }
    };
    useEffect(() => {
        obtenerLibros();
        if (libros.length > 0) {
            librosTerminados();
            librosEnProgreso();
        }
    }, [libros]);

    const porcentajeLectura = (paginas: number, paginasLeidas: number) => {
        const porcentaje = Math.floor((paginasLeidas * 100) / paginas);
        return porcentaje + "%"
    }

    const librosTerminados = () => {
        const terminados = libros.filter((libro) => libro.paginas === libro.paginasLeidas);
        setLibrosTerminados(terminados);
    }

    const librosEnProgreso = () => {
        const enProgreso = libros.filter((libro) => libro.paginas !== libro.paginasLeidas);
        setLibrosProgreso(enProgreso);
    }

    return (
        <>
            <View className="bg-gray-800 rounded-3xl p-6 mb-6 border border-gray-700">
                <Text className="text-white text-2xl font-bold mb-3">📚 Progreso de Lectura</Text>

                <View className='mb-4'>
                    <View className='bg-teal-800 rounded-t-lg'>
                        <Text className="text-lg font-bold text-white mt-2 mb-2 ml-5">✅ Terminados</Text>
                    </View>
                    <View className='bg-[#DFF7E7]  rounded-b-lg'>
                        {librosTerminado.map((libro) => (
                            <View key={libro.titulo} className='mb-2 ml-5 mt-2'>
                                <Text className="text-black font-normal">
                                    📗 {libro.titulo}
                                </Text>
                                <View className='flex-row items-center justify-between w-[200px]'>
                                    <BarraProgreso
                                        paginasTotales={libro.paginas}
                                        paginasLeidas={libro.paginasLeidas}
                                        color='#4FB562'
                                    />
                                    <Text className='ml-2 text-black font-normal'>
                                        {porcentajeLectura(libro.paginas, libro.paginasLeidas)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>


                <View>
                    <View className='bg-[#2563eb] rounded-t-lg'>
                        <Text className="text-lg font-bold text-white mt-2 mb-2 ml-5">🔄 En Progreso</Text>
                    </View>

                    <View className='bg-sky-200/100 rounded-b-lg'>
                        {librosProgreso.map((libro) => (
                            <View key={libro.titulo} className='mb-2 ml-5 mt-2'>
                                <Text className="text-black font-normal">
                                    📘 {libro.titulo}
                                </Text>
                                <View className='flex-row items-center justify-between w-[200px]'>
                                    <BarraProgreso
                                        paginasTotales={libro.paginas}
                                        paginasLeidas={libro.paginasLeidas}
                                        color='#3A9CCD'
                                    />
                                    <Text className='ml-2 text-black font-normal'>
                                        {porcentajeLectura(libro.paginas, libro.paginasLeidas)}
                                    </Text>
                                </View>
                            </View>
                        ))}

                    </View>
                </View>
            </View>

        </>
    )
};


export default ProgresoLectura;