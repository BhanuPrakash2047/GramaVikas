import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchUnreadNotifications } from '../../store/slices/notificationSlice';
import { fetchDiagnosticHistory } from '../../store/slices/diagnosticSlice';
import { browseSchemes } from '../../store/slices/schemeSlice';
import { COLORS, SCREENS } from '../../constants';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Helpers ─────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getGreetingEmoji = () => {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '🌤️';
  return '🌙';
};

const getCurrentSeason = () => {
  const m = new Date().getMonth(); // 0-indexed
  if (m >= 5 && m <= 9) return 'kharif'; // Jun-Oct
  if (m >= 10 || m <= 2) return 'rabi';   // Nov-Mar
  return 'summer'; // Mar-May (overlap handled by priority)
};

const SEASON_INFO = {
  kharif: {
    label: 'Kharif Season',
    icon: 'rainy',
    period: 'June – October',
    tip: 'Southwest monsoon active — prime sowing window for paddy & groundnut.',
    accent: '#4FC3F7',
  },
  rabi: {
    label: 'Rabi Season',
    icon: 'partly-sunny',
    period: 'November – March',
    tip: 'Cooler temperatures — ideal for pulses, vegetables & second paddy crop.',
    accent: '#FFB74D',
  },
  summer: {
    label: 'Summer Season',
    icon: 'sunny',
    period: 'March – June',
    tip: 'Water-stress period — irrigated vegetables & watermelon only.',
    accent: '#FF8A65',
  },
};

// ─── Quick Action Items ──────────────────────────────────────────

const QUICK_ACTIONS = [
  { key: 'scan', icon: 'scan', label: 'Scan Crop', subtitle: 'AI Diagnosis', color: '#2D6A4F', bg: '#E8F5E9', tab: SCREENS.DIAGNOSTICS },
  { key: 'sos', icon: 'mic', label: 'Voice SOS', subtitle: 'Emergency', color: '#E53935', bg: '#FFEBEE', action: 'sos' },
  { key: 'schemes', icon: 'gift', label: 'Schemes', subtitle: 'Govt. Aid', color: '#F57C00', bg: '#FFF3E0', tab: SCREENS.SCHEMES },
  { key: 'profile', icon: 'person', label: 'My Profile', subtitle: 'Settings', color: '#1565C0', bg: '#E3F2FD', tab: SCREENS.PROFILE },
];

// ─── Section Header Component ────────────────────────────────────

