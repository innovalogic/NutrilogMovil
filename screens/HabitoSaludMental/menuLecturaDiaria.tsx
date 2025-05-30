import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { auth, firestore } from '../../firebase';
import { doc, getDocs, collection } from 'firebase/firestore';
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
            colors={['#0f1829', '#305bab']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            className="flex-1 justify-center items-center"
        >
            {/* <View className="flex-1 bg-white"> */}
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
                    className="mb-4 p-4 bg-white rounded-xl shadow-md"
                    onPress={() => navigation.navigate('DetalleLibro', { libroId: libro.id })}
                    >
                            <Text className="text-lg text-black">{libro.titulo}</Text>
                            <View>
                                <Text className="text-sm text-black">Páginas: {libro.paginas}</Text>
                            </View>
                            <Text className="text-sm text-black">Páginas Leidas: {libro.paginasLeidas}</Text>
                            <BarraProgreso paginasTotales={libro.paginas} paginasLeidas={libro.paginasLeidas} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* <View className="items-center p-4 bg-white"> */}
            <TouchableOpacity
                onPress={() => navigation.navigate('RegistroLibro')}
                className="bg-black px-6 py-3 rounded-full"
            >
                <Text className="text-white">Agregar Nuevo Libro</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};
export default LecturaDiaria;