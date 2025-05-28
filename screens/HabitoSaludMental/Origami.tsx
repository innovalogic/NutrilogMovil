import React, { useState, useEffect, useRef } from 'react';
import {
  Text, 
  TouchableOpacity, 
  View,
  Image,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

const origamiExamples = {
  'Avion': {
    steps: [
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/1_qw0lxr.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464172/2_pnssoe.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/3_pyfpva.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464172/4_gf0yom.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/5_edwr6m.png',
      'https://res.cloudinary.com/dynoxftwk/image/upload/v1748464173/6_edwr6m.png',
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
  const [dailyOrigami, setDailyOrigami] = useState(null);
  const [selectedOrigami, setSelectedOrigami] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  
  // Obtener el origami del día
  useEffect(() => {
    const origamiNames = Object.keys(origamiExamples);
    const today = new Date().getDate() % origamiNames.length;
    setDailyOrigami(origamiNames[today]);
    
    // Solicitar permisos de cámara
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Cargar galería de fotos
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus === 'granted') {
        loadGallery();
      }
    })();
  }, []);
  
  const loadGallery = async () => {
  try {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first: 20,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });
    setGallery(media.assets);
  } catch (error) {
    console.log("Error cargando galería:", error);
  }
};
  
  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      loadGallery();
      setShowCamera(false);
    }
  };
  
  const startOrigami = (name) => {
    setSelectedOrigami(name);
    setCurrentStep(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };
  
  const nextStep = () => {
    if (currentStep < origamiExamples[selectedOrigami].steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const resetOrigami = () => {
    setSelectedOrigami(null);
    setCurrentStep(0);
  };
  
  // Manejar carga de imágenes
  const handleImageLoadStart = (imageKey) => {
    setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
  };
  
  const handleImageLoadEnd = (imageKey) => {
    setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
  };
  
  const renderOrigamiStep = () => {
    const origami = origamiExamples[selectedOrigami];
    const currentImage = origami.steps[currentStep];
    const imageKey = `${selectedOrigami}-step-${currentStep}`;
    
    return (
      <View className="flex-1 items-center justify-center p-5">
        <View className="w-[90%] aspect-square justify-center items-center">
          {loadingImages[imageKey] && (
            <ActivityIndicator size="large" color="#4CAF50" />
          )}
          <Animated.Image 
            source={{ uri: currentImage }}
            className="w-full h-full"
            style={{ opacity: fadeAnim, display: loadingImages[imageKey] ? 'none' : 'flex' }}
            onLoadStart={() => handleImageLoadStart(imageKey)}
            onLoadEnd={() => handleImageLoadEnd(imageKey)}
            onError={() => handleImageLoadEnd(imageKey)}
          />
        </View>
        
        <Text className="text-lg text-gray-700 my-5">
          Paso {currentStep + 1} de {origami.steps.length}
        </Text>
        
        <View className="flex-row justify-between w-full px-5">
          <TouchableOpacity 
            className={`px-6 py-3 rounded-md ${currentStep === 0 ? 'bg-gray-300' : 'bg-green-600'}`}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Text className="text-white font-bold">Anterior</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-6 py-3 rounded-md ${currentStep === origami.steps.length - 1 ? 'bg-blue-500' : 'bg-green-600'}`}
            onPress={nextStep}
          >
            <Text className="text-white font-bold">
              {currentStep === origami.steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderFinalStep = () => {
    const origami = origamiExamples[selectedOrigami];
    const finalImageKey = `${selectedOrigami}-final`;
    
    return (
      <View className="flex-1 items-center justify-center p-5">
        <View className="w-[80%] aspect-square justify-center items-center">
          {loadingImages[finalImageKey] && (
            <ActivityIndicator size="large" color="#4CAF50" />
          )}
          <Image 
            source={{ uri: origami.finalImage }}
            className="w-full h-full"
            style={{ display: loadingImages[finalImageKey] ? 'none' : 'flex' }}
            onLoadStart={() => handleImageLoadStart(finalImageKey)}
            onLoadEnd={() => handleImageLoadEnd(finalImageKey)}
            onError={() => handleImageLoadEnd(finalImageKey)}
          />
        </View>
        
        <Text className="text-2xl font-bold text-green-600 my-7">¡Origami completado!</Text>
        
        <TouchableOpacity 
          className="px-6 py-4 bg-blue-500 rounded-lg mb-4"
          onPress={() => setShowCamera(true)}
        >
          <Text className="text-white font-bold text-base">Comparar con mi origami</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="px-6 py-3 border border-gray-700 rounded-md"
          onPress={resetOrigami}
        >
          <Text className="text-gray-700 text-base">Volver a la lista</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderCamera = () => (
    <View className="flex-1 bg-black">
      <Camera 
        className="flex-1"
        type={Camera.Constants.Type.back}
        ref={ref => setCameraRef(ref)}
      >
        <View className="flex-1 bg-transparent flex-row justify-center items-end mb-10">
          <TouchableOpacity 
            className="self-center mb-5"
            onPress={takePicture}
          >
            <View className="w-16 h-16 rounded-full bg-white border-2 border-white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="absolute top-10 right-5 bg-black bg-opacity-50 w-10 h-10 rounded-full justify-center items-center"
            onPress={() => setShowCamera(false)}
          >
            <Text className="text-white text-xl font-bold">X</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
  
  const renderGallery = () => (
    <View className="mt-8 px-3">
      <Text className="text-xl font-bold text-gray-800 mb-4">Mis Origamis</Text>
      <FlatList
        data={gallery}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <Image 
            source={{ uri: item.uri }} 
            className="w-[32%] aspect-square m-0.5"
          />
        )}
      />
    </View>
  );

  const renderOrigamiItem = ({ name, isDaily = false }) => {
    const origami = origamiExamples[name];
    const imageKey = `${name}-thumbnail`;
    
    return (
      <TouchableOpacity 
        className={`items-center mb-4 ${isDaily ? 'bg-gray-100 p-4 rounded-xl shadow-md' : 'w-[48%] bg-gray-100 p-3 rounded-lg shadow-sm'}`}
        onPress={() => startOrigami(name)}
      >
        <View className={`justify-center items-center ${isDaily ? 'w-48 h-48' : 'w-36 h-36'} mb-2`}>
          {loadingImages[imageKey] && (
            <ActivityIndicator size={isDaily ? 'large' : 'small'} color="#4CAF50" />
          )}
          <Image
            source={{ uri: origami.finalImage }}
            className="w-full h-full"
            style={{ display: loadingImages[imageKey] ? 'none' : 'flex' }}
            onLoadStart={() => handleImageLoadStart(imageKey)}
            onLoadEnd={() => handleImageLoadEnd(imageKey)}
            onError={() => handleImageLoadEnd(imageKey)}
          />
        </View>
        
        <Text className={`font-semibold text-gray-700 ${isDaily ? 'text-lg' : 'text-base'}`}>
          {name}
        </Text>
        <Text className={`text-gray-${isDaily ? '600' : '500'} ${isDaily ? '' : 'text-sm'}`}>
          Dificultad: {origami.difficulty}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{
            flex: 1,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            backgroundColor: 'white',
          }}
          >
      {showCamera ? (
        renderCamera()
      ) : selectedOrigami ? (
        currentStep === origamiExamples[selectedOrigami].steps.length ? 
          renderFinalStep() : 
          renderOrigamiStep()
      ) : (
        <ScrollView className="flex-1 px-4 pb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">Origami del Día</Text>
          
          {dailyOrigami && renderOrigamiItem({ name: dailyOrigami, isDaily: true })}
          
          <Text className="text-xl font-bold text-gray-800 mb-4">Más Origamis</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {Object.keys(origamiExamples).map((name) => (
              name !== dailyOrigami && (
                <View key={name} className="w-[48%]">
                  {renderOrigamiItem({ name })}
                </View>
              )
            ))}
          </View>
          
          {gallery.length > 0 && renderGallery()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}