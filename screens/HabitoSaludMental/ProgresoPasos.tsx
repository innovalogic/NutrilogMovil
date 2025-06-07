import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { auth, firestore } from '../../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { startOfWeek, endOfWeek, startOfMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const ProgresoPasos = () => {
  const [dailySteps, setDailySteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [monthlySteps, setMonthlySteps] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStepData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const today = new Date();
        const startOfCurrentWeek = startOfWeek(today, { locale: es });
        const endOfCurrentWeek = endOfWeek(today, { locale: es });
        const startOfCurrentMonth = startOfMonth(today, { locale: es });
        
        const stepsRef = collection(firestore, 'users', user.uid, 'stepCounts');
        const q = query(stepsRef);
        const querySnapshot = await getDocs(q);
        
        let daily = 0;
        let weekly = 0;
        let monthly = 0;
        const weekDaysData = Array(7).fill(0);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.date.toDate();
          const steps = data.steps || 0;
          
          if (isSameDay(date, today)) daily += steps;
          
          if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
            weekly += steps;
            const dayIndex = date.getDay();
            weekDaysData[dayIndex] += steps;
          }
          
          if (date >= startOfCurrentMonth) monthly += steps;
        });
        
        setDailySteps(daily);
        setWeeklySteps(weekly);
        setMonthlySteps(monthly);
        
        const formattedWeekData = weekDaysData.map((steps, index) => {
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          return { day: dayNames[index], steps };
        });
        
        setWeekData(formattedWeekData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching step data:', error);
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, []);

  if (loading) {
    return (
      <View className="items-center justify-center p-5">
        <Text className="text-white">Cargando datos de pasos...</Text>
      </View>
    );
  }

  return (
    <View className="bg-slate-800 rounded-xl p-4 mb-4 shadow-lg shadow-black/50">
      <Text className="text-white text-xl font-bold mb-4">📊 Progreso de Pasos</Text>
      
      {/* Resumen de pasos */}
      <View className="flex-row justify-between mb-5">
        <View className="bg-slate-700 rounded-lg p-3 items-center flex-1 mx-1">
          <Text className="text-slate-300 text-sm">Hoy</Text>
          <Text className="text-white text-lg font-bold my-1">{dailySteps.toLocaleString()}</Text>
          <Text className="text-slate-300 text-xs">pasos</Text>
        </View>
        
        <View className="bg-slate-700 rounded-lg p-3 items-center flex-1 mx-1">
          <Text className="text-slate-300 text-sm">Esta semana</Text>
          <Text className="text-white text-lg font-bold my-1">{weeklySteps.toLocaleString()}</Text>
          <Text className="text-slate-300 text-xs">pasos</Text>
        </View>
        
        <View className="bg-slate-700 rounded-lg p-3 items-center flex-1 mx-1">
          <Text className="text-slate-300 text-sm">Este mes</Text>
          <Text className="text-white text-lg font-bold my-1">{monthlySteps.toLocaleString()}</Text>
          <Text className="text-slate-300 text-xs">pasos</Text>
        </View>
      </View>
      
      {/* Gráfico de barras semanal */}
      <Text className="text-white text-base font-semibold mb-2">Pasos por día (esta semana)</Text>
      {weekData.length > 0 ? (
        <BarChart
          data={{
            labels: weekData.map(item => item.day),
            datasets: [{ data: weekData.map(item => item.steps) }]
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#4e73df',
            backgroundGradientFrom: '#4e73df',
            backgroundGradientTo: '#2a52be',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' }
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
          fromZero
        />
      ) : (
        <Text className="text-slate-400 text-center my-5">No hay datos de pasos esta semana</Text>
      )}
    </View>
  );
};

export default ProgresoPasos;