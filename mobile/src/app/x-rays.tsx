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
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Dentist {
  _id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

interface XRayRecord {
  _id: string;
  title: string;
  category: 'Panoramic' | 'Bitewing' | 'Periapical' | 'Cephalometric' | 'CBCT 3D' | 'Other';
  imageUrl: string;
  date: string;
  dentist?: Dentist;
  findings?: string;
  notes?: string;
  createdAt: string;
}

const CATEGORIES = ['ALL', 'Panoramic', 'Bitewing', 'Periapical', 'Cephalometric', 'CBCT 3D'] as const;

export default function XRaysScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [xrays, setXrays] = useState<XRayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedImage, setSelectedImage] = useState<XRayRecord | null>(null);

  const fetchXRays = async (showLoadingIndicator = true) => {
    if (!token) return;
    try {
      if (showLoadingIndicator) setLoading(true);
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/patient/xrays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setXrays(data);
      }
    } catch (error) {
      console.error('Error fetching X-rays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXRays(true);
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchXRays(false);
    setRefreshing(false);
  };

  const filteredXrays = xrays.filter((x) => {
    if (selectedCategory === 'ALL') return true;
    return x.category === selectedCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Panoramic':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Bitewing':
        return { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' };
      case 'Periapical':
        return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
      case 'CBCT 3D':
        return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const renderXRayCard = ({ item }: { item: XRayRecord }) => {
    const catStyle = getCategoryColor(item.category);
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={styles.card}>
        {/* Radiograph Image with dark viewer frame */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedImage(item)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.xrayImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlayBadge}>
            <Ionicons name="scan-outline" size={14} color="#FFFFFF" />
            <Text style={styles.imageOverlayText}>Inspect Full Scan</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.cardContent}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.xrayTitle}>{item.title}</Text>
              <Text style={styles.xrayDate}>Captured {formattedDate}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
              <Text style={[styles.categoryText, { color: catStyle.text }]}>{item.category}</Text>
            </View>
          </View>

          {/* Doctor Info */}
          {item.dentist && (
            <View style={styles.dentistRow}>
              <Ionicons name="medkit-outline" size={14} color="#64748B" />
              <Text style={styles.dentistText}>Reviewed by Dr. {item.dentist.fullName}</Text>
            </View>
          )}

          {/* Diagnostic Findings */}
          {item.findings ? (
            <View style={styles.findingsBox}>
              <View style={styles.findingsHeader}>
                <Ionicons name="eye-outline" size={14} color="#4338CA" />
                <Text style={styles.findingsTitle}>Radiological Findings</Text>
              </View>
              <Text style={styles.findingsText}>{item.findings}</Text>
            </View>
          ) : null}

          {/* Clinical Notes */}
          {item.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Doctor Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          ) : null}

          {/* View Full Button */}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => setSelectedImage(item)}
          >
            <Ionicons name="expand-outline" size={16} color="#2563EB" />
            <Text style={styles.viewButtonText}>View High-Resolution Image</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>X-Rays & Imaging</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredXrays}
        keyExtractor={(item) => item._id}
        renderItem={renderXRayCard}
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
            {/* Category horizontal scroll tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.catTab,
                    selectedCategory === cat && styles.catTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catTabText,
                      selectedCategory === cat && styles.catTabTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.banner}>
              <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.bannerText}>
                High-definition digital radiographs archived securely for your clinical history.
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="film-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No X-Rays Found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory === 'ALL'
                  ? "Your dentist hasn't uploaded any radiographic images to your profile yet."
                  : `No ${selectedCategory} records found.`}
              </Text>
            </View>
          )
        }
      />

      {/* High-Resolution Full-Screen Radiograph Lightbox Modal */}
      <Modal
        visible={!!selectedImage}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          {/* Lightbox Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedImage?.title}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedImage?.category} • {selectedImage?.date ? new Date(selectedImage.date).toLocaleDateString() : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Image Display */}
          <View style={styles.modalImageContainer}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.imageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Findings drawer at bottom */}
          {selectedImage && (
            <View style={styles.modalBottomBar}>
              <View style={styles.modalFindingsHeader}>
                <Ionicons name="analytics-outline" size={16} color="#60A5FA" />
                <Text style={styles.modalFindingsTitle}>Doctor Findings & Assessment</Text>
              </View>
              <Text style={styles.modalFindingsContent}>
                {selectedImage.findings || 'No specific pathological anomalies reported.'}
              </Text>
              {selectedImage.dentist && (
                <Text style={styles.modalDentistInfo}>
                  Radiologist / Attending: Dr. {selectedImage.dentist.fullName}
                </Text>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  categoryScroll: {
    paddingBottom: 12,
    gap: 8,
  },
  catTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  catTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  xrayImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  xrayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  xrayDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dentistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dentistText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  findingsBox: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  findingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  findingsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  findingsText: {
    fontSize: 13,
    color: '#312E81',
    lineHeight: 18,
    fontWeight: '500',
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
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
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginTop: 4,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  modalCloseButton: {
    padding: 6,
    backgroundColor: '#334155',
    borderRadius: 20,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalImage: {
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT * 0.55,
  },
  modalBottomBar: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalFindingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  modalFindingsTitle: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalFindingsContent: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  modalDentistInfo: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
