import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  TextInput,
  StatusBar,
  RefreshControl,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  submitVoiceEmergency,
  submitLivestockEmergency,
  clearEmergencyState,
} from '../../store/slices/emergencySlice';
import { browseSchemes } from '../../store/slices/schemeSlice';
import { COLORS, SCREENS } from '../../constants';

// ═══════════════════════════════════════════════════════════
//  VOICE SOS SECTION
// ═══════════════════════════════════════════════════════════

const VoiceSOSCard = ({ onRecordComplete, loading }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice SOS.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setDuration(0);
      setRecordedUri(null);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error('Recording start error', err);
      Alert.alert('Error', 'Could not start recording.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Recording stop error', err);
    }
  }, [recording]);

  const handleSend = () => {
    if (recordedUri) onRecordComplete(recordedUri);
  };

  const reset = () => {
    setRecordedUri(null);
    setDuration(0);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: '#FFEBEE',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="mic" size={22} color="#F44336" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.primaryDark }}>Voice SOS</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            Tap to record, describe your emergency
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <ActivityIndicator size="large" color="#F44336" />
          <Text style={{ marginTop: 12, fontWeight: '600', color: COLORS.textSecondary }}>
            AI is analyzing your emergency...
          </Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          {/* Record Button */}
          <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.7}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isRecording ? '#F44336' : recordedUri ? '#4CAF50' : '#FFCDD2',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isRecording ? '#F44336' : '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <Ionicons
                name={isRecording ? 'stop' : recordedUri ? 'checkmark' : 'mic'}
                size={36}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Duration */}
          {(isRecording || recordedUri) && (
            <Text
              style={{
                marginTop: 10,
                fontSize: 16,
                fontWeight: '700',
                color: isRecording ? '#F44336' : COLORS.textPrimary,
                letterSpacing: 1,
              }}
            >
              {fmtTime(duration)}
            </Text>
          )}

          {/* Actions */}
          {recordedUri && !isRecording && (
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10, width: '100%' }}>
              <TouchableOpacity
                onPress={reset}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary }}>
                  Re-record
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSend}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: '#F44336',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.white }}>Send SOS</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isRecording && !recordedUri && (
            <Text style={{ marginTop: 10, fontSize: 12, color: COLORS.textMuted }}>
              Tap to start recording
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
//  LIVESTOCK EMERGENCY SECTION
// ═══════════════════════════════════════════════════════════

const LivestockCard = ({ onSubmit, loading }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImagePickerAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]) setImage(result.assets[0]);
    } catch {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const takePhoto = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
      if (!result.canceled && result.assets?.[0]) setImage(result.assets[0]);
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleSubmit = () => {
    if (image && description.trim()) onSubmit({ image, description });
  };

  const reset = () => {
    setDescription('');
    setImage(null);
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: '#FFF3E0',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="paw" size={22} color="#FF6D00" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.primaryDark }}>
            Livestock Emergency
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            Photo + description for veterinary AI
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <ActivityIndicator size="large" color="#FF6D00" />
          <Text style={{ marginTop: 12, fontWeight: '600', color: COLORS.textSecondary }}>
            Veterinary AI analyzing...
          </Text>
        </View>
      ) : (
        <>
          {/* Image capture buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <TouchableOpacity
              onPress={takePhoto}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: image ? '#E8F5E9' : '#FFF3E0',
                borderWidth: 1.5,
                borderColor: image ? COLORS.primary : '#FFB74D',
                alignItems: 'center',
                borderStyle: image ? 'solid' : 'dashed',
              }}
            >
              <Ionicons name="camera" size={22} color={image ? COLORS.primary : '#FF6D00'} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: image ? COLORS.primary : '#FF6D00',
                  marginTop: 4,
                }}
              >
                {image ? '✓ Photo taken' : 'Take Photo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: '#F5F5F5',
                borderWidth: 1.5,
                borderColor: COLORS.border,
                alignItems: 'center',
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name="images" size={22} color={COLORS.textMuted} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginTop: 4 }}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description input */}
          <View
            style={{
              borderWidth: 1.5,
              borderColor: COLORS.border,
              borderRadius: 14,
              padding: 12,
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4 }}>
              DESCRIBE THE PROBLEM
            </Text>
            <TextInput
              style={{
                fontSize: 14,
                color: COLORS.textPrimary,
                minHeight: 56,
                textAlignVertical: 'top',
              }}
              placeholder="e.g. Cow not eating for 2 days, swelling on leg"
              placeholderTextColor="#9CA3AF"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Submit / Reset */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(image || description) && (
              <TouchableOpacity
                onPress={reset}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary }}>Reset</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!image || !description.trim()}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: image && description.trim() ? '#FF6D00' : COLORS.disabled,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.white }}>
                Submit Emergency
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
//  RESULT CARD
// ═══════════════════════════════════════════════════════════

