import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

export default function ProgresoAudioInspira() {
  const [audiosEscuchados, setAudiosEscuchados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalAudios: 0,
    totalMinutos: 0,
    rachaActual: 0,
    categoriaFavorita: '',
    estadoAnimoMasUsado: '',
    audiosHoy: 0,
    audiosSemana: 0
  });
  const [loading, setLoading] = useState(true);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Obtener datos cuando el componente se enfoca
  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (user) {
        obtenerDatosAudio(user.uid);
      }
    }, [])
  );

  const obtenerDatosAudio = async (userId) => {
    try {
      setLoading(true);
      
      // Obtener todos los audios escuchados
      const audiosRef = collection(firestore, 'users', userId, 'audios');
      const audiosQuery = query(audiosRef, orderBy('timestamp', 'desc'));
      const audiosSnapshot = await getDocs(audiosQuery);
      
      const audiosData = audiosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAudiosEscuchados(audiosData);
      
      // Calcular estadísticas
      calcularEstadisticas(audiosData);
      
    } catch (error) {
      console.error('Error al obtener datos de audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (audios) => {
    if (audios.length === 0) {
      setEstadisticas({
        totalAudios: 0,
        totalMinutos: 0,
        rachaActual: 0,
        categoriaFavorita: '',
        estadoAnimoMasUsado: '',
        audiosHoy: 0,
        audiosSemana: 0
      });
      return;
    }

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const haceUnaSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Contar audios de hoy
    const audiosHoy = audios.filter(audio => {
      const fechaAudio = new Date(audio.escuchadoEn);
      const fechaAudioSolo = new Date(fechaAudio.getFullYear(), fechaAudio.getMonth(), fechaAudio.getDate());
      return fechaAudioSolo.getTime() === hoy.getTime();
    }).length;

    // Contar audios de la semana
    const audiosSemana = audios.filter(audio => {
      const fechaAudio = new Date(audio.escuchadoEn);
      return fechaAudio >= haceUnaSemana;
    }).length;

    // Calcular total de minutos aproximado
    const totalMinutos = audios.reduce((total, audio) => {
      const duracion = audio.duracion || '0:00';
      const [minutos, segundos] = duracion.split(':').map(Number);
      return total + minutos + (segundos / 60);
    }, 0);

    // Encontrar categoría favorita
    const categorias = {};
    audios.forEach(audio => {
      const categoria = audio.categoria || 'Sin categoría';
      categorias[categoria] = (categorias[categoria] || 0) + 1;
    });
    
    const categoriaFavorita = Object.keys(categorias).reduce((a, b) => 
      categorias[a] > categorias[b] ? a : b, ''
    );

    // Encontrar estado de ánimo más usado
    const estadosAnimo = {};
    audios.forEach(audio => {
      const estado = audio.estadoAnimo || 'Sin estado';
      estadosAnimo[estado] = (estadosAnimo[estado] || 0) + 1;
    });
    
    const estadoAnimoMasUsado = Object.keys(estadosAnimo).reduce((a, b) => 
      estadosAnimo[a] > estadosAnimo[b] ? a : b, ''
    );

    // Calcular racha actual (días consecutivos con al menos un audio)
    const diasConAudio = new Set();
    audios.forEach(audio => {
      const fecha = new Date(audio.escuchadoEn);
      const fechaStr = fecha.toDateString();
      diasConAudio.add(fechaStr);
    });

    let rachaActual = 0;
    let fechaActual = new Date();
    
    while (true) {
      const fechaStr = fechaActual.toDateString();
      if (diasConAudio.has(fechaStr)) {
        rachaActual++;
        fechaActual.setDate(fechaActual.getDate() - 1);
      } else {
        break;
      }
    }

    setEstadisticas({
      totalAudios: audios.length,
      totalMinutos: Math.round(totalMinutos),
      rachaActual,
      categoriaFavorita,
      estadoAnimoMasUsado,
      audiosHoy,
      audiosSemana
    });
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View className="bg-indigo-800 rounded-3xl p-6 mb-6 shadow-2xl border border-indigo-700">
        <Text className="text-white text-xl font-bold">🎧 Progreso Audio Inspira</Text>
        <Text className="text-gray-300 mt-2">Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <View className="bg-indigo-800 rounded-3xl p-6 mb-6 shadow-2xl border border-indigo-700">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-white text-xl font-bold">🎧 Progreso Audio Inspira</Text>
          <Text className="text-indigo-200 text-sm">Tu bienestar mental</Text>
        </View>
        <TouchableOpacity
          onPress={() => setMostrarDetalles(!mostrarDetalles)}
          className="bg-indigo-700 px-3 py-1 rounded-full"
        >
          <Text className="text-white text-xs">
            {mostrarDetalles ? 'Ocultar' : 'Ver más'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas principales */}
      <View className="flex-row flex-wrap justify-between mb-4">
        <View className="bg-indigo-700 rounded-2xl p-4 mb-3 w-[48%]">
          <Text className="text-indigo-200 text-sm">Total Audios</Text>
          <Text className="text-white text-2xl font-bold">{estadisticas.totalAudios}</Text>
        </View>
        
        <View className="bg-indigo-700 rounded-2xl p-4 mb-3 w-[48%]">
          <Text className="text-indigo-200 text-sm">Minutos Totales</Text>
          <Text className="text-white text-2xl font-bold">{estadisticas.totalMinutos}</Text>
        </View>
        
        <View className="bg-indigo-700 rounded-2xl p-4 mb-3 w-[48%]">
          <Text className="text-indigo-200 text-sm">Racha Actual</Text>
          <Text className="text-white text-2xl font-bold">{estadisticas.rachaActual} días</Text>
        </View>
        
        <View className="bg-indigo-700 rounded-2xl p-4 mb-3 w-[48%]">
          <Text className="text-indigo-200 text-sm">Hoy</Text>
          <Text className="text-white text-2xl font-bold">{estadisticas.audiosHoy}</Text>
        </View>
      </View>

      {/* Detalles expandibles */}
      {mostrarDetalles && (
        <View>
          {/* Estadísticas adicionales */}
          <View className="bg-indigo-700 rounded-2xl p-4 mb-4">
            <Text className="text-white text-base font-semibold mb-2">📊 Estadísticas Detalladas</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-indigo-200">Esta semana:</Text>
              <Text className="text-white font-semibold">{estadisticas.audiosSemana} audios</Text>
            </View>
            
            {estadisticas.categoriaFavorita && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-indigo-200">Categoría favorita:</Text>
                <Text className="text-white font-semibold">{estadisticas.categoriaFavorita}</Text>
              </View>
            )}
            
            {estadisticas.estadoAnimoMasUsado && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-indigo-200">Estado más usado:</Text>
                <Text className="text-white font-semibold">{estadisticas.estadoAnimoMasUsado}</Text>
              </View>
            )}
          </View>

          {/* Historial reciente */}
          {audiosEscuchados.length > 0 && (
            <View className="bg-indigo-700 rounded-2xl p-4">
              <Text className="text-white text-base font-semibold mb-3">🕐 Últimos Audios Escuchados</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {audiosEscuchados.slice(0, 5).map((audio, index) => (
                  <View key={audio.id} className="mb-3 pb-3 border-b border-indigo-600">
                    <Text className="text-white font-medium">{audio.titulo}</Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-indigo-200 text-sm">{audio.estadoAnimo} • {audio.categoria}</Text>
                      <Text className="text-indigo-200 text-sm">{formatearFecha(audio.escuchadoEn)}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Mensaje motivacional */}
      <View className="bg-indigo-900 rounded-2xl p-4 mt-4">
        <Text className="text-indigo-200 text-center text-sm">
          {estadisticas.totalAudios === 0 
            ? "¡Comienza tu viaje de bienestar mental! 🧘‍♀️"
            : estadisticas.rachaActual > 0
            ? `¡Excelente! Llevas ${estadisticas.rachaActual} día${estadisticas.rachaActual === 1 ? '' : 's'} cuidando tu mente 🌟`
            : "Cada momento de paz cuenta. ¡Sigue adelante! 💪"
          }
        </Text>
      </View>
    </View>
  );
}