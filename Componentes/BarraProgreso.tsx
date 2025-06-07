import { View } from 'react-native';

interface BarraProgresoProps {
    paginasTotales: number;
    paginasLeidas: number;
    color?: string;
}

const BarraProgreso = ({ paginasTotales, paginasLeidas, color='#87CEEB' }: BarraProgresoProps) => {
    const progreso = paginasTotales > 0 ? paginasLeidas / paginasTotales : 0;

    return (
        <View style={{
            height: 10,
            width: '100%',
            backgroundColor: '#2e3a59',
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 8,
        }}>
            <View style={{
                height: '100%',
                width: `${progreso * 100}%`,
                backgroundColor: color,
            }}/>
        </View>
    );
};

export default BarraProgreso;