const ResultCard = ({ result, type, onDismiss }) => {
  if (!result) return null;

  const isVoice = type === 'voice';
  const emergency = result.emergencyResponse;
  const dosAndDonts = emergency?.dosAndDonts || [];

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: '#A5D6A7',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: '#E8F5E9',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.primaryDark }}>
            Emergency Dispatched
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            {emergency?.message || 'Responders have been alerted'}
          </Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* AI classification (voice) */}
      {isVoice && result.transcript && (
        <View style={{ backgroundColor: '#F3E5F5', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#7B1FA2', marginBottom: 4 }}>
            AI ANALYSIS
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 }}>
            Detected: {result.classifiedEmergencyType?.replace(/_/g, ' ')} •{' '}
            {result.classifiedSeverity}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' }}>
            "{result.transcript}"
          </Text>
        </View>
      )}

      {/* Livestock AI diagnosis */}
      {!isVoice && result.aiDiagnosis && (
        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#E65100', marginBottom: 4 }}>
            VETERINARY AI ANALYSIS
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 }}>
            {result.aiDiagnosis}
          </Text>
          {result.immediateAdvice && (
            <Text style={{ fontSize: 12, color: '#E65100', marginTop: 6, fontWeight: '600' }}>
              Advice: {result.immediateAdvice}
            </Text>
          )}
        </View>
      )}

      {/* Responders */}
      {(emergency?.notifiedDoctors?.length > 0 || emergency?.notifiedDrivers?.length > 0) && (
        <View style={{ backgroundColor: '#E3F2FD', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#1565C0', marginBottom: 6 }}>
            RESPONDERS NOTIFIED
          </Text>
          {emergency.notifiedDoctors?.map((d, i) => (
            <Text key={`d-${i}`} style={{ fontSize: 13, color: COLORS.textSecondary }}>
              🩺 {d}
            </Text>
          ))}
          {emergency.notifiedDrivers?.map((d, i) => (
            <Text key={`v-${i}`} style={{ fontSize: 13, color: COLORS.textSecondary }}>
              🚗 {d}
            </Text>
          ))}
        </View>
      )}

      {/* Do's and Don'ts */}
      {dosAndDonts.length > 0 && (
        <View style={{ backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#F57F17', marginBottom: 6 }}>
            IMPORTANT GUIDELINES
          </Text>
          {dosAndDonts.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={{ fontSize: 13, color: item.startsWith('DON') ? '#C62828' : '#2E7D32' }}>
                {item.startsWith('DO:') ? '✅ ' : item.startsWith("DON'T") ? '❌ ' : '• '}
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 19 }}>
                {item.replace(/^(DO:|DON'T:)\s*/, '')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Cluster alert */}
      {emergency?.clusterAlertTriggered && (
        <View
          style={{
            backgroundColor: '#FFEBEE',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: '#EF9A9A',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#C62828', marginBottom: 4 }}>
            ⚠️ CLUSTER ALERT
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
            {emergency.clusterAlertMessage}
          </Text>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
//  MODAL HEADER
// ═══════════════════════════════════════════════════════════

const ModalHeader = ({ title, subtitle, icon, iconColor, iconBg, onClose }) => (
  <View style={es.modalHeader}>
    <TouchableOpacity onPress={onClose} style={es.modalCloseBtn} activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
    </TouchableOpacity>
    <View style={[es.modalHeaderIconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={es.modalHeaderTitle}>{title}</Text>
      {subtitle && <Text style={es.modalHeaderSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════
//  EMERGENCY OPTIONS DATA
// ═══════════════════════════════════════════════════════════

const EMERGENCY_OPTIONS = [
  {
    key: 'voice',
    icon: 'mic',
    color: '#F44336',
    bg: '#FFEBEE',
    title: 'Voice SOS',
    subtitle: 'Record a voice message — AI classifies & dispatches help instantly',
    number: '01',
  },
  {
    key: 'livestock',
    icon: 'paw',
    color: '#FF6D00',
    bg: '#FFF3E0',
    title: 'Livestock Emergency',
    subtitle: 'Upload a photo + description for veterinary AI diagnosis',
    number: '02',
  },
  {
    key: 'postDisaster',
    icon: 'shield-checkmark',
    color: '#1565C0',
    bg: '#E3F2FD',
    title: 'Post-Disaster Relief',
    subtitle: 'Browse government aid schemes after natural disasters',
    number: '03',
  },
];

// ═══════════════════════════════════════════════════════════
//  EMERGENCY SCREEN
// ═══════════════════════════════════════════════════════════

const EmergencyScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { profile } = useAppSelector((s) => s.auth);
  const {
    voiceEmergencyResponse,
    voiceEmergencyLoading,
    voiceEmergencyError,
    livestockEmergencyResponse,
    livestockEmergencyLoading,
    livestockEmergencyError,
  } = useAppSelector((s) => s.emergency);
  const { schemes: allSchemes, schemesLoading } = useAppSelector((s) => s.schemes);

  const [activeModal, setActiveModal] = useState(null);

  // Fetch post-disaster schemes on mount
  useEffect(() => {
    dispatch(browseSchemes({ category: 'POST_DISASTER' }));
  }, [dispatch]);

  const postDisasterSchemes = Array.isArray(allSchemes) ? allSchemes : [];

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return { latitude: 17.385, longitude: 78.4867 };
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch {
      return { latitude: 17.385, longitude: 78.4867 };
    }
  };

  const handleVoiceSubmit = async (uri) => {
    if (!profile?.id) {
      Alert.alert('Login Required', 'Please login to use emergency services.');
      return;
    }
    const loc = await getLocation();
    dispatch(
      submitVoiceEmergency({
        farmerId: profile.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        voiceFile: { uri, fileName: 'emergency_voice.wav', type: 'audio/wav' },
      })
    );
  };

  const handleLivestockSubmit = async ({ image, description }) => {
    if (!profile?.id) {
      Alert.alert('Login Required', 'Please login to use emergency services.');
      return;
    }
    const loc = await getLocation();
    dispatch(
      submitLivestockEmergency({
        farmerId: profile.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        description,
        image: {
          uri: image.uri,
          fileName: image.fileName || 'livestock.jpg',
          type: image.type || 'image/jpeg',
        },
      })
    );
  };

  const clearResults = () => dispatch(clearEmergencyState());
  const closeModal = () => setActiveModal(null);

  // Show alerts for errors
  useEffect(() => {
    if (voiceEmergencyError) Alert.alert('Voice SOS Error', voiceEmergencyError);
    if (livestockEmergencyError) Alert.alert('Livestock Error', livestockEmergencyError);
  }, [voiceEmergencyError, livestockEmergencyError]);

  return (
    <View style={es.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={es.header}>
        <View style={es.headerRow}>
          <View style={es.headerIconBox}>
            <Ionicons name="warning" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={es.headerTitle}>Emergency</Text>
            <Text style={es.headerSubtitle}>AI-powered emergency dispatch</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={es.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={es.infoBanner}>
          <View style={es.infoBannerIconCircle}>
            <Ionicons name="call" size={16} color="#F44336" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={es.infoBannerTitle}>
              For life-threatening emergencies, call 112
            </Text>
            <Text style={es.infoBannerSubtitle}>
              This service dispatches nearby responders via AI
            </Text>
          </View>
        </View>

        {/* Result banners */}
        {voiceEmergencyResponse && (
          <TouchableOpacity
            onPress={() => setActiveModal('voice')}
            activeOpacity={0.7}
            style={es.resultBanner}
          >
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={es.resultBannerText}>Voice SOS result ready — tap to view</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.success} />
          </TouchableOpacity>
        )}
        {livestockEmergencyResponse && (
          <TouchableOpacity
            onPress={() => setActiveModal('livestock')}
            activeOpacity={0.7}
            style={es.resultBanner}
          >
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={es.resultBannerText}>Livestock result ready — tap to view</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.success} />
          </TouchableOpacity>
        )}

        {/* Emergency Option Cards */}
        <Text style={es.sectionLabel}>Choose Emergency Type</Text>

        {EMERGENCY_OPTIONS.map((opt) => {
          const isLoading =
            (opt.key === 'voice' && voiceEmergencyLoading) ||
            (opt.key === 'livestock' && livestockEmergencyLoading);

          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setActiveModal(opt.key)}
              activeOpacity={0.7}
              style={es.optionCard}
            >
              <View style={[es.optionAccent, { backgroundColor: opt.color }]} />
              <View style={es.optionInner}>
                <View style={es.optionRow}>
                  <View style={[es.optionIconBox, { backgroundColor: opt.bg }]}>
                    <Ionicons name={opt.icon} size={24} color={opt.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Text style={[es.optionNumber, { color: opt.color }]}>{opt.number}</Text>
                      <Text style={es.optionTitle}>{opt.title}</Text>
                    </View>
                    <Text style={es.optionSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <View style={[es.optionArrow, { backgroundColor: opt.bg }]}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={opt.color} />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={opt.color} />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* How it works */}
        <View style={es.howItWorksCard}>
          <Text style={es.howItWorksTitle}>How it works</Text>
          {[
            { icon: 'mic', color: '#F44336', text: 'Record a voice message describing your emergency' },
            { icon: 'analytics', color: '#7B1FA2', text: 'AI classifies the emergency type and severity' },
            { icon: 'people', color: '#1565C0', text: 'Nearby doctors & drivers are notified via SMS' },
            { icon: 'shield-checkmark', color: '#2E7D32', text: "You receive do's and don'ts immediately" },
          ].map((step, i) => (
            <View key={i} style={es.howStep}>
              <View style={[es.howStepIcon, { backgroundColor: step.color + '15' }]}>
                <Ionicons name={step.icon} size={18} color={step.color} />
              </View>
              <Text style={es.howStepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ═══════ VOICE SOS MODAL ═══════ */}
      <Modal
        visible={activeModal === 'voice'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={es.modalContainer}>
          <ModalHeader
            title="Voice SOS"
            subtitle="Record and send emergency"
            icon="mic"
            iconColor="#F44336"
            iconBg="#FFEBEE"
            onClose={closeModal}
          />
          <ScrollView
            contentContainerStyle={es.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {voiceEmergencyResponse && (
              <ResultCard result={voiceEmergencyResponse} type="voice" onDismiss={clearResults} />
            )}
            <VoiceSOSCard onRecordComplete={handleVoiceSubmit} loading={voiceEmergencyLoading} />
          </ScrollView>
        </View>
      </Modal>

      {/* ═══════ LIVESTOCK MODAL ═══════ */}
      <Modal
        visible={activeModal === 'livestock'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={es.modalContainer}>
          <ModalHeader
            title="Livestock Emergency"
            subtitle="Photo + description for vet AI"
            icon="paw"
            iconColor="#FF6D00"
            iconBg="#FFF3E0"
            onClose={closeModal}
          />
          <ScrollView
            contentContainerStyle={es.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {livestockEmergencyResponse && (
              <ResultCard result={livestockEmergencyResponse} type="livestock" onDismiss={clearResults} />
            )}
            <LivestockCard onSubmit={handleLivestockSubmit} loading={livestockEmergencyLoading} />
          </ScrollView>
        </View>
      </Modal>

      {/* ═══════ POST-DISASTER MODAL ═══════ */}
      <Modal
        visible={activeModal === 'postDisaster'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={es.modalContainer}>
          <ModalHeader
            title="Post-Disaster Relief"
            subtitle="Government aid after disasters"
            icon="shield-checkmark"
            iconColor="#1565C0"
            iconBg="#E3F2FD"
            onClose={closeModal}
          />
          <ScrollView
            contentContainerStyle={es.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {schemesLoading ? (
              <View style={es.centerWrap}>
                <View style={es.loadingCircle}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
                <Text style={es.centerText}>Loading schemes...</Text>
              </View>
            ) : postDisasterSchemes.length === 0 ? (
              <View style={es.centerWrap}>
                <View style={[es.loadingCircle, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="information-circle-outline" size={36} color={COLORS.textMuted} />
                </View>
                <Text style={es.centerText}>
                  No post-disaster schemes available at this time
                </Text>
              </View>
            ) : (
              postDisasterSchemes.map((scheme) => (
                <TouchableOpacity
                  key={scheme.schemeId || scheme.id}
                  onPress={() => {
                    closeModal();
                    setTimeout(() => {
                      navigation.navigate(SCREENS.SCHEME_DETAIL, {
                        schemeId: scheme.schemeId || scheme.id,
                      });
                    }, 300);
                  }}
                  activeOpacity={0.7}
                  style={es.schemeRow}
                >
                  <View style={es.schemeIconBox}>
                    <Ionicons name="document-text" size={20} color="#E65100" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={es.schemeName} numberOfLines={1}>
                      {scheme.schemeName || scheme.name}
                    </Text>
                    <Text style={es.schemeDesc} numberOfLines={2}>
                      {scheme.description || 'Tap to view details and check eligibility'}
                    </Text>
                    {scheme.state && (
                      <View style={es.schemeBadge}>
                        <Text style={es.schemeBadgeText}>{scheme.state}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#E65100" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════

const es = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  infoBannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBannerTitle: { fontSize: 13, fontWeight: '700', color: '#C62828' },
  infoBannerSubtitle: { fontSize: 11, color: '#E57373', marginTop: 2 },

  // Result banner
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  resultBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#2E7D32', marginLeft: 10 },

  // Section label
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 12,
    marginTop: 4,
  },

  // Option cards
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionAccent: {
    width: 5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  optionInner: { flex: 1, padding: 16 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionNumber: { fontSize: 11, fontWeight: '800', marginRight: 6, opacity: 0.5 },
  optionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },
  optionSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, lineHeight: 17 },
  optionArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // How it works
  howItWorksCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  howItWorksTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 14 },
  howStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  howStepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  howStepText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  modalHeaderSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  modalScroll: { padding: 16, paddingBottom: 60 },

  // Center wrap / loading
  centerWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLighter + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },

  // Scheme rows
  schemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFF8E1',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  schemeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  schemeName: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  schemeDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  schemeBadge: {
    marginTop: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  schemeBadgeText: { fontSize: 10, fontWeight: '600', color: '#1565C0' },
});

export default EmergencyScreen;
