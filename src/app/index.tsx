import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addHealthRecord,
  getTodayHealthSummary,
  initDatabase,
} from '../../database/healthDatabase';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const [totalSteps, setTotalSteps] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalWater, setTotalWater] = useState(0);

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshDashboard = async () => {
        try {
          await initDatabase();

          const summary = await getTodayHealthSummary(getTodayDate());

          if (isActive) {
            setTotalSteps(Number(summary?.totalSteps) || 0);
            setTotalCalories(Number(summary?.totalCalories) || 0);
            setTotalWater(Number(summary?.totalWater) || 0);
          }
        } catch (error) {
          console.error('Dashboard loading error:', error);
          Alert.alert('Error', 'Unable to load health summary.');
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      refreshDashboard();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const loadSummary = async () => {
    try {
      const summary = await getTodayHealthSummary(getTodayDate());

      setTotalSteps(Number(summary?.totalSteps) || 0);
      setTotalCalories(Number(summary?.totalCalories) || 0);
      setTotalWater(Number(summary?.totalWater) || 0);
    } catch (error) {
      console.error('Summary loading error:', error);
    }
  };

  const handleSaveRecord = async () => {
    if (
      steps.trim() === '' ||
      calories.trim() === '' ||
      water.trim() === ''
    ) {
      Alert.alert('Missing Information', 'Please enter all health details.');
      return;
    }

    const stepsValue = Number(steps);
    const caloriesValue = Number(calories);
    const waterValue = Number(water);

    if (
      !Number.isInteger(stepsValue) ||
      !Number.isInteger(caloriesValue) ||
      !Number.isInteger(waterValue) ||
      stepsValue < 0 ||
      caloriesValue < 0 ||
      waterValue < 0
    ) {
      Alert.alert(
        'Invalid Input',
        'Please enter valid non-negative whole numbers.'
      );
      return;
    }

    try {
      await addHealthRecord(
        getTodayDate(),
        stepsValue,
        caloriesValue,
        waterValue
      );

      await loadSummary();

      setSteps('');
      setCalories('');
      setWater('');

      Alert.alert('Success', 'Health record saved successfully!');
    } catch (error) {
      console.error('Saving error:', error);
      Alert.alert('Error', 'Unable to save health record.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20B8A5" />
        <Text style={styles.loadingText}>Loading HealthMate...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HealthMate 💙</Text>
          <Text style={styles.subtitle}>
            Your Personal Health & Wellness Tracker
          </Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>

          <Text style={styles.welcomeText}>
            Take care of your health every day.
          </Text>

          <View style={styles.dateBadge}>
            <Text style={styles.date}>📅 {getTodayDate()}</Text>
          </View>
        </View>

        {/* Health Summary */}
        <Text style={styles.sectionTitle}>
          Today's Health Summary
        </Text>

        <View style={styles.summaryContainer}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>👣</Text>
            <Text style={styles.cardValue}>{totalSteps}</Text>
            <Text style={styles.cardLabel}>Steps Walked</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={styles.cardValue}>{totalCalories}</Text>
            <Text style={styles.cardLabel}>Calories Burned</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>💧</Text>
            <Text style={styles.cardValue}>{totalWater}</Text>
            <Text style={styles.cardLabel}>Water (ml)</Text>
          </View>
        </View>

        {/* Add Health Record */}
        <Text style={styles.sectionTitle}>
          Add Health Record
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.formSubtitle}>
            Enter your daily health activities
          </Text>

          <Text style={styles.inputLabel}>👣 Steps Walked</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter number of steps"
            placeholderTextColor="#9AA8B7"
            keyboardType="number-pad"
            value={steps}
            onChangeText={setSteps}
          />

          <Text style={styles.inputLabel}>🔥 Calories Burned</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter calories burned"
            placeholderTextColor="#9AA8B7"
            keyboardType="number-pad"
            value={calories}
            onChangeText={setCalories}
          />

          <Text style={styles.inputLabel}>💧 Water Intake (ml)</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter water intake"
            placeholderTextColor="#9AA8B7"
            keyboardType="number-pad"
            value={water}
            onChangeText={setWater}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveRecord}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              + Save Health Record
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Stay Healthy. Stay Active. 💚
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F4F8FC',
  },

  loadingText: {
    color: '#163A5F',
    fontSize: 15,
  },

  header: {
    padding: 22,
    alignItems: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#163A5F',
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 5,
  },

  welcomeCard: {
    backgroundColor: '#163A5F',
    marginHorizontal: 18,
    padding: 23,
    borderRadius: 20,
    elevation: 4,
  },

  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },

  welcomeText: {
    color: '#DCE8F3',
    fontSize: 14,
    marginTop: 9,
  },

  dateBadge: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 18,
  },

  date: {
    color: '#163A5F',
    fontSize: 13,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#163A5F',
    marginHorizontal: 18,
    marginTop: 27,
    marginBottom: 15,
  },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 17,
    alignItems: 'center',
    elevation: 3,
    borderBottomWidth: 4,
    borderBottomColor: '#20B8A5',
  },

  cardIcon: {
    fontSize: 27,
  },

  cardValue: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#163A5F',
    marginTop: 10,
  },

  cardLabel: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    marginTop: 5,
  },

  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  formSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#163A5F',
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DCE6EF',
    borderRadius: 11,
    padding: 14,
    fontSize: 15,
    color: '#172B4D',
    backgroundColor: '#F8FAFC',
  },

  saveButton: {
    backgroundColor: '#20B8A5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 26,
    elevation: 2,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footerText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 13,
    marginBottom: 25,
    marginTop: 5,
  },
});