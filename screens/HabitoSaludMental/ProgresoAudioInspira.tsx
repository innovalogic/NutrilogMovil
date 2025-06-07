import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../../firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons';

export default function ProgresoAudioInspira() {
  const [audioStats, setAudioStats] = useState({
    totalAudios: 0,
    totalTiempoEscuchado: 0,
    audiosFavoritos: [],
    categoriasFrecuentes: {},
    estadosAnimoFrecuentes: {},
    ultimosAudios: [],
    rachaActual: 0,
    audiosHoy: 0
  });
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    loadAudioStats();
  }, []);

  const loadAudioStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      const audiosRef = collection(firestore, 'users', user.uid, 'audios');
      const audiosSnapshot = await getDocs(audiosRef);
      
      if (audiosSnapshot.empty) {
        setLoading(false);
        return;
      }

      const audiosData = audiosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        escuchadoEn: doc.data().escuchadoEn ? new Date(doc.data().escuchadoEn) : new Date()
      }));

      // Calcular estadísticas
      const stats = calculateStats(audiosData);
      setAudioStats(stats);
      
    } catch (error) {
      console.error('Error al cargar estadísticas de audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (audiosData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Total de audios
    const totalAudios = audiosData.length;
    
    // Audios escuchados hoy
    const audiosHoy = audiosData.filter(audio => {
      const audioDate = new Date(audio.escuchadoEn);
      audioDate.setHours(0, 0, 0, 0);
      return audioDate.getTime() === today.getTime();
    }).length;

    // Tiempo total escuchado (convertir duración de string a minutos)
    const totalTiempoEscuchado = audiosData.reduce((total, audio) => {
      const duracionStr = audio.duracion;
      if (duracionStr) {
        const [minutos, segundos] = duracionStr.split(':').map(Number);
        return total + minutos + (segundos / 60);
      }
      return total;
    }, 0);

    // Categorías más frecuentes
    const categoriasFrecuentes = audiosData.reduce((acc, audio) => {
      const categoria = audio.categoria;
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    // Estados de ánimo más frecuentes
    const estadosAnimoFrecuentes = audiosData.reduce((acc, audio) => {
      const estado = audio.estadoAnimo;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Últimos 5 audios escuchados
    const ultimosAudios = audiosData
      .sort((a, b) => new Date(b.escuchadoEn) - new Date(a.escuchadoEn))
      .slice(0, 5);

    // Calcular racha actual (días consecutivos con al menos un audio)
    const rachaActual = calculateCurrentStreak(audiosData);

    // Audios más escuchados (basado en título)
    const audiosFrecuentes = audiosData.reduce((acc, audio) => {
      const titulo = audio.titulo;
      if (!acc[titulo]) {
        acc[titulo] = { 
          titulo, 
          categoria: audio.categoria, 
          estadoAnimo: audio.estadoAnimo,
          count: 0 
        };
      }
      acc[titulo].count++;
      return acc;
    }, {});

    const audiosFavoritos = Object.values(audiosFrecuentes)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalAudios,
      totalTiempoEscuchado: Math.round(totalTiempoEscuchado),
      audiosFavoritos,
      categoriasFrecuentes,
      estadosAnimoFrecuentes,
      ultimosAudios,
      rachaActual,
      audiosHoy
    };
  };

  const calculateCurrentStreak = (audiosData) => {
    if (audiosData.length === 0) return 0;

    // Obtener fechas únicas en orden descendente
    const fechasUnicas = [...new Set(audiosData.map(audio => {
      const fecha = new Date(audio.escuchadoEn);
      return fecha.toISOString().split('T')[0];
    }))].sort().reverse();

    if (fechasUnicas.length === 0) return 0;

    const hoy = new Date().toISOString().split('T')[0];
    let racha = 0;
    let fechaActual = new Date(hoy);

    // Si no hay audio hoy, empezar desde ayer
    if (fechasUnicas[0] !== hoy) {
      fechaActual.setDate(fechaActual.getDate() - 1);
    }

    for (let i = 0; i < fechasUnicas.length; i++) {
      const fechaEsperada = fechaActual.toISOString().split('T')[0];
      
      if (fechasUnicas[i] === fechaEsperada) {
        racha++;
        fechaActual.setDate(fechaActual.getDate() - 1);
      } else {
        break;
      }
    }

    return racha;
  };

  const formatTiempo = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getTopCategory = () => {
    const categorias = Object.entries(audioStats.categoriasFrecuentes);
    if (categorias.length === 0) return 'N/A';
    return categorias.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getTopMood = () => {
    const estados = Object.entries(audioStats.estadosAnimoFrecuentes);
    if (estados.length === 0) return 'N/A';
    return estados.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  if (loading) {
    return (
      <View className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 mb-6 shadow-2xl border border-purple-700">
        <Text className="text-white text-xl font-bold mb-4">🎵 Audio Inspira</Text>
        <Text className="text-gray-300">Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <View className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 mb-6 shadow-2xl border border-purple-700">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-white text-xl font-bold">🎵 Audio Inspira</Text>
          <Text className="text-purple-200 text-sm mt-1">Tu progreso en bienestar mental</Text>
        </View>
      </View>

      {/* Estadísticas principales */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-purple-800 rounded-2xl p-4 flex-1 mr-2">
          <Text className="text-purple-200 text-sm">Total Audios</Text>
          <Text className="text-white text-2xl font-bold">{audioStats.totalAudios}</Text>
        </View>
        <View className="bg-indigo-800 rounded-2xl p-4 flex-1 ml-2">
          <Text className="text-indigo-200 text-sm">Tiempo Total</Text>
          <Text className="text-white text-2xl font-bold">{formatTiempo(audioStats.totalTiempoEscuchado)}</Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-pink-800 rounded-2xl p-4 flex-1 mr-2">
          <Text className="text-pink-200 text-sm">Racha Actual</Text>
          <Text className="text-white text-2xl font-bold">{audioStats.rachaActual} días</Text>
        </View>
        <View className="bg-cyan-800 rounded-2xl p-4 flex-1 ml-2">
          <Text className="text-cyan-200 text-sm">Audios Hoy</Text>
          <Text className="text-white text-2xl font-bold">{audioStats.audiosHoy}</Text>
        </View>
      </View>

      {/* Información adicional expandible */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => toggleSection('categorias')}
          className="bg-purple-800 rounded-xl p-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-semibold">Categoría Favorita: {getTopCategory()}</Text>
            <AntDesign 
              name={expandedSection === 'categorias' ? 'up' : 'down'} 
              size={20} 
              color="white" 
            />
          </View>
          {expandedSection === 'categorias' && (
            <View className="mt-3 pt-3 border-t border-purple-600">
              {Object.entries(audioStats.categoriasFrecuentes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([categoria, count]) => (
                  <View key={categoria} className="flex-row justify-between py-1">
                    <Text className="text-purple-200">{categoria}</Text>
                    <Text className="text-white font-semibold">{count} audios</Text>
                  </View>
                ))}
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleSection('estados')}
          className="bg-indigo-800 rounded-xl p-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-semibold">Estado de Ánimo: {getTopMood()}</Text>
            <AntDesign 
              name={expandedSection === 'estados' ? 'up' : 'down'} 
              size={20} 
              color="white" 
            />
          </View>
          {expandedSection === 'estados' && (
            <View className="mt-3 pt-3 border-t border-indigo-600">
              {Object.entries(audioStats.estadosAnimoFrecuentes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([estado, count]) => (
                  <View key={estado} className="flex-row justify-between py-1">
                    <Text className="text-indigo-200">{estado}</Text>
                    <Text className="text-white font-semibold">{count} veces</Text>
                  </View>
                ))}
            </View>
          )}
        </TouchableOpacity>

        {audioStats.audiosFavoritos.length > 0 && (
          <TouchableOpacity
            onPress={() => toggleSection('favoritos')}
            className="bg-pink-800 rounded-xl p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">Audios Más Escuchados</Text>
              <AntDesign 
                name={expandedSection === 'favoritos' ? 'up' : 'down'} 
                size={20} 
                color="white" 
              />
            </View>
            {expandedSection === 'favoritos' && (
              <View className="mt-3 pt-3 border-t border-pink-600">
                {audioStats.audiosFavoritos.map((audio, index) => (
                  <View key={index} className="py-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white font-medium">{audio.titulo}</Text>
                      <Text className="text-pink-200">{audio.count}x</Text>
                    </View>
                    <Text className="text-pink-300 text-sm">{audio.estadoAnimo} • {audio.categoria}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}

        {audioStats.ultimosAudios.length > 0 && (
          <TouchableOpacity
            onPress={() => toggleSection('recientes')}
            className="bg-cyan-800 rounded-xl p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">Actividad Reciente</Text>
              <AntDesign 
                name={expandedSection === 'recientes' ? 'up' : 'down'} 
                size={20} 
                color="white" 
              />
            </View>
            {expandedSection === 'recientes' && (
              <View className="mt-3 pt-3 border-t border-cyan-600">
                {audioStats.ultimosAudios.slice(0, 3).map((audio, index) => (
                  <View key={index} className="py-1">
                    <Text className="text-white font-medium">{audio.titulo}</Text>
                    <Text className="text-cyan-300 text-sm">
                      {new Date(audio.escuchadoEn).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • {audio.estadoAnimo}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje motivacional */}
      <View className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl p-4 mt-4">
        <Text className="text-white text-center font-medium">
          {audioStats.rachaActual > 0 
            ? `¡Increíble! Llevas ${audioStats.rachaActual} días cuidando tu bienestar mental.`
            : "Cada audio que escuchas es una inversión en tu bienestar mental. ¡Sigue así!"
          }
        </Text>
      </View>
    </View>
  );
}