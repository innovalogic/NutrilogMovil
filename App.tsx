import "./global.css";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InicioScreen from './screens/InicioScreen';
import RegistroScreen from './screens/RegistroScreen';
import InicioSesionScreen from './screens/InicioSesionScreen';
import HomePerfilScreen from './screens/HomePerfilScreen';
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
import Cardiocaminar from 'screens/HabitoEjercicioFisico/Cardiocaminar';
import CardioTrotar from 'screens/HabitoEjercicioFisico/CardioTrotar';
import CardioCorrer from 'screens/HabitoEjercicioFisico/CardioCorrer';
import Yoga from 'screens/HabitoEjercicioFisico/Yoga';
import YogaAvanzado from 'screens/HabitoEjercicioFisico/YogaAvanzado1';
import YogaIntermedio from 'screens/HabitoEjercicioFisico/YogaIntermedio1';
import Yoga2 from 'screens/HabitoEjercicioFisico/Yoga2';
import Yoga3 from 'screens/HabitoEjercicioFisico/Yoga3';
import YogaIntermedio2 from 'screens/HabitoEjercicioFisico/YogaIntermedio2';
import YogaIntermedio3 from 'screens/HabitoEjercicioFisico/YogaIntermedio3';
import YogaAvanzado2 from 'screens/HabitoEjercicioFisico/YogaAvanzado2';
import YogaAvanzado3 from 'screens/HabitoEjercicioFisico/YogaAvanzado3';
import ServicioDeProgreso from 'screens/HabitoEjercicioFisico/ServicioDeProgreso';
import FelicitacionView from "Componentes/mensajeYoga";
import CategoriasAlimentacion from 'screens/HabitoAlimentacion/CategoriasAlimentacion';
import CategoriasSaludMental from 'screens/HabitoSaludMental/CategoriasSaludMental';
import DietaMantenerPeso from "screens/HabitoAlimentacion/DietaMantenerPeso";
import BajarDePeso from 'screens/HabitoAlimentacion/BajarDePeso';
import DesayunoBajarDePeso from 'screens/HabitoAlimentacion/DesayunoBajarDePeso';
import AlmuerzoBajarDePeso from 'screens/HabitoAlimentacion/AlmuerzoBajarDePeso';
import CenaBajarDePeso from 'screens/HabitoAlimentacion/CenaBajarDePeso';
import AudioInspira from 'screens/HabitoSaludMental/AudioInspira';
import Origami from 'screens/HabitoSaludMental/Origami';
import SubirDePeso from 'screens/HabitoAlimentacion/SubirDePeso';
import DesayunoSubirDePeso from 'screens/HabitoAlimentacion/DesayunoSubirDePeso';
import AlmuerzoSubirDePeso from 'screens/HabitoAlimentacion/AlmuerzoSubirDePeso';
import CenaSubirDePeso from 'screens/HabitoAlimentacion/CenaSubirDePeso';
import MenuLectura from 'screens/HabitoSaludMental/menuLecturaDiaria'
import registroLibro from 'screens/HabitoSaludMental/registroLibro'
import DetalleLibro from 'screens/HabitoSaludMental/DetalleLibro'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="InicioSesion" component={InicioSesionScreen} />
        <Stack.Screen name="HomePerfil" component={HomePerfilScreen} />
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
        <Stack.Screen name="Cardiocaminar" component={Cardiocaminar} />
        <Stack.Screen name="CardioTrotar" component={CardioTrotar} />
        <Stack.Screen name="CardioCorrer" component={CardioCorrer} />
        <Stack.Screen name="Yoga" component={Yoga} />
        <Stack.Screen name="YogaIntermedio" component={YogaIntermedio} />
        <Stack.Screen name="YogaAvanzado" component={YogaAvanzado} />
        <Stack.Screen name="Yoga2" component={Yoga2} />
        <Stack.Screen name="Yoga3" component={Yoga3} />
        <Stack.Screen name="YogaIntermedio2" component={YogaIntermedio2} />
        <Stack.Screen name="YogaIntermedio3" component={YogaIntermedio3} />
        <Stack.Screen name="YogaAvanzado2" component={YogaAvanzado2} />
        <Stack.Screen name="YogaAvanzado3" component={YogaAvanzado3} />
        <Stack.Screen name="mensaje" component={FelicitacionView} />
        <Stack.Screen name="CategoriasAlimentacion" component={CategoriasAlimentacion} />
        <Stack.Screen name="ServicioDeProgreso" component={ServicioDeProgreso} />
        <Stack.Screen name="CategoriasSaludMental" component={CategoriasSaludMental} />
        <Stack.Screen name="DietaMantenerPeso" component={DietaMantenerPeso} />
        <Stack.Screen name="BajarDePeso" component={BajarDePeso} />
        <Stack.Screen name="DesayunoBajarDePeso" component={DesayunoBajarDePeso} />
        <Stack.Screen name="AlmuerzoBajarDePeso" component={AlmuerzoBajarDePeso} />
        <Stack.Screen name="CenaBajarDePeso" component={CenaBajarDePeso} />
        <Stack.Screen name="SubirDePeso" component={SubirDePeso} />
        <Stack.Screen name="DesayunoSubirDePeso" component={DesayunoSubirDePeso} />
        <Stack.Screen name="AlmuerzoSubirDePeso" component={AlmuerzoSubirDePeso} />
        <Stack.Screen name="CenaSubirDePeso" component={CenaSubirDePeso} />
        <Stack.Screen name="AudioInspira" component={AudioInspira} />
        <Stack.Screen name="Origami" component={Origami} />
        <Stack.Screen name="RegistroLecturaDiaria" component={MenuLectura} />
        <Stack.Screen name="RegistroLibro" component={registroLibro} />
        <Stack.Screen name="DetalleLibro" component={DetalleLibro} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}