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
import RegisterProfileScreen from "screens/RegistroPerfil/RegisterProfileScreen";
import RegisterExerciseScreen from "screens/RegistroHabitos/RegisterExerciseScreen";
import RegisterYogaLevelScreen from "screens/RegistroHabitos/RegisterYogaLevelScreen";
import RegisterTrainingLevelScreen from "screens/RegistroHabitos/RegisterTrainingLevelScreen";
import RegisterCardioLevelScreen from "screens/RegistroHabitos/RegisterCardioLevelScreen";
import CategoriasEjercicioFisico from 'screens/HabitoEjercicioFisico/CategoriasEjercicioFisico';
import Entrenamiento from 'screens/HabitoEjercicioFisico/Entrenamiento';
import RutinaSuperior from 'screens/HabitoEjercicioFisico/RutinaSuperior';
import RutinaMedia from 'screens/HabitoEjercicioFisico/RutinaMedia';
import RutinaInferior from 'screens/HabitoEjercicioFisico/RutinaInferior';
import CronometroS from 'screens/HabitoEjercicioFisico/CronometroS';
import CronometroM from 'screens/HabitoEjercicioFisico/CronometroM';
import CronometroI from 'screens/HabitoEjercicioFisico/CronometroI';
import RegistroHabitosCategorias from 'screens/RegistroHabitos/RegistroHabitosCategorias';
import Yoga from 'screens/HabitoEjercicioFisico/Yoga'
import YogaAvanzado from 'screens/HabitoEjercicioFisico/YogaAvanzado1'
import YogaIntermedio from 'screens/HabitoEjercicioFisico/YogaIntermedio1'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerShown: false, // Desactiva el encabezado en todas las pantallas
        }}
      >
        <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="InicioSesion" component={InicioSesionScreen} />
        <Stack.Screen name="HomePerfil" component={HomePerfilScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Seguimiento" component={SeguimientoScreen} />
        <Stack.Screen name="Habitos" component={HabitosScreen} />
        <Stack.Screen name="Perfil" component={HomePerfilScreen} />
        <Stack.Screen name="RegistroPerfil" component={RegisterProfileScreen} />
        <Stack.Screen name="RegistroEjercicios" component={RegisterExerciseScreen} />
        <Stack.Screen name="RegistroYogaLevel" component={RegisterYogaLevelScreen} />
        <Stack.Screen name="RegistroTrainingLevel" component={RegisterTrainingLevelScreen} />
        <Stack.Screen name="RegistroCardioLevel" component={RegisterCardioLevelScreen} />
        <Stack.Screen name="CategoriasEjercicioFisico" component={CategoriasEjercicioFisico} />
        <Stack.Screen name="Entrenamiento" component={Entrenamiento} />
        <Stack.Screen name="RutinaSuperior" component={RutinaSuperior} />
        <Stack.Screen name="RutinaMedia" component={RutinaMedia} />
        <Stack.Screen name="RutinaInferior" component={RutinaInferior} />
        <Stack.Screen name="CronometroS" component={CronometroS} />
        <Stack.Screen name="CronometroM" component={CronometroM} />
        <Stack.Screen name="CronometroI" component={CronometroI} />
        <Stack.Screen name="RegistroHabitosCategorias" component={RegistroHabitosCategorias} />
        <Stack.Screen name="Yoga" component={Yoga} />
        <Stack.Screen name="YogaIntermedio" component={YogaIntermedio} />
        <Stack.Screen name="YogaAvanzado" component={YogaAvanzado} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}