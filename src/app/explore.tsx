import { useState } from 'react';

import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const healthTips = [
  {
    id: '1',
    icon: '💧',
    title: 'Water Intake Tips',
    subtitle: 'Stay hydrated throughout the day',
    color: '#E6F7F5',
    tips: [
      'Drink water regularly throughout the day.',
      'Start your morning with a glass of water.',
      'Drink water before and after physical activities.',
      'Carry a reusable water bottle when travelling.',
    ],
  },
  {
    id: '2',
    icon: '🚶',
    title: 'Walking & Fitness',
    subtitle: 'Keep your body active and healthy',
    color: '#EAF1FA',
    tips: [
      'Try to walk regularly every day.',
      'Take short walking breaks during long sitting periods.',
      'Use stairs instead of elevators when possible.',
      'Start with light exercises and increase gradually.',
    ],
  },
  {
    id: '3',
    icon: '🥗',
    title: 'Healthy Eating',
    subtitle: 'Build healthy eating habits',
    color: '#FFF5E8',
    tips: [
      'Include fruits and vegetables in your daily meals.',
      'Choose balanced meals with different food groups.',
      'Limit excessive sugar and processed foods.',
      'Avoid skipping regular meals.',
    ],
  },
  {
    id: '4',
    icon: '😴',
    title: 'Sleep Tips',
    subtitle: 'Improve your sleep quality',
    color: '#F0EBFA',
    tips: [
      'Maintain a regular sleeping schedule.',
      'Avoid using mobile phones before bedtime.',
      'Keep your bedroom comfortable and quiet.',
      'Try to get enough sleep every night.',
    ],
  },
  {
    id: '5',
    icon: '❤️',
    title: 'General Wellness',
    subtitle: 'Take care of your overall wellbeing',
    color: '#FCEDEE',
    tips: [
      'Take breaks and relax during busy days.',
      'Spend time doing activities you enjoy.',
      'Maintain a balanced daily routine.',
      'Pay attention to your physical and mental wellbeing.',
    ],
  },
];

export default function ExploreScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health & Wellness</Text>
          <Text style={styles.headerSubtitle}>
            Small healthy habits make a big difference.
          </Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Your Health Matters!</Text>
            <Text style={styles.welcomeDescription}>
              Explore simple tips to build a healthier and happier lifestyle.
            </Text>
          </View>

          <Image
            source={require('@/assets/images/without_bg_logo.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
            accessibilityLabel="HealthMate"
          />
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Health Tips</Text>
          <Text style={styles.sectionSubtitle}>
            Select a category to discover useful tips.
          </Text>
        </View>

        {/* Health Tip Categories */}
        {healthTips.map((category) => {
          const isExpanded = expandedId === category.id;

          return (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>
                    {category.subtitle}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>{isExpanded ? '−' : '+'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.tipsContainer}>
                  <View style={styles.divider} />

                  {category.tips.map((tip) => (
                    <View key={tip} style={styles.tipRow}>
                      <View style={styles.tipBullet}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Bottom Message */}
        <View style={styles.footerCard}>
          <Image
            source={require('@/assets/images/healthmate-logo.png')}
            style={styles.footerLogo}
            resizeMode="cover"
            accessibilityLabel="HealthMate"
          />

          <Text style={styles.footerTitle}>Stay Healthy, Stay Happy!</Text>

          <Text style={styles.footerDescription}>
            Consistency is the key to a healthier lifestyle.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 35,
  },

  header: {
    marginBottom: 22,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#163A5F',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 6,
  },

  welcomeCard: {
    backgroundColor: '#163A5F',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  welcomeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  welcomeDescription: {
    fontSize: 13,
    color: '#E1EAF3',
    lineHeight: 20,
  },

  welcomeImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },

  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#172B4D',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 5,
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 13,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    elevation: 2,
    shadowColor: '#163A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryIcon: {
    fontSize: 25,
  },

  categoryInfo: {
    flex: 1,
    marginLeft: 13,
  },

  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#172B4D',
  },

  categorySubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 5,
  },

  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    fontSize: 22,
    color: '#20B8A5',
    fontWeight: 'bold',
  },

  tipsContainer: {
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EEF5',
    marginBottom: 12,
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  tipBullet: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#E6F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },

  checkMark: {
    color: '#20B8A5',
    fontSize: 12,
    fontWeight: 'bold',
  },

  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },

  footerCard: {
    backgroundColor: '#E6F7F5',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },

  footerLogo: {
    width: 160,
    height: 32,
    marginBottom: 8,
  },

  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#163A5F',
  },

  footerDescription: {
    fontSize: 12,
    color: '#718096',
    marginTop: 6,
    textAlign: 'center',
  },
});