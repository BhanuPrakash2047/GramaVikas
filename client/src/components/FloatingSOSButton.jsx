import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  submitVoiceEmergency,
  clearEmergencyState,
} from '../store/slices/emergencySlice';
import { COLORS } from '../constants';

const { width: SCREEN_W } = Dimensions.get('window');

// ═════════════════════════════════════════════════════════════════
//   SOS VOICE RECORDING MODAL
// ═════════════════════════════════════════════════════════════════

const VoiceRecordingModal = ({ visible, onClose, onSubmit, loading }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      setRecordedUri(null);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
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
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice SOS.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      setRecordedUri(null);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Could not start recording. Please try again.');
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
      console.error('Failed to stop recording', err);
    }
  }, [recording]);

  const handleSend = () => {
    if (recordedUri) {
      onSubmit(recordedUri);
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            width: SCREEN_W * 0.85,
            backgroundColor: COLORS.white,
            borderRadius: 24,
            padding: 28,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}
          >
            <Ionicons name="close" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Title */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: '#FFEBEE',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="mic" size={28} color="#F44336" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 4 }}>
            Voice SOS
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 }}>
            {isRecording
              ? 'Recording... Describe your emergency clearly'
              : recordedUri
              ? 'Recording saved. Send to dispatch emergency responders.'
              : 'Tap the microphone to start recording your emergency'}
          </Text>

          {/* Recording Button */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#F44336" />
              <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontWeight: '600' }}>
                Analyzing & dispatching...
              </Text>
            </View>
          ) : (
            <>
              <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  activeOpacity={0.7}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: isRecording ? '#F44336' : recordedUri ? '#4CAF50' : '#FFCDD2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: isRecording ? '#F44336' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Ionicons
                    name={isRecording ? 'stop' : recordedUri ? 'checkmark' : 'mic'}
                    size={40}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Duration */}
              {(isRecording || recordedUri) && (
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 18,
                    fontWeight: '700',
                    color: isRecording ? '#F44336' : COLORS.textPrimary,
                    letterSpacing: 1,
                  }}
                >
                  {formatDuration(recordingDuration)}
                </Text>
              )}

              {/* Send / Re-record buttons */}
              {recordedUri && !isRecording && (
                <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
                  <TouchableOpacity
                    onPress={startRecording}
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
                    <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.white }}>
                      Send SOS
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ═════════════════════════════════════════════════════════════════
//   EMERGENCY RESULT MODAL
// ═════════════════════════════════════════════════════════════════

const EmergencyResultModal = ({ visible, onClose, result, type }) => {
  if (!visible || !result) return null;

  const isVoice = type === 'voice';
  const emergency = isVoice ? result.emergencyResponse : result.emergencyResponse;
  const dosAndDonts = emergency?.dosAndDonts || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '85%',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#E8F5E9',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="checkmark-circle" size={26} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primaryDark }}>
                Emergency Dispatched
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                {emergency?.message || 'Responders have been notified'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* AI Analysis (Voice) */}
          {isVoice && result.transcript && (
            <View
              style={{
                backgroundColor: '#F3E5F5',
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#7B1FA2', marginBottom: 4 }}>
                AI ANALYSIS
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 }}>
                Detected: {result.classifiedEmergencyType?.replace(/_/g, ' ')} ({result.classifiedSeverity})
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                "{result.transcript}"
              </Text>
            </View>
          )}

          {/* AI Analysis (Livestock) */}
          {!isVoice && result.aiDiagnosis && (
            <View
              style={{
                backgroundColor: '#FFF3E0',
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#E65100', marginBottom: 4 }}>
                VETERINARY AI ANALYSIS
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 }}>
                {result.aiDiagnosis}
              </Text>
              {result.immediateAdvice && (
                <Text style={{ fontSize: 12, color: '#E65100', marginTop: 8, fontWeight: '600' }}>
                  Advice: {result.immediateAdvice}
                </Text>
              )}
            </View>
          )}

          {/* Notified responders */}
          {(emergency?.notifiedDoctors?.length > 0 || emergency?.notifiedDrivers?.length > 0) && (
            <View
              style={{
                backgroundColor: '#E3F2FD',
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1565C0', marginBottom: 6 }}>
                RESPONDERS NOTIFIED
              </Text>
              {emergency.notifiedDoctors?.map((d, i) => (
                <Text key={`doc-${i}`} style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  🩺 {d}
                </Text>
              ))}
              {emergency.notifiedDrivers?.map((d, i) => (
                <Text key={`drv-${i}`} style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  🚗 {d}
                </Text>
              ))}
            </View>
          )}

          {/* Do's and Don'ts */}
          {dosAndDonts.length > 0 && (
            <View
              style={{
                backgroundColor: '#FFF8E1',
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#F57F17', marginBottom: 8 }}>
                IMPORTANT GUIDELINES
              </Text>
              {dosAndDonts.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
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
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#EF9A9A',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#C62828', marginBottom: 4 }}>
                ⚠️ CLUSTER ALERT
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                {emergency.clusterAlertMessage}
              </Text>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.white }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ═════════════════════════════════════════════════════════════════
//   MAIN FLOATING SOS BUTTON (VOICE-ONLY)
// ═════════════════════════════════════════════════════════════════

const FloatingSOSButton = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.auth);
  const {
    voiceEmergencyResponse,
    voiceEmergencyLoading,
  } = useAppSelector((s) => s.emergency);

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Continuous subtle pulse for the SOS button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Show result when voice emergency completes
  useEffect(() => {
    if (voiceEmergencyResponse && showVoiceModal) {
      setShowVoiceModal(false);
      setResultData(voiceEmergencyResponse);
      setShowResult(true);
    }
  }, [voiceEmergencyResponse]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { latitude: 17.385, longitude: 78.4867 };
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch {
      return { latitude: 17.385, longitude: 78.4867 };
    }
  };

  const handleSOSPress = () => {
    dispatch(clearEmergencyState());
    setShowVoiceModal(true);
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
        voiceFile: {
          uri,
          fileName: 'emergency_voice.wav',
          type: 'audio/wav',
        },
      })
    );
  };

  const handleResultClose = () => {
    setShowResult(false);
    setResultData(null);
    dispatch(clearEmergencyState());
  };

  return (
    <>
      {/* Floating SOS Button — tap to directly open voice recording */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 80,
          right: 16,
          zIndex: 999,
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={handleSOSPress}
          activeOpacity={0.8}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#F44336',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#F44336',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 12,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '900', color: COLORS.white, letterSpacing: 1 }}>
            SOS
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Voice Recording Modal */}
      <VoiceRecordingModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSubmit={handleVoiceSubmit}
        loading={voiceEmergencyLoading}
      />

      {/* Result Modal */}
      <EmergencyResultModal
        visible={showResult}
        onClose={handleResultClose}
        result={resultData}
        type="voice"
      />
    </>
  );
};

export default FloatingSOSButton;
