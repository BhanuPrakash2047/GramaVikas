import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  diagnoseWeb,
  fetchDiagnosticHistory,
  fetchFarmerDashboard,
  clearDiagnosisResult,
  clearDiagnosticErrors,
  clearDashboard,
} from '../../store/slices/diagnosticSlice';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { COLORS } from '../../constants';

const { width: SCREEN_W } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
//   SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ── Reusable Card ───────────────────────────────────────────────
const Card = ({ children, style }) => (
  <View
    style={[
      {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#1B4332',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E8F5E9',
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ── Section Header ──────────────────────────────────────────────
const SectionHeader = ({ icon, iconFamily, title, subtitle, color }) => {
  const IconComponent =
    iconFamily === 'MaterialCommunityIcons'
      ? MaterialCommunityIcons
      : iconFamily === 'FontAwesome5'
      ? FontAwesome5
      : Ionicons;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: color || COLORS.selectedBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <IconComponent name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.primaryDark }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ── Chip / Tag ──────────────────────────────────────────────────
const Chip = ({ label, color, bg }) => (
  <View
    style={{
      backgroundColor: bg || COLORS.selectedBg,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginRight: 8,
      marginBottom: 6,
    }}
  >
    <Text style={{ fontSize: 12, fontWeight: '600', color: color || COLORS.primary }}>
      {label}
    </Text>
  </View>
);

// ── Info Row ────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: '#F0F0F0',
    }}
  >
    {icon ? (
      <Ionicons
        name={icon}
        size={16}
        color={COLORS.textMuted}
        style={{ marginRight: 8, width: 20 }}
      />
    ) : null}
    <Text style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' }}>
      {label}
    </Text>
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        maxWidth: '55%',
        textAlign: 'right',
      }}
    >
      {value ?? '—'}
    </Text>
  </View>
);

