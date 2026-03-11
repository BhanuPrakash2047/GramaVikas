import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Dimensions,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUserProfile, updateFarmerLanguage } from '../../store/slices/authSlice';
import {
  browseSchemes,
  checkEligibility,
  clearEligibilityResult,
  clearSchemeErrors,
} from '../../store/slices/schemeSlice';
import { COLORS } from '../../constants';
import { LANGUAGES, LANGUAGE_MAP } from '../../constants/locationData';

const { width: SCREEN_W } = Dimensions.get('window');

// ═════════════════════════════════════════════════════════════════
//   REUSABLE COMPONENTS
// ═════════════════════════════════════════════════════════════════

const Card = ({ children, style }) => (
  <View style={[s.card, style]}>
    {children}
  </View>
);

const TabSelector = ({ tabs, active, onSelect }) => (
  <View style={s.tabBar}>
    {tabs.map((tab) => {
      const isActive = active === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.8}
          style={[s.tabItem, isActive && s.tabItemActive]}
        >
          <Ionicons
            name={tab.icon}
            size={17}
            color={isActive ? '#fff' : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const Chip = ({ label, color, bg, icon }) => (
  <View style={[s.chip, { backgroundColor: bg || COLORS.selectedBg }]}>
    {icon && <Ionicons name={icon} size={11} color={color || COLORS.primary} style={{ marginRight: 4 }} />}
    <Text style={[s.chipText, { color: color || COLORS.primary }]}>
      {label}
    </Text>
  </View>
);

// ═════════════════════════════════════════════════════════════════
//   CATEGORY HELPERS
// ═════════════════════════════════════════════════════════════════

const CATEGORY_META = {
  AGRICULTURE: { icon: 'leaf', color: '#2D6A4F', bg: '#E8F5E9', label: 'Agriculture' },
  INSURANCE: { icon: 'shield-checkmark', color: '#1565C0', bg: '#E3F2FD', label: 'Insurance' },
  HOUSING: { icon: 'home', color: '#E65100', bg: '#FFF3E0', label: 'Housing' },
  HEALTH: { icon: 'medkit', color: '#C62828', bg: '#FFEBEE', label: 'Health' },
  EDUCATION: { icon: 'school', color: '#7B1FA2', bg: '#F3E5F5', label: 'Education' },
  LIVESTOCK: { icon: 'paw', color: '#FF8F00', bg: '#FFF8E1', label: 'Livestock' },
};

const getCategoryMeta = (cat) =>
  CATEGORY_META[cat] || { icon: 'apps', color: COLORS.primary, bg: COLORS.selectedBg, label: cat || 'General' };

// ═════════════════════════════════════════════════════════════════
//   SCHEME CARD
// ═════════════════════════════════════════════════════════════════

const SchemeCard = ({ scheme, onPress, recommended }) => {
  const catMeta = getCategoryMeta(scheme.category);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={[s.schemeCard, recommended && s.schemeCardRecommended]}>
        {/* Color accent strip */}
        <View style={[s.schemeAccentStrip, { backgroundColor: catMeta.color }]} />

        <View style={s.schemeInner}>
          {/* Header */}
          <View style={s.schemeHeaderRow}>
            <View style={[s.schemeIconBox, { backgroundColor: catMeta.bg }]}>
              <Ionicons name={catMeta.icon} size={20} color={catMeta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.schemeName} numberOfLines={2}>
                {scheme.schemeName}
              </Text>
              <Text style={s.schemeCode}>{scheme.schemeCode}</Text>
            </View>
            <View style={s.schemeArrow}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </View>

          {/* Benefit */}
          {scheme.benefitSummary ? (
            <Text style={s.schemeBenefit} numberOfLines={2}>
              {scheme.benefitSummary}
            </Text>
          ) : null}

          {/* Badges */}
          <View style={s.schemeBadgeRow}>
            <Chip label={catMeta.label} bg={catMeta.bg} color={catMeta.color} icon={catMeta.icon} />
            <Chip
              label={scheme.state || 'Central'}
              bg={scheme.state ? '#FFF3E0' : '#E3F2FD'}
              color={scheme.state ? '#E65100' : '#1565C0'}
              icon={scheme.state ? 'location' : 'globe'}
            />
            {recommended && (
              <Chip label="Recommended" bg="#E8F5E9" color={COLORS.primary} icon="star" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ═════════════════════════════════════════════════════════════════
//   EMPTY STATE
// ═════════════════════════════════════════════════════════════════

const EmptyState = ({ icon, title, subtitle }) => (
  <View style={s.emptyWrap}>
    <View style={s.emptyCircle}>
      <MaterialCommunityIcons name={icon} size={40} color={COLORS.primaryLight} />
    </View>
    <Text style={s.emptyTitle}>{title}</Text>
    {subtitle ? <Text style={s.emptySubtitle}>{subtitle}</Text> : null}
  </View>
);

// ═════════════════════════════════════════════════════════════════
//   FILTER CHIPS ROW
// ═════════════════════════════════════════════════════════════════

const CATEGORIES = ['ALL', 'AGRICULTURE', 'INSURANCE', 'HOUSING', 'HEALTH', 'EDUCATION'];

const FilterChips = ({ active, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginBottom: 16 }}
    contentContainerStyle={{ paddingRight: 16 }}
  >
    {CATEGORIES.map((cat) => {
      const isActive = active === cat;
      const meta = cat === 'ALL'
        ? { label: 'All', color: COLORS.primary, bg: COLORS.selectedBg, icon: 'apps' }
        : getCategoryMeta(cat);
      return (
        <TouchableOpacity
          key={cat}
          onPress={() => onSelect(cat)}
          activeOpacity={0.7}
          style={[s.filterChip, isActive && s.filterChipActive]}
        >
          <Ionicons
            name={meta.icon}
            size={14}
            color={isActive ? '#fff' : meta.color}
            style={{ marginRight: 5 }}
          />
          <Text style={[s.filterChipText, isActive && s.filterChipTextActive]}>
            {meta.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// ═════════════════════════════════════════════════════════════════
//   TABS DEFINITION
// ═════════════════════════════════════════════════════════════════

const TABS = [
  { key: 'recommended', label: 'For You', icon: 'star-outline' },
  { key: 'all', label: 'All Schemes', icon: 'grid-outline' },
];

// ═════════════════════════════════════════════════════════════════
//   RECOMMENDED TAB
// ═════════════════════════════════════════════════════════════════

const RecommendedTab = ({ dispatch, profile, navigation, eligibilityResult, eligibilityLoading }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.id) {
      dispatch(clearEligibilityResult());
      dispatch(
        checkEligibility({
          farmerId: profile.id,
          mode: 'DISCOVER',
          additionalFields: {},
        })
      );
    }
  }, [profile?.id]);

  const onRefresh = useCallback(() => {
    if (profile?.id) {
      setRefreshing(true);
      dispatch(
        checkEligibility({
          farmerId: profile.id,
          mode: 'DISCOVER',
          additionalFields: {},
        })
      ).finally(() => setRefreshing(false));
    }
  }, [profile?.id]);

  const eligibleSchemes = eligibilityResult?.eligibleSchemes || [];
  const almostEligibleSchemes = eligibilityResult?.almostEligibleSchemes || [];

  const filteredEligible = useMemo(() => {
    if (!searchQuery.trim()) return eligibleSchemes;
    const q = searchQuery.toLowerCase();
    return eligibleSchemes.filter(
      (s) =>
        s.schemeName?.toLowerCase().includes(q) ||
        s.schemeCode?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }, [eligibleSchemes, searchQuery]);

  const filteredAlmost = useMemo(() => {
    if (!searchQuery.trim()) return almostEligibleSchemes;
    const q = searchQuery.toLowerCase();
    return almostEligibleSchemes.filter(
      (s) =>
        s.schemeName?.toLowerCase().includes(q) ||
        s.schemeCode?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }, [almostEligibleSchemes, searchQuery]);

  if (!profile?.id) {
    return (
      <EmptyState
        icon="account-alert-outline"
        title="Login to see recommendations"
        subtitle="Personalized scheme suggestions based on your profile"
      />
    );
  }

  if (eligibilityLoading && !refreshing) {
    return (
      <View style={s.loadingWrap}>
        <View style={s.loadingSpinnerBg}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <Text style={s.loadingText}>Finding schemes for you...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Search Bar */}
      <View style={s.searchBar}>
        <View style={s.searchIconWrap}>
          <Ionicons name="search" size={18} color={COLORS.primary} />
        </View>
        <TextInput
          style={s.searchInput}
          placeholder="Search recommended schemes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={s.searchClear}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Summary Card */}
      {eligibilityResult && (
        <View style={s.summaryCard}>
          <View style={s.summaryBlob} />
          <View style={s.summaryIconBox}>
            <Ionicons name="sparkles" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.summaryTitle}>
              {eligibleSchemes.length} Scheme{eligibleSchemes.length !== 1 ? 's' : ''} Match
            </Text>
            <Text style={s.summarySubtitle}>
              {almostEligibleSchemes.length > 0
                ? `+ ${almostEligibleSchemes.length} almost eligible`
                : 'Based on your saved information'}
            </Text>
          </View>
          <View style={s.summaryCountBadge}>
            <Text style={s.summaryCountText}>{eligibleSchemes.length}</Text>
          </View>
        </View>
      )}

      {/* Eligible Schemes */}
      {filteredEligible.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: COLORS.success }]} />
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={s.sectionHeaderText}>Recommended Schemes</Text>
          </View>
          {filteredEligible.map((scheme) => (
            <SchemeCard
              key={scheme.schemeId}
              scheme={{
                ...scheme,
                id: scheme.schemeId,
                schemeName: scheme.schemeName,
                schemeCode: scheme.schemeCode,
                benefitSummary: scheme.benefitSummary || scheme.reasonMessage,
              }}
              recommended
              onPress={() =>
                navigation.navigate('SchemeDetail', { schemeId: scheme.schemeId })
              }
            />
          ))}
        </>
      )}

      {/* Almost Eligible Schemes */}
      {filteredAlmost.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: COLORS.warning }]} />
            <Ionicons name="information-circle" size={16} color={COLORS.warning} />
            <Text style={s.sectionHeaderText}>Almost Eligible</Text>
          </View>
          {filteredAlmost.map((scheme) => (
            <TouchableOpacity
              key={scheme.schemeId}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('SchemeDetail', { schemeId: scheme.schemeId })
              }
            >
              <View style={s.almostCard}>
                <View style={[s.schemeAccentStrip, { backgroundColor: COLORS.warning }]} />
                <View style={s.schemeInner}>
                  <View style={s.schemeHeaderRow}>
                    <View style={[s.schemeIconBox, { backgroundColor: '#FFF3E0' }]}>
                      <Ionicons name="trending-up" size={20} color={COLORS.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.schemeName} numberOfLines={2}>
                        {scheme.schemeName}
                      </Text>
                      <Text style={s.schemeCode}>{scheme.schemeCode}</Text>
                    </View>
                    <View style={s.schemeArrow}>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </View>
                  </View>
                  {scheme.reasonMessage ? (
                    <View style={s.reasonBox}>
                      <Ionicons name="bulb-outline" size={14} color="#E65100" style={{ marginRight: 6, marginTop: 1 }} />
                      <Text style={s.reasonText}>{scheme.reasonMessage}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* No Results */}
      {filteredEligible.length === 0 && filteredAlmost.length === 0 && eligibilityResult && (
        <EmptyState
          icon="file-search-outline"
          title={searchQuery ? 'No matching schemes' : 'No recommendations yet'}
          subtitle={searchQuery ? 'Try different search terms' : 'Complete your profile to get personalized recommendations'}
        />
      )}
    </ScrollView>
  );
};

// ═════════════════════════════════════════════════════════════════
//   ALL SCHEMES TAB
// ═════════════════════════════════════════════════════════════════

const AllSchemesTab = ({ dispatch, schemes, schemesLoading, schemesError, navigation, langCode }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    dispatch(browseSchemes({ language: langCode }));
  }, [langCode]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(browseSchemes({ language: langCode })).finally(() => setRefreshing(false));
  }, [langCode]);

  const filteredSchemes = useMemo(() => {
    let result = schemes || [];
    if (activeCategory !== 'ALL') {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.schemeName?.toLowerCase().includes(q) ||
          s.schemeCode?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.benefitSummary?.toLowerCase().includes(q) ||
          (s.state || 'central').toLowerCase().includes(q)
      );
    }
    return result;
  }, [schemes, searchQuery, activeCategory]);

  if (schemesLoading && !refreshing && (!schemes || schemes.length === 0)) {
    return (
      <View style={s.loadingWrap}>
        <View style={s.loadingSpinnerBg}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <Text style={s.loadingText}>Loading schemes...</Text>
      </View>
    );
  }

  if (schemesError) {
    return (
      <View style={s.errorWrap}>
        <View style={[s.emptyCircle, { backgroundColor: '#FFEBEE' }]}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
        </View>
        <Text style={[s.emptyTitle, { color: COLORS.error }]}>{schemesError}</Text>
        <TouchableOpacity onPress={onRefresh} style={s.retryBtn}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={s.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Search Bar */}
      <View style={s.searchBar}>
        <View style={s.searchIconWrap}>
          <Ionicons name="search" size={18} color={COLORS.primary} />
        </View>
        <TextInput
          style={s.searchInput}
          placeholder="Search all schemes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={s.searchClear}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filters */}
      <FilterChips active={activeCategory} onSelect={setActiveCategory} />

      {/* Count */}
      <View style={s.countRow}>
        <View style={[s.sectionDot, { backgroundColor: COLORS.primary, height: 14 }]} />
        <Text style={s.countText}>
          {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Scheme List */}
      {filteredSchemes.length > 0 ? (
        filteredSchemes.map((scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            onPress={() =>
              navigation.navigate('SchemeDetail', { schemeId: scheme.id })
            }
          />
        ))
      ) : (
        <EmptyState
          icon="file-search-outline"
          title="No schemes found"
          subtitle={searchQuery || activeCategory !== 'ALL' ? 'Try different filters' : 'No schemes available'}
        />
      )}
    </ScrollView>
  );
};

// ═════════════════════════════════════════════════════════════════
//   LANGUAGE HELPERS
// ═════════════════════════════════════════════════════════════════

// Backend enum → frontend code (ENGLISH → EN, TELUGU → TE, HINDI → HI)
const REVERSE_LANG_MAP = Object.fromEntries(
  Object.entries(LANGUAGE_MAP).map(([k, v]) => [v, k])
);

const getLanguageCode = (backendEnum) => REVERSE_LANG_MAP[backendEnum] || 'EN';
const getLanguageInfo = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

// ═════════════════════════════════════════════════════════════════
//   LANGUAGE PICKER MODAL
// ═════════════════════════════════════════════════════════════════

const LanguagePickerModal = ({ visible, onClose, currentCode, onSelect, loading }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity activeOpacity={1} onPress={onClose} style={s.modalOverlay}>
      <View style={s.modalContent}>
        {/* Decorative top bar */}
        <View style={s.modalAccent} />

        <View style={s.modalIconCircle}>
          <Ionicons name="language" size={24} color={COLORS.primary} />
        </View>
        <Text style={s.modalTitle}>Choose Language</Text>
        <Text style={s.modalSubtitle}>Content will be shown in selected language</Text>

        {LANGUAGES.map((lang) => {
          const isActive = currentCode === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.7}
              disabled={loading}
              onPress={() => onSelect(lang.code)}
              style={[s.langOption, isActive && s.langOptionActive]}
            >
              <Text style={s.langIcon}>{lang.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.langLabel, isActive && s.langLabelActive]}>{lang.label}</Text>
                <Text style={s.langNative}>{lang.nativeLabel}</Text>
              </View>
              {isActive && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
              {loading && isActive && (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  </Modal>
);

// ═════════════════════════════════════════════════════════════════
//   MAIN SCREEN
// ═════════════════════════════════════════════════════════════════

const SchemesScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('recommended');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const { profile, userName, languageUpdateLoading } = useAppSelector((s) => s.auth);
  const {
    schemes,
    schemesLoading,
    schemesError,
    eligibilityResult,
    eligibilityLoading,
  } = useAppSelector((s) => s.schemes);

  // Determine current language code from profile
  const currentLangCode = getLanguageCode(profile?.language || 'ENGLISH');
  const currentLangInfo = getLanguageInfo(currentLangCode);

  useEffect(() => {
    if (userName && !profile) {
      dispatch(fetchUserProfile(userName));
    }
  }, [userName, profile]);

  const handleLanguageSelect = (code) => {
    const backendEnum = LANGUAGE_MAP[code]; // e.g. TELUGU
    if (backendEnum === profile?.language) {
      setShowLanguagePicker(false);
      return;
    }
    if (profile?.id) {
      dispatch(updateFarmerLanguage({ farmerId: profile.id, language: backendEnum }))
        .unwrap()
        .then(() => {
          setShowLanguagePicker(false);
          // Re-fetch schemes with new language
          dispatch(browseSchemes({ language: code }));
        })
        .catch(() => {});
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={s.headerWrap}>
        <View style={s.headerRow}>
          <View style={s.headerIconBox}>
            <Ionicons name="gift" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Government Schemes</Text>
            <Text style={s.headerSubtitle}>Discover benefits you're eligible for</Text>
          </View>

          {/* Language Switcher Button */}
          <TouchableOpacity
            onPress={() => setShowLanguagePicker(true)}
            activeOpacity={0.7}
            style={s.langSwitcher}
          >
            <Text style={s.langSwitcherIcon}>{currentLangInfo.icon}</Text>
            <Text style={s.langSwitcherCode}>{currentLangCode}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.primary} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        <TabSelector tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      </View>

      {/* Tab Content */}
      <View style={s.tabContent}>
        {activeTab === 'recommended' && (
          <RecommendedTab
            dispatch={dispatch}
            profile={profile}
            navigation={navigation}
            eligibilityResult={eligibilityResult}
            eligibilityLoading={eligibilityLoading}
          />
        )}
        {activeTab === 'all' && (
          <AllSchemesTab
            dispatch={dispatch}
            schemes={schemes}
            schemesLoading={schemesLoading}
            schemesError={schemesError}
            navigation={navigation}
            langCode={currentLangCode}
          />
        )}
      </View>

      {/* Language Picker Modal */}
      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        currentCode={currentLangCode}
        onSelect={handleLanguageSelect}
        loading={languageUpdateLoading}
      />
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════
//   STYLES
// ═════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  /* ── SafeArea & Header ── */
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  headerWrap: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  headerIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primaryDark },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  langSwitcher: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.selectedBg, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  langSwitcherIcon: { fontSize: 16, marginRight: 4 },
  langSwitcherCode: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  tabContent: { flex: 1, paddingHorizontal: 20 },

  /* ── Card ── */
  card: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: COLORS.border + '70',
  },

  /* ── Tab Selector ── */
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 16, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: COLORS.border + '60',
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  tabLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginLeft: 6 },
  tabLabelActive: { color: '#fff', fontWeight: '700' },

  /* ── Chip ── */
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 6,
  },
  chipText: { fontSize: 11, fontWeight: '700' },

  /* ── Scheme Card ── */
  schemeCard: {
    backgroundColor: COLORS.white, borderRadius: 18, marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: COLORS.border + '60',
  },
  schemeCardRecommended: {
    borderColor: COLORS.primary + '30',
    shadowColor: COLORS.primary, shadowOpacity: 0.1,
  },
  schemeAccentStrip: { height: 4, width: '100%' },
  schemeInner: { padding: 14 },
  schemeHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  schemeIconBox: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  schemeName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  schemeCode: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  schemeBenefit: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  schemeBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  schemeArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },

  /* ── Empty State ── */
  emptyWrap: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 30 },
  emptyCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.selectedBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },

  /* ── Filter Chips ── */
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.white, marginRight: 8,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginLeft: 6 },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },

  /* ── Search ── */
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    paddingHorizontal: 4, marginBottom: 14,
    borderWidth: 1.5, borderColor: COLORS.border + '80',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: COLORS.selectedBg,
    alignItems: 'center', justifyContent: 'center', marginRight: 4,
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, color: COLORS.textPrimary },
  searchClear: { padding: 8 },

  /* ── Summary Card ── */
  summaryCard: {
    backgroundColor: COLORS.primaryDark, borderRadius: 20, padding: 18,
    marginBottom: 18, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  summaryBlob: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: COLORS.primary + '30', top: -30, right: -20,
  },
  summaryIconBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  summarySubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  summaryCountBadge: {
    backgroundColor: COLORS.primaryLight, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 6, marginLeft: 'auto',
  },
  summaryCountText: { fontSize: 18, fontWeight: '900', color: '#fff' },

  /* ── Section Headers ── */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionDot: { width: 4, height: 18, borderRadius: 2, marginRight: 8 },
  sectionHeaderText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },

  /* ── Almost Eligible Card ── */
  almostCard: {
    backgroundColor: COLORS.white, borderRadius: 18, marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: COLORS.border + '60',
  },
  reasonBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10, marginTop: 8,
  },
  reasonText: { fontSize: 12, color: '#F57C00', flex: 1, marginLeft: 8, lineHeight: 17 },

  /* ── Loading ── */
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingSpinnerBg: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.selectedBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },

  /* ── Error / Retry ── */
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 16,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 6 },

  /* ── Count Row (AllSchemesTab) ── */
  countRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  countText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginLeft: 6 },

  /* ── Language Picker Modal ── */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_W * 0.82, backgroundColor: COLORS.white,
    borderRadius: 24, padding: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  modalAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 5,
    backgroundColor: COLORS.primary,
  },
  modalIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.selectedBg,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 6, marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  langOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: 10,
  },
  langOptionActive: {
    backgroundColor: COLORS.selectedBg, borderColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  langIcon: { fontSize: 22, marginRight: 14 },
  langLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  langLabelActive: { fontWeight: '700', color: COLORS.primary },
  langNative: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
});

export default SchemesScreen;
