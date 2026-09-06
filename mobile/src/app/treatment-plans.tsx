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

interface Dentist {
  _id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

interface TreatmentPlan {
  _id: string;
  title: string;
  diagnosis?: string;
  treatmentPlan: string;
  treatmentDone?: string;
  status: 'Proposed' | 'In Progress' | 'Completed' | 'Suspended';
  estimatedCost?: number;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  notes?: string;
  dentist?: Dentist;
  createdAt: string;
}

export default function TreatmentPlansScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const fetchTreatmentPlans = async (showLoadingIndicator = true) => {
    if (!token) return;
    try {
      if (showLoadingIndicator) setLoading(true);
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/patient/treatment-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatmentPlans(true);
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTreatmentPlans(false);
    setRefreshing(false);
  };

  const getStatusColor = (status: TreatmentPlan['status']) => {
    switch (status) {
      case 'Completed':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'In Progress':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'Suspended':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      default: // Proposed
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
    }
  };

  const filteredPlans = plans.filter(p => {
    if (filter === 'ACTIVE') return p.status === 'In Progress' || p.status === 'Proposed';
    if (filter === 'COMPLETED') return p.status === 'Completed';
    return true;
  });

  const activeCount = plans.filter(p => p.status === 'In Progress' || p.status === 'Proposed').length;
  const completedCount = plans.filter(p => p.status === 'Completed').length;

  const renderPlanCard = ({ item }: { item: TreatmentPlan }) => {
    const statusStyle = getStatusColor(item.status);
    const formattedCreated = new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.planTitle}>{item.title}</Text>
            <Text style={styles.planDate}>Created {formattedCreated}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Doctor Assigned */}
        {item.dentist && (
          <View style={styles.dentistRow}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${item.dentist.fullName}&background=0ea5e9&color=fff` }}
              style={styles.dentistAvatar}
            />
            <View>
              <Text style={styles.dentistName}>Dr. {item.dentist.fullName}</Text>
              <Text style={styles.dentistRole}>Attending Dentist</Text>
            </View>
          </View>
        )}

        {/* Diagnosis */}
        {item.diagnosis && (
          <View style={styles.diagnosisBox}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="medical-outline" size={14} color="#0D9488" />
              <Text style={styles.diagnosisTitle}>Clinical Diagnosis</Text>
            </View>
            <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
          </View>
        )}

        {/* Treatment Plan Steps */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="list-outline" size={14} color="#3B82F6" />
            <Text style={styles.sectionHeading}>Planned Procedures & Steps</Text>
          </View>
          <Text style={styles.bodyText}>{item.treatmentPlan}</Text>
        </View>

        {/* Treatment Done */}
        {item.treatmentDone ? (
          <View style={styles.doneSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" />
              <Text style={[styles.sectionHeading, { color: '#15803D' }]}>Procedures Completed</Text>
            </View>
            <Text style={styles.doneText}>{item.treatmentDone}</Text>
          </View>
        ) : null}

        {/* Meta details footer */}
        <View style={styles.cardFooter}>
          {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Est. Cost</Text>
              <Text style={styles.metaValueHighlight}>Rs. {item.estimatedCost.toLocaleString()}</Text>
            </View>
          )}

          {item.startDate && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Start Date</Text>
              <Text style={styles.metaValue}>
                {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}

          {item.targetDate && item.status !== 'Completed' && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Target Date</Text>
              <Text style={styles.metaValue}>
                {new Date(item.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}

          {item.completedDate && item.status === 'Completed' && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Completed On</Text>
              <Text style={[styles.metaValue, { color: '#15803D' }]}>
                {new Date(item.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Clinical Notes */}
        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Doctor Notes:</Text>
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
        <Text style={styles.headerTitle}>Treatment Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item._id}
        renderItem={renderPlanCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        ListHeaderComponent={
          <>
            {/* Summary Cards */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { borderLeftColor: '#2563EB', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Active Plans</Text>
                <Text style={[styles.statValue, { color: '#2563EB' }]}>{activeCount}</Text>
              </View>
              <View style={[styles.statBox, { borderLeftColor: '#16A34A', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={[styles.statValue, { color: '#16A34A' }]}>{completedCount}</Text>
              </View>
              <View style={[styles.statBox, { borderLeftColor: '#64748B', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>Total Plans</Text>
                <Text style={[styles.statValue, { color: '#0F172A' }]}>{plans.length}</Text>
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
                    {tab === 'ALL' ? 'All Plans' : tab === 'ACTIVE' ? 'Active' : 'Completed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Treatment Plans Found</Text>
              <Text style={styles.emptySubtitle}>
                Your doctor hasn't created any treatment plans yet. Once your dentist prescribes a course of clinical procedures, they will show up here.
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
    color: '#2563EB',
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
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  planDate: {
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
    marginBottom: 12,
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
  diagnosisBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  diagnosisTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  diagnosisText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#134E4A',
    lineHeight: 18,
  },
  detailSection: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginTop: 4,
    fontWeight: '500',
  },
  doneSection: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  doneText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 8,
  },
  metaItem: {
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  metaValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
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
    fontStyle: 'italic',
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