// ── Tab Selector ────────────────────────────────────────────────
const TabSelector = ({ tabs, active, onSelect }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#F1F8F3',
      borderRadius: 14,
      padding: 4,
      marginBottom: 18,
    }}
  >
    {tabs.map((tab) => {
      const isActive = active === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.8}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: isActive ? COLORS.white : 'transparent',
            alignItems: 'center',
            shadowColor: isActive ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isActive ? 0.08 : 0,
            shadowRadius: 4,
            elevation: isActive ? 2 : 0,
          }}
        >
          <Ionicons
            name={tab.icon}
            size={18}
            color={isActive ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: isActive ? '700' : '500',
              color: isActive ? COLORS.primary : COLORS.textMuted,
              marginTop: 3,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ═══════════════════════════════════════════════════════════════════
//   TAB 1: DIAGNOSE
// ═══════════════════════════════════════════════════════════════════

const DiagnoseTab = ({ dispatch, profile, diagnosisResult, diagnosisLoading, diagnosisError }) => {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState(null);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (diagnosisResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      scrollRef.current?.scrollTo({ y: 400, animated: true });
    } else {
      fadeAnim.setValue(0);
    }
  }, [diagnosisResult]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Needed', 'Camera roll access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0]);
    }
  };

  const handleDiagnose = () => {
    if (!query.trim() && !image) {
      Alert.alert('Input Required', 'Please describe the issue or upload a crop photo.');
      return;
    }
    dispatch(clearDiagnosisResult());
    dispatch(
      diagnoseWeb({
        userQuery: query.trim() || 'Diagnose this crop from image',
        farmerId: profile?.id,
        language: profile?.language ? profile.language.toLowerCase().substring(0, 2) : 'en',
        region: profile?.stateName,
        image: image || undefined,
      })
    );
  };

  const handleClear = () => {
    setQuery('');
    setImage(null);
    dispatch(clearDiagnosisResult());
    dispatch(clearDiagnosticErrors());
  };

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Query Card ── */}
      <Card>
        <SectionHeader
          icon="search-outline"
          title="Describe the Problem"
          subtitle="Text + optional crop photo for AI diagnosis"
        />
        <TextInput
          style={{
            backgroundColor: '#F8FBF9',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: query ? COLORS.primary : COLORS.border,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: COLORS.textPrimary,
            minHeight: 100,
            textAlignVertical: 'top',
          }}
          placeholder="e.g. My paddy leaves are turning yellow with brown spots..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          value={query}
          onChangeText={setQuery}
          editable={!diagnosisLoading}
        />

        {/* Image Picker Row */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 14,
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={pickImage}
            disabled={diagnosisLoading}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F1F8F3',
              borderRadius: 12,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderStyle: 'dashed',
            }}
          >
            <Ionicons name="images-outline" size={18} color={COLORS.primary} />
            <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '600', color: COLORS.primary }}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takePhoto}
            disabled={diagnosisLoading}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F1F8F3',
              borderRadius: 12,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderStyle: 'dashed',
            }}
          >
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
            <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '600', color: COLORS.primary }}>
              Camera
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {image && (
          <View style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
            <Image
              source={{ uri: image.uri }}
              style={{ width: '100%', height: 200, borderRadius: 14 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setImage(null)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: 'rgba(0,0,0,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
          <TouchableOpacity
            onPress={handleDiagnose}
            disabled={diagnosisLoading}
            activeOpacity={0.85}
            style={{
              flex: 3,
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
              opacity: diagnosisLoading ? 0.7 : 1,
            }}
          >
            {diagnosisLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <MaterialCommunityIcons name="stethoscope" size={20} color={COLORS.white} />
            )}
            <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: '700', color: COLORS.white }}>
              {diagnosisLoading ? 'Analyzing...' : 'Diagnose'}
            </Text>
          </TouchableOpacity>

          {(query || image || diagnosisResult) && (
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: '#FEF2F2',
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#FECACA',
              }}
            >
              <Ionicons name="refresh" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* ── Error Banner ── */}
      {diagnosisError ? (
        <Card style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={{ marginLeft: 10, fontSize: 13, color: COLORS.error, flex: 1 }}>
              {typeof diagnosisError === 'string' ? diagnosisError : 'Diagnosis failed. Please try again.'}
            </Text>
          </View>
        </Card>
      ) : null}

      {/* ── Loading Indicator ── */}
      {diagnosisLoading ? (
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 14, fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' }}>
            AI is analyzing your crop...
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: COLORS.textMuted }}>
            This may take a few seconds
          </Text>
        </Card>
      ) : null}

      {/* ── Diagnosis Results ── */}
      {diagnosisResult && !diagnosisLoading ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Disease & Crop Header */}
          <Card
            style={{
              borderLeftWidth: 4,
              borderLeftColor: COLORS.primary,
              backgroundColor: '#F0FFF4',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <MaterialCommunityIcons name="leaf-circle" size={28} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primaryDark }}>
                  {diagnosisResult.classifiedDisease || 'Analysis Complete'}
                </Text>
                {diagnosisResult.classifiedCrop ? (
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
                    Crop: {diagnosisResult.classifiedCrop}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Confidence Bar */}
            {diagnosisResult.confidence != null && (
              <View style={{ marginTop: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Confidence</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>
                    {(diagnosisResult.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: '#E8F5E9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: 6,
                      width: `${Math.min(diagnosisResult.confidence * 100, 100)}%`,
                      backgroundColor:
                        diagnosisResult.confidence > 0.7
                          ? COLORS.success
                          : diagnosisResult.confidence > 0.4
                          ? COLORS.warning
                          : COLORS.error,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            )}

            {/* Source & Region badges */}
            <View style={{ flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' }}>
              {diagnosisResult.source && (
                <Chip
                  label={`Source: ${diagnosisResult.source.toUpperCase()}`}
                  bg="#E3F2FD"
                  color="#1565C0"
                />
              )}
              {diagnosisResult.regionSpecific && (
                <Chip label="Region-Specific" bg="#FFF3E0" color="#E65100" />
              )}
              {diagnosisResult.language && (
                <Chip label={`Lang: ${diagnosisResult.language}`} />
              )}
            </View>
          </Card>

          {/* Symptoms Matched */}
          {diagnosisResult.symptomsMatched?.length > 0 && (
            <Card>
              <SectionHeader
                icon="list-outline"
                title="Symptoms Matched"
                subtitle={`${diagnosisResult.symptomsMatched.length} symptoms identified`}
              />
              {diagnosisResult.symptomsMatched.map((s, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingVertical: 6,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: COLORS.selectedBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                      marginTop: 1,
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: COLORS.textSecondary,
                      lineHeight: 20,
                    }}
                  >
                    {s}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Diagnosis Text */}
          {diagnosisResult.diagnosis && (
            <Card>
              <SectionHeader
                icon="medkit-outline"
                title="Diagnosis"
                subtitle="Detailed analysis from AI"
              />
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 22,
                  color: COLORS.textSecondary,
                }}
              >
                {diagnosisResult.diagnosis}
              </Text>
            </Card>
          )}

          {/* Management Advice */}
          {diagnosisResult.managementAdvice &&
            Object.keys(diagnosisResult.managementAdvice).length > 0 && (
              <Card>
                <SectionHeader
                  icon="construct-outline"
                  title="Management Advice"
                  subtitle="Recommended actions"
                />
                {Object.entries(diagnosisResult.managementAdvice).map(([key, value]) => (
                  <View key={key} style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: COLORS.primaryDark,
                        textTransform: 'capitalize',
                        marginBottom: 4,
                      }}
                    >
                      {key.replace(/_/g, ' ')}
                    </Text>
                    {Array.isArray(value) ? (
                      value.map((item, i) => (
                        <View
                          key={i}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            paddingVertical: 3,
                            paddingLeft: 8,
                          }}
                        >
                          <Text style={{ color: COLORS.primary, marginRight: 8, fontSize: 12 }}>•</Text>
                          <Text style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
                            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                          </Text>
                        </View>
                      ))
                    ) : typeof value === 'object' ? (
                      Object.entries(value).map(([k2, v2]) => (
                        <View key={k2} style={{ paddingLeft: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                            <Text style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                              {k2.replace(/_/g, ' ')}:
                            </Text>{' '}
                            {Array.isArray(v2) ? v2.join(', ') : String(v2)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={{ fontSize: 13, color: COLORS.textSecondary, paddingLeft: 8, lineHeight: 20 }}>
                        {String(value)}
                      </Text>
                    )}
                  </View>
                ))}
              </Card>
            )}
        </Animated.View>
      ) : null}

      {/* Quick Tips (shown when idle) */}
      {!diagnosisResult && !diagnosisLoading && (
        <Card style={{ backgroundColor: '#FAFFF8' }}>
          <SectionHeader
            icon="bulb-outline"
            title="Quick Tips"
            subtitle="For best results"
          />
          {[
            'Describe symptoms clearly: color changes, spots, wilting',
            'Upload a close-up photo of the affected part',
            'Mention the crop name and growth stage if possible',
            'Include your region info for localized advice',
          ].map((tip, i) => (
            <View
              key={i}
              style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}
            >
              <Text style={{ color: COLORS.primary, fontSize: 13, marginRight: 8, fontWeight: '700' }}>
                {i + 1}.
              </Text>
              <Text style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
                {tip}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   TAB 2: HISTORY
// ═══════════════════════════════════════════════════════════════════

const HistoryTab = ({ dispatch, profile, history, historyLoading, historyError }) => {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchDiagnosticHistory(profile.id));
    }
  }, [profile?.id]);

  const onRefresh = useCallback(() => {
    if (profile?.id) {
      setRefreshing(true);
      dispatch(fetchDiagnosticHistory(profile.id)).finally(() => setRefreshing(false));
    }
  }, [profile?.id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (historyLoading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 14, color: COLORS.textSecondary }}>Loading history...</Text>
      </View>
    );
  }

  if (!profile?.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 }}>
        <Ionicons name="log-in-outline" size={56} color={COLORS.border} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginTop: 16, textAlign: 'center' }}>
          Login to see your diagnosis history
        </Text>
      </View>
    );
  }

  if (historyError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 }}>
        <Ionicons name="alert-circle-outline" size={56} color={COLORS.error} />
        <Text style={{ fontSize: 14, color: COLORS.error, marginTop: 14, textAlign: 'center' }}>
          {historyError}
        </Text>
        <TouchableOpacity onPress={onRefresh} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!history || history.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <MaterialCommunityIcons name="clipboard-text-clock-outline" size={64} color={COLORS.border} />
        <Text
          style={{ fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginTop: 16, textAlign: 'center' }}
        >
          No diagnosis history yet
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' }}>
          Your past diagnoses will appear here
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
        {history.length} diagnosis record{history.length > 1 ? 's' : ''}
      </Text>
      {history.map((session, idx) => (
        <Card key={session.id || idx}>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor:
                  session.classificationConfidence > 0.7
                    ? '#E8F5E9'
                    : session.classificationConfidence > 0.4
                    ? '#FFF3E0'
                    : '#FFEBEE',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons
                name="leaf"
                size={20}
                color={
                  session.classificationConfidence > 0.7
                    ? COLORS.success
                    : session.classificationConfidence > 0.4
                    ? COLORS.warning
                    : COLORS.error
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primaryDark }}>
                {session.classifiedDisease || 'Unknown Issue'}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 1 }}>
                {session.classifiedCrop ? `Crop: ${session.classifiedCrop}` : 'General Query'}
                {session.sourceType ? ` • ${session.sourceType}` : ''}
              </Text>
            </View>
            {session.classificationConfidence != null && (
              <View
                style={{
                  backgroundColor:
                    session.classificationConfidence > 0.7
                      ? '#E8F5E9'
                      : session.classificationConfidence > 0.4
                      ? '#FFF3E0'
                      : '#FFEBEE',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color:
                      session.classificationConfidence > 0.7
                        ? COLORS.success
                        : session.classificationConfidence > 0.4
                        ? COLORS.warning
                        : COLORS.error,
                  }}
                >
                  {(session.classificationConfidence * 100).toFixed(0)}%
                </Text>
              </View>
            )}
          </View>

          {/* User Query */}
          {session.userQuery && (
            <View
              style={{
                backgroundColor: '#F8FBF9',
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginBottom: 2 }}>
                Your Query:
              </Text>
              <Text
                style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 }}
                numberOfLines={3}
              >
                {session.userQuery}
              </Text>
            </View>
          )}

          {/* Diagnosis Response Snippet */}
          {session.diagnosisResponse && (
            <Text
              style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 8 }}
              numberOfLines={4}
            >
              {session.diagnosisResponse}
            </Text>
          )}

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopWidth: 0.5,
              borderTopColor: '#F0F0F0',
              paddingTop: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 4 }}>
                {formatDate(session.createdAt)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {session.source && <Chip label={session.source} />}
              {session.regionSpecific && <Chip label="Regional" bg="#FFF3E0" color="#E65100" />}
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   TAB 3: AGRI DASHBOARD
// ═══════════════════════════════════════════════════════════════════

const DashboardTab = ({ dispatch, profile, dashboard, dashboardLoading, dashboardError }) => {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id && !dashboard) {
      dispatch(fetchFarmerDashboard(profile.id));
    }
  }, [profile?.id, dashboard]);

  const onRefresh = useCallback(() => {
    if (profile?.id) {
      setRefreshing(true);
      dispatch(clearDashboard());
      dispatch(fetchFarmerDashboard(profile.id)).finally(() => setRefreshing(false));
    }
  }, [profile?.id]);

  if (dashboardLoading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 14, color: COLORS.textSecondary }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!profile?.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 }}>
        <Ionicons name="log-in-outline" size={56} color={COLORS.border} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginTop: 16, textAlign: 'center' }}>
          Login to see your personalized dashboard
        </Text>
      </View>
    );
  }

  if (dashboardError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 }}>
        <Ionicons name="alert-circle-outline" size={56} color={COLORS.error} />
        <Text style={{ fontSize: 14, color: COLORS.error, marginTop: 14, textAlign: 'center' }}>
          {dashboardError}
        </Text>
        <TouchableOpacity onPress={onRefresh} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dashboard) return null;

  const { districtOverview, weatherClimate, mandalProfile, cropRecommendations, soilWarnings, fertilizerRecommendations } =
    dashboard;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* ── District Overview ── */}
      {districtOverview && (
        <Card>
          <SectionHeader
            icon="earth"
            iconFamily="MaterialCommunityIcons"
            title={`${districtOverview.district || 'District'} Overview`}
            subtitle={`${districtOverview.state || ''} • ${districtOverview.agroClimaticZone || ''}`}
          />
          <InfoRow label="Total Mandals" value={districtOverview.totalMandals} icon="grid-outline" />
          <InfoRow
            label="Cultivable Land"
            value={
              districtOverview.cultivableLandHa
                ? `${districtOverview.cultivableLandHa.toLocaleString()} ha (${districtOverview.cultivableLandPct}%)`
                : null
            }
            icon="resize-outline"
          />
          <InfoRow
            label="Rural Population"
            value={districtOverview.ruralPopulationPct ? `${districtOverview.ruralPopulationPct}%` : null}
            icon="people-outline"
          />
          <InfoRow
            label="Agri Workers"
            value={districtOverview.agriculturalWorkersPct ? `${districtOverview.agriculturalWorkersPct}%` : null}
            icon="hand-left-outline"
          />

          {districtOverview.majorRivers?.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 }}>
                Major Rivers
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {districtOverview.majorRivers.map((r, i) => (
                  <Chip key={i} label={r} bg="#E3F2FD" color="#1565C0" />
                ))}
              </View>
            </View>
          )}

          {districtOverview.irrigationProjects?.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 }}>
                Irrigation Projects
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {districtOverview.irrigationProjects.map((p, i) => (
                  <Chip key={i} label={p} bg="#E8F5E9" color={COLORS.primary} />
                ))}
              </View>
            </View>
          )}

          {districtOverview.commonDeficiencies?.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 }}>
                Common Deficiencies
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {districtOverview.commonDeficiencies.map((d, i) => (
                  <Chip key={i} label={d} bg="#FFF3E0" color="#E65100" />
                ))}
              </View>
            </View>
          )}
        </Card>
      )}

      {/* ── Weather & Climate ── */}
      {weatherClimate && (
        <Card>
          <SectionHeader
            icon="weather-partly-cloudy"
            iconFamily="MaterialCommunityIcons"
            title="Weather & Climate"
            subtitle={weatherClimate.climateClassification}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            {/* Temp */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF8E1',
                borderRadius: 12,
                padding: 12,
                marginRight: 6,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="thermometer" size={24} color="#FF8F00" />
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#FF8F00', marginTop: 4 }}>
                {weatherClimate.meanTempCelsius ?? '—'}°
              </Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>Mean Temp</Text>
            </View>

            {/* Rainfall */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#E3F2FD',
                borderRadius: 12,
                padding: 12,
                marginHorizontal: 3,
                alignItems: 'center',
              }}
            >
              <Ionicons name="rainy-outline" size={24} color="#1565C0" />
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1565C0', marginTop: 4 }}>
                {weatherClimate.annualRainfallMm ?? '—'}
              </Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>Rainfall (mm)</Text>
            </View>

            {/* Range */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#F3E5F5',
                borderRadius: 12,
                padding: 12,
                marginLeft: 6,
                alignItems: 'center',
              }}
            >
              <Ionicons name="swap-vertical-outline" size={24} color="#7B1FA2" />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#7B1FA2', marginTop: 4 }}>
                {weatherClimate.winterMinCelsius ?? '—'}°–{weatherClimate.summerMaxCelsius ?? '—'}°
              </Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>Temp Range</Text>
            </View>
          </View>

          {/* Seasons */}
          {weatherClimate.seasons && Object.keys(weatherClimate.seasons).length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 }}>
                Seasonal Calendar
              </Text>
              {Object.entries(weatherClimate.seasons).map(([name, info]) => (
                <View
                  key={name}
                  style={{
                    backgroundColor: '#FAFFF8',
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: COLORS.primaryLight,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, textTransform: 'capitalize' }}>
                    {name}
                  </Text>
                  {info?.period && (
                    <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                      {info.period}
                    </Text>
                  )}
                  {info?.temperatureRange && (
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                      🌡️ {info.temperatureRange}  💧 {info.humidityPct || '—'}
                    </Text>
                  )}
                  {info?.mainCrops?.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                      {info.mainCrops.map((crop, i) => (
                        <Chip key={i} label={crop} />
                      ))}
                    </View>
                  )}
                  {info?.riskFactors?.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                      {info.riskFactors.map((r, i) => (
                        <Chip key={i} label={`⚠ ${r}`} bg="#FFF3E0" color="#E65100" />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Cyclone Risk */}
          {weatherClimate.cycloneRisk && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: '#FFEBEE',
                borderRadius: 10,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name="weather-tornado" size={18} color="#C62828" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#C62828', marginLeft: 6 }}>
                  Cyclone Risk: {weatherClimate.cycloneRisk.riskLevel}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Peak Season: {weatherClimate.cycloneRisk.peakSeason}
                {weatherClimate.cycloneRisk.coastlineKm
                  ? ` • Coastline: ${weatherClimate.cycloneRisk.coastlineKm} km`
                  : ''}
              </Text>
              {weatherClimate.cycloneRisk.note && (
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' }}>
                  {weatherClimate.cycloneRisk.note}
                </Text>
              )}
            </View>
          )}

          {/* Disease Risks */}
          {weatherClimate.diseaseRisks?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 }}>
                Disease Risk Alerts
              </Text>
              {weatherClimate.diseaseRisks.map((dr, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#FFF8E1',
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 6,
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="bug-outline" size={20} color="#F57F17" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#F57F17' }}>
                      {dr.disease}
                    </Text>
                    <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                      Trigger: {dr.trigger}
                      {dr.peakMonths?.length ? ` • Peak: ${dr.peakMonths.join(', ')}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* ── Mandal Soil Profile ── */}
      {mandalProfile && (
        <Card>
          <SectionHeader
            icon="terrain"
            iconFamily="MaterialCommunityIcons"
            title={`${mandalProfile.mandal || 'Mandal'} Profile`}
            subtitle={mandalProfile.district || ''}
          />

          <InfoRow label="Geography" value={mandalProfile.geography} icon="globe-outline" />
          <InfoRow label="Soil Type" value={mandalProfile.soilType} icon="layers-outline" />
          <InfoRow label="pH Range" value={mandalProfile.phRange} icon="flask-outline" />
          <InfoRow label="Organic Matter" value={mandalProfile.organicMatter} icon="leaf-outline" />
          <InfoRow label="Irrigation Source" value={mandalProfile.irrigationSource} icon="water-outline" />
          <InfoRow label="Irrigation Type" value={mandalProfile.irrigationType} icon="git-branch-outline" />

          {/* Nutrient Status */}
          {mandalProfile.nutrientStatus && Object.keys(mandalProfile.nutrientStatus).length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 }}>
                Nutrient Status
              </Text>
              {Object.entries(mandalProfile.nutrientStatus).map(([nutrient, info]) => {
                const status = info?.status?.toLowerCase();
                const statusColor =
                  status === 'adequate' || status === 'high'
                    ? COLORS.success
                    : status === 'medium'
                    ? COLORS.warning
                    : COLORS.error;
                return (
                  <View
                    key={nutrient}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 6,
                      borderBottomWidth: 0.5,
                      borderBottomColor: '#F0F0F0',
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: statusColor,
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: '600',
                        color: COLORS.textPrimary,
                        textTransform: 'capitalize',
                      }}
                    >
                      {nutrient}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: statusColor, marginRight: 12, textTransform: 'capitalize' }}>
                      {info?.status || '—'}
                    </Text>
                    {info?.recommendation && (
                      <Text style={{ fontSize: 11, color: COLORS.textMuted, maxWidth: '40%' }} numberOfLines={1}>
                        {info.recommendation}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Major Crops */}
          {mandalProfile.majorCrops?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 }}>
                Major Crops
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {mandalProfile.majorCrops.map((c, i) => (
                  <Chip key={i} label={c} />
                ))}
              </View>
            </View>
          )}

          {/* Crop Calendar */}
          {mandalProfile.cropCalendar && Object.keys(mandalProfile.cropCalendar).length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 }}>
                Crop Calendar
              </Text>
              {Object.entries(mandalProfile.cropCalendar).map(([season, entry]) => (
                <View
                  key={season}
                  style={{
                    backgroundColor: '#F8FBF9',
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: COLORS.primaryDark,
                      textTransform: 'capitalize',
                      marginBottom: 4,
                    }}
                  >
                    {season}
                  </Text>
                  {entry?.mainCrop && (
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      🌱 {entry.mainCrop}
                    </Text>
                  )}
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                    Sow: {entry?.sowing || '—'} → Harvest: {entry?.harvest || '—'}
                  </Text>
                  {entry?.note && (
                    <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontStyle: 'italic' }}>
                      {entry.note}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Common Issues */}
          {mandalProfile.commonIssues?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 }}>
                Common Issues
              </Text>
              {mandalProfile.commonIssues.map((issue, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={14} color={COLORS.warning} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 }}>{issue}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Special Features */}
          {mandalProfile.specialFeatures && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: '#E8F5E9',
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>
                ✨ {mandalProfile.specialFeatures}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* ── Crop Recommendations ── */}
      {cropRecommendations && (
        <Card>
          <SectionHeader
            icon="sprout"
            iconFamily="MaterialCommunityIcons"
            title="Crop Recommendations"
            subtitle={cropRecommendations.soilType ? `For ${cropRecommendations.soilType} soil` : undefined}
          />
          {cropRecommendations.bestCrops?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {cropRecommendations.bestCrops.map((crop, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#E8F5E9',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="sprout" size={14} color={COLORS.primary} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary, marginLeft: 6 }}>
                    {crop}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {cropRecommendations.note && (
            <Text style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', lineHeight: 18 }}>
              {cropRecommendations.note}
            </Text>
          )}
        </Card>
      )}

      {/* ── Soil Warnings ── */}
      {soilWarnings?.length > 0 && (
        <Card style={{ borderLeftWidth: 4, borderLeftColor: COLORS.warning }}>
          <SectionHeader
            icon="warning-outline"
            title="Soil Warnings"
            subtitle="Issues to be aware of"
          />
          {soilWarnings.map((w, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <Ionicons name="warning" size={14} color={COLORS.warning} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>{w}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* ── Fertilizer Recommendations ── */}
      {fertilizerRecommendations && Object.keys(fertilizerRecommendations).length > 0 && (
        <Card>
          <SectionHeader
            icon="flask"
            iconFamily="FontAwesome5"
            title="Fertilizer Guide"
            subtitle="Recommended applications"
          />
          {Object.entries(fertilizerRecommendations).map(([key, value]) => (
            <View key={key} style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: COLORS.primaryDark,
                  textTransform: 'capitalize',
                  marginBottom: 4,
                }}
              >
                {key.replace(/_/g, ' ')}
              </Text>
              {Array.isArray(value) ? (
                value.map((item, i) => (
                  <Text key={i} style={{ fontSize: 12, color: COLORS.textSecondary, paddingLeft: 8, lineHeight: 18 }}>
                    • {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                  </Text>
                ))
              ) : typeof value === 'object' && value !== null ? (
                Object.entries(value).map(([k2, v2]) => (
                  <Text key={k2} style={{ fontSize: 12, color: COLORS.textSecondary, paddingLeft: 8, lineHeight: 18 }}>
                    <Text style={{ fontWeight: '600' }}>{k2}:</Text> {String(v2)}
                  </Text>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, paddingLeft: 8 }}>{String(value)}</Text>
              )}
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════
//   MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════

const TABS = [
  { key: 'diagnose', label: 'Diagnose', icon: 'search-outline' },
  { key: 'history', label: 'History', icon: 'time-outline' },
  { key: 'dashboard', label: 'Dashboard', icon: 'bar-chart-outline' },
];

const DiagnosticsScreen = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('diagnose');

  const { profile, userName } = useAppSelector((s) => s.auth);
  const {
    diagnosisResult,
    diagnosisLoading,
    diagnosisError,
    history,
    historyLoading,
    historyError,
    dashboard,
    dashboardLoading,
    dashboardError,
  } = useAppSelector((s) => s.diagnostic);

  // Auto-fetch profile if we have a userName but no profile
  useEffect(() => {
    if (userName && !profile) {
      dispatch(fetchUserProfile(userName));
    }
  }, [userName, profile]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Screen Header ── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <MaterialCommunityIcons name="stethoscope" size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.primaryDark }}>
              Crop Diagnostics
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 1 }}>
              AI-powered crop health analysis
            </Text>
          </View>
          {profile && (
            <View
              style={{
                backgroundColor: COLORS.selectedBg,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.primary }}>
                {profile.mandalName || profile.districtName || ''}
              </Text>
            </View>
          )}
        </View>

        {/* ── Tab Selector ── */}
        <TabSelector tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      </View>

      {/* ── Tab Content ── */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {activeTab === 'diagnose' && (
          <DiagnoseTab
            dispatch={dispatch}
            profile={profile}
            diagnosisResult={diagnosisResult}
            diagnosisLoading={diagnosisLoading}
            diagnosisError={diagnosisError}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            dispatch={dispatch}
            profile={profile}
            history={history}
            historyLoading={historyLoading}
            historyError={historyError}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardTab
            dispatch={dispatch}
            profile={profile}
            dashboard={dashboard}
            dashboardLoading={dashboardLoading}
            dashboardError={dashboardError}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default DiagnosticsScreen;