const SectionHeader = ({ icon, title, actionText, onAction }) => (
  <View style={styles.sectionRow}>
    <View style={styles.sectionLeft}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {actionText && (
      <TouchableOpacity onPress={onAction} style={styles.sectionAction} activeOpacity={0.7}>
        <Text style={styles.sectionActionText}>{actionText}</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Component ──────────────────────────────────────────────

const HomeScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.auth);
  const { unreadNotifications, unreadLoading } = useAppSelector((s) => s.notification);
  const { history, historyLoading } = useAppSelector((s) => s.diagnostic);
  const { schemes, schemesLoading } = useAppSelector((s) => s.schemes);

  const farmerId = profile?.id;

  // ── Data fetching ──
  const loadData = useCallback(() => {
    if (!farmerId) return;
    dispatch(fetchUnreadNotifications(farmerId));
    dispatch(fetchDiagnosticHistory(farmerId));
    dispatch(browseSchemes({ category: 'POST_DISASTER' }));
  }, [dispatch, farmerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1200);
  }, [loadData]);

  // ── Derived values ──
  const season = useMemo(() => getCurrentSeason(), []);
  const seasonData = SEASON_INFO[season];
  const recentDiagnoses = useMemo(() => (history || []).slice(0, 3), [history]);
  const postDisasterSchemes = useMemo(() => (schemes || []).slice(0, 5), [schemes]);
  const unreadCount = (unreadNotifications || []).length;

  // ── Navigation helpers ──
  const navigateTab = (tabName) => {
    navigation.getParent()?.navigate(tabName);
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ═══════════════════════════════════════════════════════════════
          1.  HERO GREETING CARD
          ═══════════════════════════════════════════════════════════ */}
      <View style={styles.heroCard}>
        {/* Decorative blobs */}
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />
        <View style={styles.heroBlob3} />

        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>
              {getGreeting()} {getGreetingEmoji()}
            </Text>
            <Text style={styles.heroName}>{profile?.fullName || 'Farmer'}</Text>
          </View>
          {/* Season icon badge */}
          <View style={styles.heroSeasonBadge}>
            <Ionicons name={seasonData.icon} size={26} color="#fff" />
          </View>
        </View>

        {/* Location pill */}
        {profile?.mandalName && (
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={13} color={COLORS.primaryLighter} />
            <Text style={styles.locationPillText}>
              {profile.mandalName}, {profile.districtName || 'Srikakulam'}
            </Text>
          </View>
        )}

        {/* Season info strip */}
        <View style={styles.seasonStrip}>
          <View style={[styles.seasonAccent, { backgroundColor: seasonData.accent }]} />
          <View style={styles.seasonStripContent}>
            <View style={styles.seasonLabelRow}>
              <Text style={styles.seasonLabel}>{seasonData.label}</Text>
              <Text style={styles.seasonPeriod}>{seasonData.period}</Text>
            </View>
            <Text style={styles.seasonTip}>{seasonData.tip}</Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          2.  UNREAD NOTIFICATIONS BANNER
          ═══════════════════════════════════════════════════════════ */}
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.notifBanner}
          activeOpacity={0.85}
          onPress={() => navigation.getParent()?.navigate(SCREENS.PROFILE, { screen: SCREENS.NOTIFICATION })}
        >
          <View style={styles.notifGlow} />
          <View style={styles.notifIconCircle}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.notifTitle}>
              {unreadCount} New Alert{unreadCount > 1 ? 's' : ''}
            </Text>
            <Text style={styles.notifSubtitle}>Scheme updates & emergency notices</Text>
          </View>
          <View style={styles.notifArrow}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          3.  QUICK ACTIONS GRID
          ═══════════════════════════════════════════════════════════ */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.quickCard}
            activeOpacity={0.75}
            onPress={() => {
              if (item.tab) navigateTab(item.tab);
              if (item.action === 'sos') navigateTab(SCREENS.EMERGENCY);
            }}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.quickSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.disabled} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          4.  ACTIVE POST-DISASTER SCHEMES
          ═══════════════════════════════════════════════════════════ */}
      <SectionHeader
        title="Post-Disaster Schemes"
        actionText={postDisasterSchemes.length > 0 ? 'See All' : undefined}
        onAction={() => navigateTab(SCREENS.SCHEMES)}
      />
      {schemesLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : postDisasterSchemes.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptyText}>No active post-disaster schemes right now.</Text>
        </View>
      ) : (
        <FlatList
          data={postDisasterSchemes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingRight: 8, paddingBottom: 4 }}
          renderItem={({ item, index }) => {
            const cardColors = ['#FF6B35', '#1565C0', '#2E7D32', '#6A1B9A', '#C62828'];
            const accent = cardColors[index % cardColors.length];
            return (
              <TouchableOpacity
                style={styles.schemeCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('SchemeDetail', { schemeId: item.id })}
              >
                {/* Top accent bar */}
                <View style={[styles.schemeAccentBar, { backgroundColor: accent }]} />
                <View style={styles.schemeBody}>
                  <View style={styles.schemeHeader}>
                    <View style={[styles.schemeCategoryPill, { backgroundColor: accent + '18' }]}>
                      <Ionicons name="alert-circle" size={12} color={accent} />
                      <Text style={[styles.schemeCategory, { color: accent }]} numberOfLines={1}>
                        {item.category || 'POST_DISASTER'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.schemeName} numberOfLines={2}>
                    {item.schemeName || item.name}
                  </Text>
                  <Text style={styles.schemeDesc} numberOfLines={2}>
                    {item.description || ''}
                  </Text>
                  <View style={styles.schemeFooter}>
                    <Text style={[styles.schemeLink, { color: accent }]}>View Details</Text>
                    <Ionicons name="arrow-forward-circle" size={18} color={accent} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          5.  RECENT DIAGNOSIS HISTORY
          ═══════════════════════════════════════════════════════════ */}
      <SectionHeader
        title="Recent Diagnoses"
        actionText={recentDiagnoses.length > 0 ? 'View All' : undefined}
        onAction={() => navigateTab(SCREENS.DIAGNOSTICS)}
      />
      {historyLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : recentDiagnoses.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={[styles.emptyIconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="leaf" size={28} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>No Scans Yet</Text>
          <Text style={styles.emptyText}>Scan a crop to get AI-powered diagnosis!</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            activeOpacity={0.8}
            onPress={() => navigateTab(SCREENS.DIAGNOSTICS)}
          >
            <Ionicons name="scan" size={16} color="#fff" />
            <Text style={styles.emptyBtnText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentDiagnoses.map((d, idx) => (
          <View key={d.id || idx} style={styles.diagCard}>
            {/* Left accent */}
            <View style={styles.diagAccent} />
            <View style={styles.diagIconWrap}>
              <Ionicons name="medkit" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.diagQuery} numberOfLines={1}>
                {d.userQuery || d.query || 'Crop Diagnosis'}
              </Text>
              <View style={styles.diagMeta}>
                <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
                <Text style={styles.diagDate}>
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : ''}
                </Text>
              </View>
              {d.classification && (
                <View style={styles.diagClassPill}>
                  <Text style={styles.diagClassification} numberOfLines={1}>
                    {d.classification}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.diagArrow}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </View>
        ))
      )}

      {/* ── Bottom padding ── */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F2',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
  },

  /* ═══════════════════════════════════════════════════════════════
     HERO GREETING CARD
     ═══════════════════════════════════════════════════════════ */
  heroCard: {
    backgroundColor: '#1B4332',
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
    // Elevated shadow
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBlob1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(82,183,136,0.2)',
  },
  heroBlob2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(45,106,79,0.4)',
  },
  heroBlob3: {
    position: 'absolute',
    top: 30,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(183,228,199,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  heroGreeting: {
    color: 'rgba(183,228,199,0.85)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  heroSeasonBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(82,183,136,0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(183,228,199,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  locationPillText: {
    color: 'rgba(183,228,199,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  seasonStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  seasonAccent: {
    width: 4,
  },
  seasonStripContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 14,
  },
  seasonLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  seasonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  seasonPeriod: {
    color: 'rgba(183,228,199,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  seasonTip: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
  },

  /* ═══════════════════════════════════════════════════════════════
     NOTIFICATIONS BANNER
     ═══════════════════════════════════════════════════════════ */
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    // Shadow
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  notifGlow: {
    position: 'absolute',
    left: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(21,101,192,0.06)',
  },
  notifIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  notifTitle: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '700',
  },
  notifSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  notifArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ═══════════════════════════════════════════════════════════════
     SECTION HEADER
     ═══════════════════════════════════════════════════════════ */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 6,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 2,
  },

  /* ═══════════════════════════════════════════════════════════════
     QUICK ACTIONS GRID  (list layout)
     ═══════════════════════════════════════════════════════════ */
  quickGrid: {
    marginBottom: 22,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  quickSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },

  /* ═══════════════════════════════════════════════════════════════
     SCHEME CARDS (horizontal)
     ═══════════════════════════════════════════════════════════ */
  schemeCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginRight: 14,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  schemeAccentBar: {
    height: 4,
    width: '100%',
  },
  schemeBody: {
    padding: 16,
  },
  schemeHeader: {
    marginBottom: 8,
  },
  schemeCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  schemeCategory: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  schemeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 20,
  },
  schemeDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  schemeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  schemeLink: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* ═══════════════════════════════════════════════════════════════
     DIAGNOSIS HISTORY CARDS
     ═══════════════════════════════════════════════════════════ */
  diagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingLeft: 0,
    marginBottom: 10,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  diagAccent: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  diagIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagQuery: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  diagMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  diagDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  diagClassPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  diagClassification: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  diagArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  /* ═══════════════════════════════════════════════════════════════
     EMPTY STATE
     ═══════════════════════════════════════════════════════════ */
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 22,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default HomeScreen;
