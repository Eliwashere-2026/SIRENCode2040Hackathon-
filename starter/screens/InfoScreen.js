import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Switch } from 'react-native';

const RISK_FACTORS = [
  { id: 'cloudBackup', label: 'Cloud backups enabled', weight: 2 },
  { id: 'publicSocial', label: 'Public social profiles', weight: 2 },
  { id: 'unlockedPhone', label: 'No screen lock or weak PIN', weight: 3 },
  { id: 'sharedDevice', label: 'Shared device with others', weight: 1 },
  { id: 'noEncryption', label: 'Device encryption disabled', weight: 3 },
];

const bestPractices = [
  'Use a strong passcode and enable biometric lock.',
  'Turn off cloud sync for sensitive data.',
  'Review app permissions and revoke unused access.',
  'Disable lock screen previews for messages.',
  'Back up critical files to a secure location.',
  'Know your rights during questioning and searches.',
];

export default function InfoScreen() {
  const [answers, setAnswers] = useState(
    RISK_FACTORS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  const score = useMemo(
    () =>
      RISK_FACTORS.reduce((total, item) => {
        return total + (answers[item.id] ? item.weight : 0);
      }, 0),
    [answers]
  );

  const riskLevel = score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Protect Your Data</Text>
      <Text style={styles.subtitle}>
        Quick guidance to reduce surveillance exposure.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Best Practices</Text>
        {bestPractices.map((item) => (
          <Text key={item} style={styles.listItem}>
            - {item}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Risk Profile</Text>
        <Text style={styles.sectionNote}>
          Toggle anything that applies to your current device setup.
        </Text>
        {RISK_FACTORS.map((item) => (
          <View key={item.id} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{item.label}</Text>
            <Switch
              value={answers[item.id]}
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [item.id]: value }))
              }
              trackColor={{ false: '#1f2937', true: '#38bdf8' }}
              thumbColor={answers[item.id] ? '#f8fafc' : '#94a3b8'}
            />
          </View>
        ))}
        <View style={styles.riskBox}>
          <Text style={styles.riskLabel}>Risk Level</Text>
          <Text style={styles.riskValue}>{riskLevel}</Text>
          <Text style={styles.sectionNote}>Score: {score}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    color: '#f8fafc',
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5f5',
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionNote: {
    color: '#94a3b8',
    fontSize: 12,
  },
  listItem: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabel: {
    color: '#e2e8f0',
    flex: 1,
    paddingRight: 12,
  },
  riskBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0b1220',
  },
  riskLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  riskValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
});
