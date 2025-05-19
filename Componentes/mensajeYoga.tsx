import { View, Text, Image, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
    mensaje: { nivel: string; motivacion: string };
    Seguimiento: undefined;
};  

type MensajeRouteProp = RouteProp<RootStackParamList, 'mensaje'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FelicitacionView() {
    const route = useRoute<MensajeRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { nivel, motivacion } = route.params;
    return (
        <LinearGradient 
        colors={['#00353f', '#006d5b']} 
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="flex-1 items-center justify-center"
        >
        {/* <StatusBar barStyle="light-content" backgroundColor="black" /> */}
            <View className="flex-1 items-center justify-center">
                <View className='w-64 h-64 mb-8'>
                    <Image
                        source={require('../assets/yogaMensaje.png')}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                    />
                </View>

                <View className='items-center justify-center p-3 bg-black/50 rounded-2xl mt-6'>
                    <Text className="text-white text-5xl font-light">¡Buen trabajo!</Text>
                    <Text className="text-white text-sm text-center mt-2">
                        ¡Enhorabuena! Has completado los {"\n"}
                        ejercicios de hoy{nivel ? ` (${nivel})` : ''}.
                    </Text>
                </View>

                <View className=" p-4 rounded-lg relative mt-6 w-4/5 bg-black/50">
                    <Text className="absolute top-[-10px] left-[-10px] text-9xl text-[#a9b355]">“</Text>
                    <Text className="text-white italic text-center text-xl">
                        {`${motivacion}`}
                    </Text>
                    <Text className="absolute bottom-[-10px] right-[-10px] text-8xl text-[#a9b355]">”</Text>
                </View>


                <View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Seguimiento')}
                        className="bg-[#2cad6a] px-20 py-4 rounded-3xl mt-6">
                        <Text className="text-center text-3xl font-light text-white">Terminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}
