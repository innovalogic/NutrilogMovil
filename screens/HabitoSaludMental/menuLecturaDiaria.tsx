import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../../firebase';
import { getDocs, collection } from 'firebase/firestore';
import BarraProgreso from '../../Componentes/BarraProgreso';

type RootStackParamList = {
    RegistroLibro: undefined;
    DetalleLibro: { libroId: string };
};

type registro = StackNavigationProp<RootStackParamList>;

interface Libro {
    id: string;
    titulo: string;
    paginas: number;
    paginasLeidas: number;
}

const LecturaDiaria = () => {
    const navigation = useNavigation<registro>();
    const [libros, setLibros] = useState<Libro[]>([]);

    useFocusEffect(
        useCallback(() => {
            const obtenerLibros = async () => {
                const user = auth.currentUser;
                if (!user) return;

                const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, 'Libros'));
                const data: Libro[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Libro[];
                setLibros(data);
            };

            obtenerLibros();
        }, [])
    );

    return (
        <LinearGradient
            colors={['#000000', '#0f1828']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 justify-center items-center"
        >
            <View className="mt-16 items-center">
                <Text className="text-4xl text-white">Mis Libros de Lectura Diaria</Text>
            </View>

            <ScrollView
                className="flex-1 w-full px-4 mt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {libros.map((libro) => (
                    <TouchableOpacity
                        key={libro.id}
                        className="mb-4 p-4 bg-[#202938] rounded-3xl border border-gray-500/25"
                        onPress={() => navigation.navigate('DetalleLibro', { libroId: libro.id })}
                    >
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-2xl text-white font-normal">{libro.titulo}</Text>
                                <Text className="text-base text-white font-light">Páginas: {libro.paginas}</Text>
                                <Text className="text-base text-white font-light">Páginas Leidas: {libro.paginasLeidas}</Text>
                            </View>

                            <Image
                                source={require('../../assets/iconoLibro.png')}
                                className="w-16 h-16"
                            />
                        </View>
                        <BarraProgreso paginasTotales={libro.paginas} paginasLeidas={libro.paginasLeidas} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View className='mt-2 mb-2'>
                <TouchableOpacity
                    onPress={() => navigation.navigate('RegistroLibro')}
                    className="bg-sky-300/75 px-6 py-3 rounded-full items-center"
                >
                    <View className='flex-row justify-between items-center'>
                        <View>
                            <Text className="text-white text-2xl">+</Text>
                        </View>

                        <View>
                            <Text className="text-white text-base"> Agregar Nuevo Libro</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};
export default LecturaDiaria;