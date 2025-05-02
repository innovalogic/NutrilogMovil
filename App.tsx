import "./global.css";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InicioScreen from './screens/InicioScreen'; // Ajusta la ruta según tu estructura
import RegistroScreen from './screens/RegistroScreen'; // Ajusta la ruta según tu estructura
import InicioSesionScreen from './screens/InicioSesionScreen'; // Ajusta la ruta según tu estructura

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="InicioSesion" component={InicioSesionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}