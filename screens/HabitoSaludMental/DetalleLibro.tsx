import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import { Calendar } from 'react-native-calendars';
import CambiarHora from 'Componentes/Hora';
import { Modal, TextInput } from 'react-native';
import { Keyboard } from 'react-native';
import BottomNavBar from '../../Componentes/BottomNavBar';

type RootStackParamList = {
    DetalleLibro: { libroId: string };
};

type DetalleLibroRouteProp = RouteProp<RootStackParamList, 'DetalleLibro'>;

const DetalleLibro = () => {
    const [diasLeidos, setDiasLeidos] = useState<string[]>([]);
    const route = useRoute<DetalleLibroRouteProp>();
    const { libroId } = route.params;
    const [paginasLeidas, setPaginasLeidas] = useState<number>(0);
    const [hora, setHora] = useState(0);
    const [minutos, setMinutos] = useState(0);
    const [fechasMarcadas, setFechasMarcadas] = useState<{ [date: string]: any }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [frase, setFrase] = useState('');
    const [frases, setFrases] = useState<string[]>([]);

    const [libro, setLibro] = useState<null | {
        titulo: string;
        paginas: number;
        paginasLeidas: number;
        // hora: number,
        // minutos: number,
    }>(null);

    const obtenerFechaActual = (): string => {
        const diaActual = new Date();
        const anio = diaActual.getFullYear();
        const mes = diaActual.getMonth() < 10 ? '0' + (diaActual.getMonth() + 1) : diaActual.getMonth();
        const dia = diaActual.getDate() < 10 ? '0' + (diaActual.getDate()) : diaActual.getDate;
        return `${anio}-${mes}-${dia}`;
    };

    const disminuirPagina = () => {
        if (paginasLeidas > 0) {
            setPaginasLeidas(paginasLeidas - 1);
        }
    };

    const aumentarPagina = () => {
        if (libro && paginasLeidas < libro.paginas) {
            setPaginasLeidas(paginasLeidas + 1);
            const fecha = obtenerFechaActual();
            console.log(fecha)
            setDiasLeidos(prev => {
                if (!prev.includes(fecha)) {
                    return [...prev, fecha];
                }
                return prev;
            });
        }
    };

    const guardarCambios = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const libroRef = doc(firestore, 'users', user.uid, 'Libros', libroId);
        await updateDoc(libroRef, {
            paginasLeidas: paginasLeidas,
            diasLeidos: diasLeidos,
            hora: hora,
            minutos: minutos,
        });
        alert('Cambios guardados');
    };

    useEffect(() => {
        const fetchLibro = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const libroRef = doc(firestore, 'users', user.uid, 'Libros', libroId);
            const docSnap = await getDoc(libroRef);

            if (docSnap.exists()) {
                const libroData = docSnap.data() as any;
                setLibro(libroData);
                setPaginasLeidas(libroData.paginasLeidas);

                if (libroData.diasLeidos) {
                    // setDiasLeidos(libroData.diasLeidos);
                    const fechasMarcadas: { [date: string]: any } = {};
                    libroData.diasLeidos.forEach((fecha: string) => {
                        fechasMarcadas[fecha] = {
                            selected: true,
                            marked: true,
                            selectedColor: '#00B0FF',
                        };
                    });
                    setDiasLeidos(libroData.diasLeidos);
                    setFechasMarcadas(fechasMarcadas);
                }
            } else {
                console.log('Libro no encontrado');
            }
        };
        fetchLibro();



    }, [libroId]);

    const guardarFrase = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const libroRef = doc(firestore, 'users', user.uid, 'Libros', libroId);
        const nuevoListado = [...frases, frase];

        try {
            await updateDoc(libroRef, {
                frases: nuevoListado,
            });
            setFrases(nuevoListado);
            setFrase('');
            setModalVisible(false);
        } catch (error) {
            console.error('Error al guardar la frase:', error);
        }
    }

    if (!libro) {
        return (
            <LinearGradient
                colors={['#000000', '#0f1828']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 justify-center items-center"
            >
                <View>
                    <Text className='text-white text-2xl'>Cargando libro...</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#000000', '#0f1828']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1"
        >
            <View className='items-center mt-16'>
                <Text className="text-4xl font-extralight text-white">{libro.titulo}</Text>
            </View>

            <ScrollView
                className="flex-1 w-full px-4 mt-4"
            >
                <View className="flex-1 justify-center items-center">
                    <View className='mt-3 mb-3 p-3 bg-[#202938] rounded-2xl'>
                        <Text className="text-lg text-white">Páginas en la que estoy</Text>
                        <View className='flex-row justify-between'>
                            <View>
                                <TouchableOpacity
                                    onPress={disminuirPagina}
                                >
                                    <Text className='text-white text-4xl'>{'<'}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className='text-white text-3xl'>
                                    {paginasLeidas}
                                </Text>
                            </View>

                            <View>
                                <TouchableOpacity
                                    onPress={aumentarPagina}
                                >
                                    <Text className='text-white text-4xl'>{'>'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View className='items-center'>
                    <Text className='text-white text-2xl'>Dias de lectura</Text>
                </View>

                <View className="m-4 rounded-2xl overflow-hidden border border-gray-200/50">
                    <Calendar
                        markedDates={fechasMarcadas}
                        theme={{
                            backgroundColor: '#101622',
                            calendarBackground: '#101622',
                            textSectionTitleColor: '#ffffffaa',
                            selectedDayBackgroundColor: '#00B0FF',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#FF5722',
                            dayTextColor: '#ffffff',
                            textDisabledColor: '#444c5c',
                            monthTextColor: '#ffffff',
                            arrowColor: '#ffffff',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontSize: 16,
                            textMonthFontSize: 20,
                            textDayHeaderFontSize: 14,
                        }}
                        style={{
                            borderRadius: 16,
                            padding: 10,
                        }}
                        headerStyle={{
                            backgroundColor: '#19253b',
                            borderBottomWidth: 1,
                            borderBottomColor: '#303b50',
                        }}
                    />
                </View>

                <View className='items-center'>
                    <CambiarHora
                        horaInicial={libro.hora}
                        minutosIniciales={libro.minutos}
                        tituloLibro={libro.titulo}
                        paginaLibro={paginasLeidas}
                        onHoraSeleccionada={(h, m) => {
                            setHora(h);
                            setMinutos(m);
                        }}
                    />

                </View>

                <TouchableOpacity
                    className='bg-sky-300/75 items-center rounded-3xl py-1 mx-20'
                    onPress={guardarCambios}
                >
                    <Text className='text-white text-lg font-light'>Guardar Cambios</Text>
                </TouchableOpacity>

                <View className='rounded-2xl bg-[#202938] border border-gray-200/50 mt-4'>
                    <View className='items-center mt-4'>
                        <Text className='text-white text-3xl font-light'>
                            Frases
                        </Text>
                    </View>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View className="flex-1 justify-center items-center bg-black/50">
                            <View className="bg-white w-80 rounded-2xl p-5 items-center">
                                <Text className="text-xl font-light mb-2 text-black">Escribe una frase</Text>
                                <TextInput
                                    className="border border-gray-400 rounded-xl w-full px-3 py-2 text-black"
                                    placeholder="Ingresa la frase..."
                                    value={frase}
                                    onChangeText={setFrase}
                                />
                                <View className="flex-row mt-4 space-x-4">
                                    <TouchableOpacity
                                        className="bg-sky-500 rounded-xl px-4 py-2 mr-2"
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            guardarFrase();
                                            setFrase('')
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text className="text-white">Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="bg-[#202938] rounded-xl px-4 py-2"
                                        onPress={() => {
                                            setFrase('');
                                            setModalVisible(false)
                                        }
                                        }
                                    >
                                        <Text className="text-white">Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <View className="p-4">
                        {frases.length === 0 ? (
                            <Text className="text-white italic">No hay frases aún</Text>
                        ) : (
                            frases.map((fraseLista, index) => (
                                <Text key={index} className="text-white mb-1 font-light">• {fraseLista}</Text>
                            ))
                        )}
                    </View>

                    <TouchableOpacity
                        className='bg-sky-300/75 items-center rounded-3xl py-1 mt-1 mb-1 mx-24'
                        onPress={() => setModalVisible(true)}
                    >
                        <Text className='text-lg text-white font-light'>
                            Ingresar frase
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <BottomNavBar />
        </LinearGradient>
    );
};
export default DetalleLibro;