import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const origamiExamples = {
  'Avion': {
    steps: [
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/1_qw0lxr.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464172/2_pnssoe.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/3_pyfpva.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464172/4_gf0yom.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/5_edwr6m.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464172/6_ssp8wt.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/7_i1knu6.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/8_uar8jz.png',
    ],
    finalImage: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/9_fgvv2z.png',
    difficulty: 'Fácil'
  },
  'Rana': {
    steps: [
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748465902/1_ngsnui.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748465902/2_oe9cpe.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748465903/3_urv4ym.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748465903/4_xgb52y.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748465903/5_spxfec.png',
    ],
    finalImage: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748465902/6_ngwnut.png',
    difficulty: 'Intermedio'
  },
  'Corazon': {
    steps: [
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466099/Photos_WHMn8pokSs_wlpl7r.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466103/Photos_LgxBNXCueX_f9loq8.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466102/Photos_J4Yhg3Gune_qdhy95.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466099/Photos_4fOvccOx8N_m4j9ve.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466098/Photos_RNgBsFVJRi_xwxdrg.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466102/Photos_Cu5GOB9orG_rrtkz6.png',
    ],
    finalImage: 'https://res.cloudinary.com/dynoxftwk/image/upload/v1748466098/Photos_mzAMxa0MkN_ab0owc.png',
    difficulty: 'Fácil'
  }
}; 

export default function OrigamiApp() {
  const [view, setView] = useState('list'); // 'list', 'detail', 'camera', 'gallery'
  const [selected, setSelected] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [gallery, setGallery] = useState([]);

  // Ejemplo diario
  useEffect(() => {
    const names = Object.keys(origamiExamples);
    const today = new Date().getDate();
    const pick = names[today % names.length];
    setSelected(pick);
  }, []);

  // Carga galería
  useEffect(() => {
    async function load() {
      const fileUri = FileSystem.documentDirectory + 'gallery.json';
      try {
        const content = await FileSystem.readAsStringAsync(fileUri);
        setGallery(JSON.parse(content));
      } catch {}
    }
    load();
  }, []);

  const saveGallery = async (uri, name) => {
    const newEntry = { uri, name, date: new Date().toISOString() };
    const updated = [...gallery, newEntry];
    setGallery(updated);
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + 'gallery.json',
      JSON.stringify(updated)
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.cancelled) saveGallery(result.uri, selected);
    setView('gallery');
  };

  if (view === 'list') {
  return (
    <SafeAreaView className="flex-1 bg-white pt-10">
      <View className="flex-1 bg-black p-4">
        <Text className="text-2xl font-bold mb-4 text-white">Origami Diario</Text>
        <ScrollView>
          {Object.keys(origamiExamples).map((item) => (
            <TouchableOpacity
              key={item}
              className="p-3 bg-[#202938] mb-2 rounded-lg"
              onPress={() => { setSelected(item); setStepIndex(0); setView('detail'); }}
            >
              <Text className="text-lg font-semibold text-white">{item}</Text>
              <Text className="text-white">Dificultad: {origamiExamples[item].difficulty}</Text>
              <Image
                source={{ uri: origamiExamples[item].finalImage }}
                className="w-full h-40 mt-2 rounded-lg"
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          className="mt-4 bg-blue-500 py-2 rounded-lg"
          onPress={() => setView('gallery')}
        >
          <Text className="text-center text-white">Galería</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

if (view === 'detail') {
  const data = origamiExamples[selected];
  return (
    <SafeAreaView className="flex-1 bg-white pt-10">
      <View className="flex-1 bg-black p-4">
        <Text className="text-2xl font-bold mb-4 text-white">{selected} - Paso {stepIndex + 1}/{data.steps.length}</Text>
        <Image
          source={{ uri: data.steps[stepIndex] }}
          className="w-full h-72 mb-4 rounded-lg"
          resizeMode="contain"
        />
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            disabled={stepIndex === 0}
            className={`px-4 py-2 rounded-lg ${stepIndex === 0 ? 'bg-gray-300' : 'bg-blue-500'}`}
            onPress={() => setStepIndex((i) => i - 1)}
          >
            <Text className="text-white">Anterior</Text>
          </TouchableOpacity>
          {stepIndex < data.steps.length - 1 ? (
            <TouchableOpacity
              className="px-4 py-2 bg-blue-500 rounded-lg"
              onPress={() => setStepIndex((i) => i + 1)}
            >
              <Text className="text-white">Siguiente</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-4 py-2 bg-green-500 rounded-lg"
              onPress={() => setView('camera')}
            >
              <Text className="text-white">Concluir</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setView('list')}>
          <Text className="text-blue-400">Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

if (view === 'camera') {
  const final = origamiExamples[selected].finalImage;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-black p-4 justify-center items-center">
        <Text className="text-2xl font-bold mb-4 text-white">¡Completado!</Text>
        <Image source={{ uri: final }} className="w-full h-64 resize-contain mb-4" />
        <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-lg mb-2" onPress={openCamera}>
          <Text className="text-white">Tomar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-200 py-2 px-4 rounded-lg" onPress={() => setView('gallery')}>
          <Text className="text-center">Ver Galería</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

if (view === 'gallery') {
  return (
    <SafeAreaView className="flex-1 bg-white pt-10">
      <View className="flex-1 bg-black p-4">
        <Text className="text-2xl font-bold mb-4 text-white">Galería de Origamis</Text>
        <ScrollView>
          {gallery.map((item, idx) => (
            <View key={idx} className="mb-4 items-center">
              <Text className="font-semibold text-white">{item.name}</Text>
              <View className="flex-row space-x-4 items-center">
                <Image source={{ uri: origamiExamples[item.name]?.finalImage }} className="w-24 h-24 rounded" />
                <Image source={{ uri: item.uri }} className="w-24 h-24 rounded" />
              </View>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity className="mt-4" onPress={() => setView('list')}>
          <Text className="text-blue-400">Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

return null;

}
