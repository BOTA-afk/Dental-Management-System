import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Dentist {
  _id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

interface Prescription {
  _id: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  dentist?: Dentist;
  createdAt: string;
}

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const fetchPrescriptions = async (showLoadingIndicator = true) => {
    if (!token) return;
    try {
      if (showLoadingIndicator) setLoading(true);
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/patient/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions(true);
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrescriptions(false);
    setRefreshing(false);
  };

  const getStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'Active':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'Completed':
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
      default:
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filter === 'ACTIVE') return p.status === 'Active';
    if (filter === 'COMPLETED') return p.status === 'Completed';
    return true;
  });

  const activeCount = prescriptions.filter((p) => p.status === 'Active').length;
  const completedCount = prescriptions.filter((p) => p.status === 'Completed').length;

  const renderPrescriptionCard = ({ item }: { item: Prescription }) => {
    const statusStyle = getStatusColor(item.status);
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.diagnosisTitle}>{item.diagnosis}</Text>
            <Text style={styles.prescribedDate}>Prescribed {formattedDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Doctor Info */}
        {item.dentist && (
          <View style={styles.dentistRow}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${item.dentist.fullName}&background=059669&color=fff` }}
              style={styles.dentistAvatar}
            />
            <View>
              <Text style={styles.dentistName}>Dr. {item.dentist.fullName}</Text>
              <Text style={styles.dentistRole}>Prescribing Dentist • ✉️ Emailed</Text>
            </View>
          </View>
        )}

        {/* Medications List */}
        <View style={styles.medicationsSection}>
          <Text style={styles.sectionHeading}>Medications ({item.medications.length})</Text>
          {item.medications.map((med, idx) => (
            <View key={idx} style={styles.medItem}>
              <View style={styles.medHeaderRow}>
                <View style={styles.medIconBox}>
                  <Ionicons name="medkit" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{med.duration}</Text>
                </View>
              </View>

              <View style={styles.medDetailsRow}>
                <Ionicons name="time-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.medFrequencyText}>{med.frequency}</Text>
              </View>

              {med.instructions ? (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsText}>💡 {med.instructions}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Clinical Advice / Doctor Notes */}
        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Doctor Advice & Precautions:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions & Medications</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredPrescriptions}
        keyExtractor={(item) => item._id}
        renderItem={renderPrescriptionCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
        ListHeaderComponent={
          <>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { borderLeftColor: '#059669', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Active Courses</Text>
                <Text style={[styles.statValue, { color: '#059669' }]}>{activeCount}</Text>
              </View>
              <View style={[styles.statBox, { borderLeftColor: '#64748B', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Past / Completed</Text>
                <Text style={[styles.statValue, { color: '#475569' }]}>{completedCount}</Text>
              </View>
              <View style={[styles.statBox, { borderLeftColor: '#2563EB', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Total Prescriptions</Text>
                <Text style={[styles.statValue, { color: '#0F172A' }]}>{prescriptions.length}</Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setFilter(tab)}
                  style={[styles.filterButton, filter === tab && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterButtonText, filter === tab && styles.filterButtonTextActive]}>
                    {tab === 'ALL' ? 'All Prescriptions' : tab === 'ACTIVE' ? 'Active' : 'Completed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="medkit-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
              <Text style={styles.emptySubtitle}>
                You do not have any active or past prescriptions on file. Any medications prescribed by your dentist will automatically show up here.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    height: 56,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  prescribedDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dentistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
  },
  dentistAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  dentistName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  dentistRole: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  medicationsSection: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  medItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  medHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  medDosage: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  durationBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  medDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  medFrequencyText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  instructionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
  },
  instructionsText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 17,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 20,
  },
});
