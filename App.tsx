import "./global.css";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InicioScreen from './screens/InicioScreen';
import RegistroScreen from './screens/RegistroScreen';
import InicioSesionScreen from './screens/InicioSesionScreen';
import HomePerfilScreen from './screens/HomePerfilScreen';
import MenuScreen from './screens/MenuScreen';
import SeguimientoScreen from './screens/SeguimientoScreen';
import HabitosScreen from './screens/HabitosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="InicioSesion" component={InicioSesionScreen} />
        <Stack.Screen name="HomePerfil" component={HomePerfilScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Seguimiento" component={SeguimientoScreen} />
        <Stack.Screen name="Habitos" component={HabitosScreen} />
        <Stack.Screen name="Perfil" component={HomePerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}