import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteHealthRecord,
  getAllHealthRecords,
  searchHealthRecordsByDate,
  updateHealthRecord,
} from '../../database/healthDatabase';

interface HealthRecord {
  id: number;
  date: string;
  steps: number;
  calories: number;
  water: number;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function HistoryScreen() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchDate, setSearchDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const [saving, setSaving] = useState(false);

  // Load all records
  const loadRecords = async () => {
    try {
      const data = await getAllHealthRecords();
      setRecords(data as HealthRecord[]);
      setIsSearching(false);
    } catch (error) {
      console.error('History loading error:', error);
      Alert.alert('Error', 'Unable to load health records.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRecords();
    }, [])
  );

  // Open calendar
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Handle selected date
  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (event.type === 'set' && selectedDate) {
      setSearchDate(formatDate(selectedDate));
    }
  };

  // Search records by date
  const handleSearch = async () => {
    const date = searchDate.trim();

    if (date === '') {
      Alert.alert('Missing Date', 'Please select a date.');
      return;
    }

    try {
      setLoading(true);

      const data = await searchHealthRecordsByDate(date);

      setRecords(data as HealthRecord[]);
      setIsSearching(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Unable to search records.');
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const handleClearSearch = async () => {
    setSearchDate('');
    await loadRecords();
  };

  // Open edit modal
  const handleEdit = (record: HealthRecord) => {
    setSelectedId(record.id);

    setSteps(record.steps.toString());
    setCalories(record.calories.toString());
    setWater(record.water.toString());

    setModalVisible(true);
  };

  // Update record
  const handleUpdate = async () => {
    if (selectedId === null) return;

    if (
      steps.trim() === '' ||
      calories.trim() === '' ||
      water.trim() === ''
    ) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
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
        'Enter valid non-negative whole numbers.'
      );
      return;
    }

    try {
      setSaving(true);

      const selectedRecord = records.find(
        (record) => record.id === selectedId
      );

      if (!selectedRecord) return;

      await updateHealthRecord(
        selectedId,
        selectedRecord.date,
        stepsValue,
        caloriesValue,
        waterValue
      );

      setModalVisible(false);

      if (isSearching) {
        const data = await searchHealthRecordsByDate(searchDate.trim());
        setRecords(data as HealthRecord[]);
      } else {
        await loadRecords();
      }

      Alert.alert('Success', 'Health record updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Unable to update health record.');
    } finally {
      setSaving(false);
    }
  };

  // Delete record
  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this health record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHealthRecord(id);

              if (isSearching) {
                const data = await searchHealthRecordsByDate(
                  searchDate.trim()
                );
                setRecords(data as HealthRecord[]);
              } else {
                await loadRecords();
              }

              Alert.alert(
                'Success',
                'Health record deleted successfully!'
              );
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Unable to delete health record.');
            }
          },
        },
      ]
    );
  };

  // Record card
  const renderRecord = ({ item }: { item: HealthRecord }) => (
    <View style={styles.recordCard}>
      <Text style={styles.date}> {item.date}</Text>

      <View style={styles.details}>
        <Text style={styles.detail}>👣 Steps: {item.steps}</Text>
        <Text style={styles.detail}>🔥 Calories: {item.calories}</Text>
        <Text style={styles.detail}>💧 Water: {item.water} ml</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Health History</Text>

      <Text style={styles.subtitle}>
        View and manage your health records
      </Text>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchTitle}>Search by Date</Text>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={openDatePicker}
        >
          <Text style={styles.datePickerText}>
            {searchDate || 'Select a date'}
          </Text>

          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={
              searchDate
                ? new Date(
                    Number(searchDate.split('-')[0]),
                    Number(searchDate.split('-')[1]) - 1,
                    Number(searchDate.split('-')[2])
                  )
                : new Date()
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View style={styles.searchButtons}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSearch}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#20B8A5"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecord}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleClearSearch}
              tintColor="#20B8A5"
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isSearching
                ? 'No records found for this date.'
                : 'No health records found.'}
            </Text>
          }
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Health Record</Text>

            <Text style={styles.inputLabel}>Steps Walked</Text>
            <TextInput
              style={styles.input}
              value={steps}
              onChangeText={setSteps}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Calories Burned</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Water Intake (ml)</Text>
            <TextInput
              style={styles.input}
              value={water}
              onChangeText={setWater}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? 'Updating...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Professional Navy Blue + Teal Theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FC',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#163A5F',
    marginTop: 15,
  },

  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    marginBottom: 20,
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },

  searchTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#163A5F',
    marginBottom: 12,
  },

  datePickerButton: {
    borderWidth: 1,
    borderColor: '#D6E2F0',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#F4F8FC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  datePickerText: {
    fontSize: 15,
    color: '#172B4D',
  },

  calendarIcon: {
    fontSize: 20,
  },

  searchButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  searchButton: {
    flex: 1,
    backgroundColor: '#20B8A5',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  clearButton: {
    flex: 1,
    backgroundColor: '#163A5F',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  loader: {
    marginTop: 50,
  },

  list: {
    paddingBottom: 30,
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#20B8A5',
  },

  date: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#163A5F',
    marginBottom: 15,
  },

  details: {
    gap: 10,
  },

  detail: {
    fontSize: 15,
    color: '#172B4D',
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#20B8A5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#D9534F',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  emptyText: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 40,
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#163A5F',
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172B4D',
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D6E2F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#172B4D',
    backgroundColor: '#F4F8FC',
  },

  updateButton: {
    backgroundColor: '#20B8A5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 22,
  },

  cancelButton: {
    padding: 13,
    alignItems: 'center',
    marginTop: 5,
  },

  cancelText: {
    color: '#718096',
    fontWeight: '600',
  },
});