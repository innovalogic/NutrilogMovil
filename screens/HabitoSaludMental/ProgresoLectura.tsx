import { View, Text, TouchableOpacity } from 'react-native'
import { collection, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const ProgresoLectura = ({ }) => {
    const [libros, setLibros] = useState<any[]>([]);


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
    }, []);

    return (
        <>
            <View >
                {libros.map((libro) => (
                    <View
                        key={libro.titulo}
                    >
                        <Text>
                            En Progreso
                        </Text>
                        <Text className="text-white text-sm font-light mt-1">{ libro.titulo }</Text>
                        <Text>
                            Terminado
                        </Text>
                    </View>
                ))}
                {/* 📘 En progreso (2)
            - El poder del ahora (80%)
            - Sapiens (35%)

            ✅ Terminados (5)
            - Hábitos atómicos ⭐⭐⭐⭐☆
            - El hombre en busca de sentido ⭐⭐⭐⭐⭐ */}
            </View>
        </>
    )
};


export default ProgresoLectura;