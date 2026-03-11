import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUserProfile } from '../../store/slices/authSlice';
import {
  fetchSchemeDetail,
  fetchMissingFields,
  checkEligibility,
  clearSelectedScheme,
  clearEligibilityResult,
  clearMissingFields,
} from '../../store/slices/schemeSlice';
import { COLORS } from '../../constants';
import { LANGUAGE_MAP } from '../../constants/locationData';

const { width: SCREEN_W } = Dimensions.get('window');

// Backend enum → frontend code (ENGLISH → EN, TELUGU → TE, HINDI → HI)
const REVERSE_LANG_MAP = Object.fromEntries(
  Object.entries(LANGUAGE_MAP).map(([k, v]) => [v, k])
);

// ═════════════════════════════════════════════════════════════════
//   REUSABLE COMPONENTS
// ═════════════════════════════════════════════════════════════════

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

const SectionHeader = ({ icon, title, subtitle, color }) => (
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
      <Ionicons name={icon} size={20} color={COLORS.primary} />
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

const Chip = ({ label, color, bg }) => (
  <View
    style={{
      backgroundColor: bg || COLORS.selectedBg,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 6,
      marginBottom: 4,
    }}
  >
    <Text style={{ fontSize: 11, fontWeight: '600', color: color || COLORS.primary }}>
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
//   ELIGIBILITY QUESTION MODAL
// ═════════════════════════════════════════════════════════════════

const EligibilityModal = ({
  visible,
  onClose,
  missingFields,
  missingFieldsLoading,
  onComplete,
  schemeDetail,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentValue, setCurrentValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fields = missingFields?.missingFields || [];
  const totalFields = fields.length;
  const profileComplete = missingFields?.profileComplete;

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setAnswers({});
      setCurrentValue('');
      setShowResult(false);
      setEligibilityResult(null);
      setCheckingEligibility(false);
      progressAnim.setValue(0);
    }
  }, [visible]);

  // Progress bar animation
  useEffect(() => {
    if (totalFields > 0) {
      Animated.timing(progressAnim, {
        toValue: (currentIndex + 1) / totalFields,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentIndex, totalFields]);

  const handleAnswer = (value) => {
    const field = fields[currentIndex];
    const newAnswers = { ...answers, [field.fieldName]: value };
    setAnswers(newAnswers);
    setCurrentValue('');

    if (currentIndex < totalFields - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered - submit
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentValue('');
    }
  };

  if (!visible) return null;

  // Loading state
  if (missingFieldsLoading) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 24,
              padding: 40,
              alignItems: 'center',
              width: '100%',
              maxWidth: 400,
            }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 16, fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' }}>
              Checking your profile...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Profile already complete - no questions needed
  if (profileComplete) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              width: '100%',
              maxWidth: 400,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#E8F5E9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="checkmark-circle" size={36} color={COLORS.success} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 }}>
              Profile Complete!
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              All required information is already available. Checking eligibility...
            </Text>
            <TouchableOpacity
              onPress={() => {
                onComplete({});
              }}
              activeOpacity={0.85}
              style={{
                marginTop: 24,
                backgroundColor: COLORS.primary,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 32,
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700' }}>
                Check Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 12, paddingVertical: 8 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // No missing fields data
  if (!fields || fields.length === 0) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              width: '100%',
              maxWidth: 400,
            }}
          >
            <Ionicons name="checkmark-done-circle" size={48} color={COLORS.primary} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primaryDark, marginTop: 16 }}>
              No additional info needed
            </Text>
            <TouchableOpacity
              onPress={() => onComplete({})}
              activeOpacity={0.85}
              style={{
                marginTop: 24,
                backgroundColor: COLORS.primary,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 32,
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700' }}>
                Check Eligibility
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 12, paddingVertical: 8 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Question Flow
  const currentField = fields[currentIndex];
  const isBooleanField = currentField?.fieldType === 'BOOLEAN';
  const isNumberField = currentField?.fieldType === 'NUMBER';
  const isStringField = currentField?.fieldType === 'STRING';
  const isINOperator = currentField?.operator === 'IN';
  const inOptions = isINOperator ? currentField.expectedValue?.split(',').map((v) => v.trim()) : [];

  const getFieldIcon = (fieldName) => {
    const icons = {
      landSize: 'resize-outline',
      income: 'cash-outline',
      age: 'person-outline',
      isBpl: 'people-outline',
      cropType: 'leaf-outline',
      state: 'location-outline',
    };
    return icons[fieldName] || 'help-circle-outline';
  };

  const formatQuestion = (field) => {
    if (field.question) return field.question;
    // Fallback: generate from field metadata
    const name = field.fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
    if (field.fieldType === 'BOOLEAN') {
      return `${name}?`;
    }
    return `What is your ${name.toLowerCase()}?`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.background,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              maxHeight: '85%',
            }}
          >
            {/* Handle Bar */}
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#D1D5DB',
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primaryDark }}>
                  Eligibility Check
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                  {missingFields?.schemeName || 'Answer a few questions'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: '500' }}>
                  Question {currentIndex + 1} of {totalFields}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>
                  {Math.round(((currentIndex + 1) / totalFields) * 100)}%
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
                <Animated.View
                  style={{
                    height: 6,
                    backgroundColor: COLORS.primary,
                    borderRadius: 3,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>
            </View>

            {/* Question Content */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Question Card */}
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 20,
                  padding: 24,
                  shadowColor: '#1B4332',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                {/* Field Icon */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: COLORS.selectedBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    alignSelf: 'center',
                  }}
                >
                  <Ionicons
                    name={getFieldIcon(currentField.fieldName)}
                    size={28}
                    color={COLORS.primary}
                  />
                </View>

                {/* Question Text */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: COLORS.primaryDark,
                    textAlign: 'center',
                    marginBottom: 6,
                    lineHeight: 26,
                  }}
                >
                  {formatQuestion(currentField)}
                </Text>

                {/* Context hint */}
                {currentField.operator && currentField.expectedValue && !isBooleanField && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.textMuted,
                      textAlign: 'center',
                      marginBottom: 20,
                    }}
                  >
                    {currentField.operator === '>='
                      ? `Minimum required: ${currentField.expectedValue}`
                      : currentField.operator === '<='
                      ? `Maximum allowed: ${currentField.expectedValue}`
                      : currentField.operator === '='
                      ? `Expected: ${currentField.expectedValue}`
                      : currentField.operator === 'IN'
                      ? `Options: ${currentField.expectedValue}`
                      : ''}
                  </Text>
                )}

                {/* BOOLEAN Input */}
                {isBooleanField && (
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleAnswer('true')}
                      activeOpacity={0.85}
                      style={{
                        flex: 1,
                        backgroundColor: '#E8F5E9',
                        borderWidth: 2,
                        borderColor: COLORS.primary,
                        borderRadius: 16,
                        paddingVertical: 18,
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={32} color={COLORS.primary} />
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 16,
                          fontWeight: '700',
                          color: COLORS.primary,
                        }}
                      >
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAnswer('false')}
                      activeOpacity={0.85}
                      style={{
                        flex: 1,
                        backgroundColor: '#FEF2F2',
                        borderWidth: 2,
                        borderColor: COLORS.error,
                        borderRadius: 16,
                        paddingVertical: 18,
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="close-circle" size={32} color={COLORS.error} />
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 16,
                          fontWeight: '700',
                          color: COLORS.error,
                        }}
                      >
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* NUMBER Input */}
                {isNumberField && (
                  <View style={{ marginTop: 8 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F8FBF9',
                        borderWidth: 1.5,
                        borderColor: currentValue ? COLORS.primary : COLORS.border,
                        borderRadius: 14,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Ionicons name="calculator-outline" size={20} color={COLORS.textMuted} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          paddingHorizontal: 10,
                          fontSize: 18,
                          fontWeight: '600',
                          color: COLORS.textPrimary,
                          textAlign: 'center',
                        }}
                        placeholder="Enter value"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={currentValue}
                        onChangeText={setCurrentValue}
                        autoFocus
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (!currentValue.trim()) {
                          Alert.alert('Required', 'Please enter a value');
                          return;
                        }
                        handleAnswer(currentValue.trim());
                      }}
                      activeOpacity={0.85}
                      style={{
                        marginTop: 16,
                        backgroundColor: currentValue.trim() ? COLORS.primary : '#D1D5DB',
                        borderRadius: 14,
                        paddingVertical: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700' }}>
                        {currentIndex < totalFields - 1 ? 'Next' : 'Check Eligibility'}
                      </Text>
                      <Ionicons
                        name={currentIndex < totalFields - 1 ? 'arrow-forward' : 'checkmark'}
                        size={20}
                        color={COLORS.white}
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* STRING with IN operator - show options */}
                {isStringField && isINOperator && (
                  <View style={{ marginTop: 8 }}>
                    {inOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleAnswer(option)}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: COLORS.white,
                          borderWidth: 1.5,
                          borderColor: COLORS.border,
                          borderRadius: 14,
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons name="ellipse-outline" size={20} color={COLORS.primary} />
                        <Text
                          style={{
                            flex: 1,
                            marginLeft: 12,
                            fontSize: 15,
                            fontWeight: '500',
                            color: COLORS.textPrimary,
                          }}
                        >
                          {option}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* STRING without IN operator - text input */}
                {isStringField && !isINOperator && (
                  <View style={{ marginTop: 8 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F8FBF9',
                        borderWidth: 1.5,
                        borderColor: currentValue ? COLORS.primary : COLORS.border,
                        borderRadius: 14,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Ionicons name="text-outline" size={20} color={COLORS.textMuted} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          paddingHorizontal: 10,
                          fontSize: 16,
                          color: COLORS.textPrimary,
                        }}
                        placeholder="Enter value"
                        placeholderTextColor="#9CA3AF"
                        value={currentValue}
                        onChangeText={setCurrentValue}
                        autoFocus
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (!currentValue.trim()) {
                          Alert.alert('Required', 'Please enter a value');
                          return;
                        }
                        handleAnswer(currentValue.trim());
                      }}
                      activeOpacity={0.85}
                      style={{
                        marginTop: 16,
                        backgroundColor: currentValue.trim() ? COLORS.primary : '#D1D5DB',
                        borderRadius: 14,
                        paddingVertical: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700' }}>
                        {currentIndex < totalFields - 1 ? 'Next' : 'Check Eligibility'}
                      </Text>
                      <Ionicons
                        name={currentIndex < totalFields - 1 ? 'arrow-forward' : 'checkmark'}
                        size={20}
                        color={COLORS.white}
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Back Button */}
              {currentIndex > 0 && (
                <TouchableOpacity
                  onPress={handleBack}
                  style={{
                    marginTop: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color={COLORS.textMuted} />
                  <Text style={{ marginLeft: 6, fontSize: 14, color: COLORS.textMuted, fontWeight: '500' }}>
                    Previous Question
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ═════════════════════════════════════════════════════════════════
//   ELIGIBILITY RESULT MODAL
// ═════════════════════════════════════════════════════════════════

const EligibilityResultModal = ({ visible, onClose, result, loading, error, schemeName }) => {
  if (!visible) return null;

  // Find this specific scheme in the result
  const schemeResult =
    result?.eligibleSchemes?.find((s) => s.schemeName === schemeName) ||
    result?.almostEligibleSchemes?.find((s) => s.schemeName === schemeName) ||
    result?.ineligibleSchemes?.find((s) => s.schemeName === schemeName);

  const isEligible = result?.eligibleSchemes?.some((s) => s.schemeName === schemeName);
  const isAlmostEligible = result?.almostEligibleSchemes?.some((s) => s.schemeName === schemeName);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 24,
            padding: 32,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
          }}
        >
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 16, fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' }}>
                Verifying eligibility...
              </Text>
            </View>
          ) : error ? (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#FFEBEE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="alert-circle" size={36} color={COLORS.error} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.error, marginBottom: 8 }}>
                Check Failed
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Result Icon */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: isEligible ? '#E8F5E9' : isAlmostEligible ? '#FFF3E0' : '#FFEBEE',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name={
                      isEligible
                        ? 'checkmark-circle'
                        : isAlmostEligible
                        ? 'information-circle'
                        : 'close-circle'
                    }
                    size={40}
                    color={isEligible ? COLORS.success : isAlmostEligible ? COLORS.warning : COLORS.error}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '800',
                    color: isEligible ? COLORS.success : isAlmostEligible ? '#E65100' : COLORS.error,
                    marginBottom: 4,
                  }}
                >
                  {isEligible ? 'Eligible!' : isAlmostEligible ? 'Almost Eligible' : 'Not Eligible'}
                </Text>
                <Text
                  style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}
                >
                  {isEligible
                    ? 'You meet all the criteria for this scheme.'
                    : isAlmostEligible
                    ? 'You are close to meeting the requirements.'
                    : 'You do not currently meet the eligibility criteria.'}
                </Text>
              </View>

              {/* Scheme Info */}
              {schemeResult && (
                <View
                  style={{
                    backgroundColor: '#F8FBF9',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 4 }}>
                    {schemeResult.schemeName}
                  </Text>
                  {schemeResult.benefitSummary ? (
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 }}>
                      {schemeResult.benefitSummary}
                    </Text>
                  ) : null}

                  {/* Rules Progress */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                    <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                      Rules passed: {schemeResult.totalRules - schemeResult.failedRuleCount}/{schemeResult.totalRules}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: '#E8F5E9',
                      borderRadius: 3,
                      overflow: 'hidden',
                      marginTop: 6,
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        width: `${
                          schemeResult.totalRules > 0
                            ? ((schemeResult.totalRules - schemeResult.failedRuleCount) / schemeResult.totalRules) * 100
                            : 0
                        }%`,
                        backgroundColor: isEligible ? COLORS.success : isAlmostEligible ? COLORS.warning : COLORS.error,
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  {/* Reason Message */}
                  {schemeResult.reasonMessage ? (
                    <View
                      style={{
                        marginTop: 12,
                        backgroundColor: isEligible ? '#E8F5E9' : '#FFF3E0',
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: isEligible ? COLORS.primary : '#E65100', lineHeight: 18 }}>
                        {schemeResult.reasonMessage}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </ScrollView>
          )}

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{
              marginTop: 16,
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700' }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ═════════════════════════════════════════════════════════════════
//   MAIN SCHEME DETAIL SCREEN
// ═════════════════════════════════════════════════════════════════

const SchemeDetailScreen = ({ route, navigation }) => {
  const dispatch = useAppDispatch();
  const { schemeId } = route.params;

  const { profile, userName } = useAppSelector((s) => s.auth);
  const {
    selectedScheme,
    schemeDetailLoading,
    schemeDetailError,
    missingFields,
    missingFieldsLoading,
    missingFieldsError,
    eligibilityResult,
    eligibilityLoading,
    eligibilityError,
  } = useAppSelector((s) => s.schemes);

  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  // Determine the language code from user profile
  const langCode = REVERSE_LANG_MAP[profile?.language] || 'EN';

  // Fetch detail on mount
  useEffect(() => {
    dispatch(clearSelectedScheme());
    dispatch(clearEligibilityResult());
    dispatch(clearMissingFields());
    dispatch(fetchSchemeDetail({ schemeId, language: langCode }));
  }, [schemeId, langCode]);

  // Fetch profile if needed
  useEffect(() => {
    if (userName && !profile) {
      dispatch(fetchUserProfile(userName));
    }
  }, [userName, profile]);

  // Start eligibility check
  const handleCheckEligibility = () => {
    if (!profile?.id) {
      Alert.alert('Login Required', 'Please login to check eligibility.');
      return;
    }
    dispatch(clearMissingFields());
    dispatch(clearEligibilityResult());
    dispatch(fetchMissingFields({ schemeId, farmerId: profile.id }));
    setShowEligibilityModal(true);
  };

  // When user completes all questions
  const handleEligibilityComplete = (additionalFields) => {
    setShowEligibilityModal(false);
    setShowResultModal(true);
    dispatch(
      checkEligibility({
        farmerId: profile.id,
        mode: 'VERIFY',
        additionalFields,
      })
    );
  };

  const scheme = selectedScheme;
  const catMeta = getCategoryMeta(scheme?.category);

  if (schemeDetailLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 14, color: COLORS.textSecondary }}>Loading scheme details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (schemeDetailError || !scheme) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="alert-circle-outline" size={56} color={COLORS.error} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.error, marginTop: 16, textAlign: 'center' }}>
            {schemeDetailError || 'Failed to load scheme'}
          </Text>
          <TouchableOpacity
            onPress={() => dispatch(fetchSchemeDetail({ schemeId, language: langCode }))}
            style={{ marginTop: 16 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.primary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {/* Hero Card */}
        <Card
          style={{
            marginTop: 8,
            borderLeftWidth: 4,
            borderLeftColor: catMeta.color,
            backgroundColor: '#F0FFF4',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: catMeta.bg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name={catMeta.icon} size={26} color={catMeta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.primaryDark, lineHeight: 26 }}>
                {scheme.schemeName}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>
                {scheme.schemeCode}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip label={catMeta.label} bg={catMeta.bg} color={catMeta.color} />
            <Chip
              label={scheme.state || 'Central'}
              bg={scheme.state ? '#FFF3E0' : '#E3F2FD'}
              color={scheme.state ? '#E65100' : '#1565C0'}
            />
            {scheme.isActive && <Chip label="Active" bg="#E8F5E9" color={COLORS.success} />}
          </View>
        </Card>

        {/* Description */}
        <Card>
          <SectionHeader icon="document-text-outline" title="About This Scheme" subtitle="Overview" />
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 }}>
            {scheme.description}
          </Text>
        </Card>

        {/* Benefits */}
        {scheme.benefitDetails && (
          <Card style={{ borderLeftWidth: 4, borderLeftColor: COLORS.success }}>
            <SectionHeader icon="gift-outline" title="Benefits" subtitle="What you get" color="#E8F5E9" />
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 }}>
              {scheme.benefitDetails}
            </Text>
          </Card>
        )}

        {/* Eligibility Rules */}
        {scheme.eligibilityGroups?.length > 0 && (
          <Card>
            <SectionHeader icon="list-outline" title="Eligibility Criteria" subtitle="Who can apply" />
            {scheme.eligibilityGroups.map((group, gi) => (
              <View key={gi} style={{ marginBottom: gi < scheme.eligibilityGroups.length - 1 ? 14 : 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: COLORS.selectedBg,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>
                      {group.groupName?.replace(/_/g, ' ')} ({group.groupOperator})
                    </Text>
                  </View>
                </View>
                {group.rules?.map((rule, ri) => (
                  <View
                    key={ri}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderBottomWidth: ri < group.rules.length - 1 ? 0.5 : 0,
                      borderBottomColor: '#F0F0F0',
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#F1F8F3',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>
                        {ri + 1}
                      </Text>
                    </View>
                    <Text
                      style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary }}
                    >
                      {rule.displayText ? (
                        <Text style={{ color: COLORS.textPrimary }}>
                          {rule.displayText}
                        </Text>
                      ) : (
                        <>
                          <Text style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                            {rule.fieldName}
                          </Text>
                          {' '}
                          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                            {rule.operator}
                          </Text>
                          {' '}
                          {rule.value}
                        </>
                      )}
                    </Text>
                    <Chip
                      label={rule.fieldType}
                      bg={
                        rule.fieldType === 'NUMBER'
                          ? '#E3F2FD'
                          : rule.fieldType === 'BOOLEAN'
                          ? '#FFF3E0'
                          : '#F3E5F5'
                      }
                      color={
                        rule.fieldType === 'NUMBER'
                          ? '#1565C0'
                          : rule.fieldType === 'BOOLEAN'
                          ? '#E65100'
                          : '#7B1FA2'
                      }
                    />
                  </View>
                ))}
              </View>
            ))}
          </Card>
        )}

        {/* FAQs */}
        {scheme.faqs?.length > 0 && (
          <Card>
            <SectionHeader icon="help-circle-outline" title="FAQs" subtitle={`${scheme.faqs.length} questions`} />
            {scheme.faqs.map((faq, idx) => (
              <TouchableOpacity
                key={faq.id || idx}
                onPress={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: expandedFaqIndex === idx ? '#F1F8F3' : COLORS.white,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: expandedFaqIndex === idx ? COLORS.primary : '#F0F0F0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name="help-circle"
                    size={20}
                    color={expandedFaqIndex === idx ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      fontSize: 14,
                      fontWeight: '600',
                      color: COLORS.textPrimary,
                    }}
                  >
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={expandedFaqIndex === idx ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </View>
                {expandedFaqIndex === idx && (
                  <View style={{ marginTop: 10, paddingLeft: 30 }}>
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
                      {faq.answer}
                    </Text>
                    {faq.language && faq.language !== 'EN' && (
                      <Chip
                        label={faq.language}
                        bg="#F3E5F5"
                        color="#7B1FA2"
                      />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* Floating Eligibility Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          paddingTop: 12,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: '#E8F5E9',
        }}
      >
        <TouchableOpacity
          onPress={handleCheckEligibility}
          activeOpacity={0.85}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <MaterialCommunityIcons name="shield-check" size={22} color={COLORS.white} />
          <Text style={{ marginLeft: 10, color: COLORS.white, fontSize: 16, fontWeight: '700' }}>
            Check My Eligibility
          </Text>
        </TouchableOpacity>
      </View>

      {/* Eligibility Question Modal */}
      <EligibilityModal
        visible={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        missingFields={missingFields}
        missingFieldsLoading={missingFieldsLoading}
        schemeDetail={scheme}
        onComplete={handleEligibilityComplete}
      />

      {/* Eligibility Result Modal */}
      <EligibilityResultModal
        visible={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          dispatch(clearEligibilityResult());
        }}
        result={eligibilityResult}
        loading={eligibilityLoading}
        error={eligibilityError}
        schemeName={scheme?.schemeName}
      />
    </SafeAreaView>
  );
};

export default SchemeDetailScreen;
