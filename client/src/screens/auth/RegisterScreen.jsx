import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  registerFarmer,
  clearAuthErrors,
  clearRegisterSuccess,
} from '../../store/slices/authSlice';
import { SCREENS, COLORS } from '../../constants';
import {
  STATES,
  DISTRICTS,
  MANDALS,
  LANGUAGES,
  LANGUAGE_MAP,
  TRANSLATIONS,
} from '../../constants/locationData';

// ─── Step 1: Language Selection ──────────────────────────────────

const LanguageStep = ({ selectedLang, onSelect, onContinue }) => {
  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.EN;

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 36 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Ionicons name="language" size={36} color={COLORS.white} />
        </View>
        <Text
          style={{ fontSize: 24, fontWeight: '800', color: COLORS.primaryDark }}
        >
          {t.chooseLang}
        </Text>
        <Text
          style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}
        >
          {t.chooseLangSub}
        </Text>
      </View>

      {/* Language Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {LANGUAGES.map((l) => {
          const isActive = selectedLang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              onPress={() => onSelect(l.code)}
              activeOpacity={0.8}
              style={{
                width: '48%',
                backgroundColor: isActive ? COLORS.selectedBg : COLORS.white,
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive ? COLORS.primary : COLORS.border,
                borderRadius: 14,
                paddingVertical: 16,
                paddingHorizontal: 14,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 10 }}>{l.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: isActive ? COLORS.primary : COLORS.textPrimary,
                  }}
                >
                  {l.nativeLabel}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.textMuted,
                    marginTop: 1,
                  }}
                >
                  {l.label}
                </Text>
              </View>
              {isActive && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        style={{
          marginTop: 24,
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
        }}
      >
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '700' }}>
          {t.continueBtn}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color={COLORS.white}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── Dropdown Picker Component ───────────────────────────────────

const DropdownPicker = ({
  label,
  placeholder,
  data,
  value,
  onSelect,
  disabled,
  icon,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedItem = data?.find((item) => item.id === value);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: COLORS.textPrimary,
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: disabled ? '#F3F4F6' : COLORS.white,
          borderWidth: 1.5,
          borderColor: disabled ? '#E5E7EB' : COLORS.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
      >
        <Ionicons
          name={icon || 'location-outline'}
          size={20}
          color={disabled ? '#D1D5DB' : COLORS.textMuted}
        />
        <Text
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 15,
            color: selectedItem ? COLORS.textPrimary : '#9CA3AF',
          }}
        >
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? '#D1D5DB' : COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 18,
              maxHeight: 400,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: COLORS.primaryDark,
                }}
              >
                {label}
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={data || []}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isSelected = item.id === value;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item.id);
                      setVisible(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      backgroundColor: isSelected
                        ? COLORS.selectedBg
                        : COLORS.white,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: isSelected
                          ? COLORS.primary
                          : COLORS.textPrimary,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── Step 2: Registration Form ───────────────────────────────────

const FormStep = ({
  lang,
  navigation,
  dispatch,
  registerLoading,
  registerError,
  registerSuccess,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  // Form fields
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cascading dropdowns
  const [stateId, setStateId] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [mandalId, setMandalId] = useState(null);

  // API loaded data
  const [statesList, setStatesList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [mandalList, setMandalList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals, setLoadingMandals] = useState(false);

  // GPS
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [localError, setLocalError] = useState('');

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetch('http://localhost:8080/api/farmers/locations/states');
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setStatesList(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
        setLocalError('Failed to load states');
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (stateId) {
      const fetchDistricts = async () => {
        try {
          setLoadingDistricts(true);
          setDistrictList([]);
          setDistrictId(null);
          setMandalId(null);
          const response = await fetch(`http://localhost:8080/api/farmers/locations/districts/${stateId}`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            setDistrictList(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch districts:', error);
          setLocalError('Failed to load districts');
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    }
  }, [stateId]);

  // Fetch mandals when district changes
  useEffect(() => {
    if (districtId) {
      const fetchMandals = async () => {
        try {
          setLoadingMandals(true);
          setMandalList([]);
          setMandalId(null);
          const response = await fetch(`http://localhost:8080/api/farmers/locations/mandals/${districtId}`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            setMandalList(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch mandals:', error);
          setLocalError('Failed to load mandals');
        } finally {
          setLoadingMandals(false);
        }
      };
      fetchMandals();
    }
  }, [districtId]);

  // Navigate on success
  useEffect(() => {
    if (registerSuccess) {
      dispatch(clearRegisterSuccess());
      Alert.alert('Success', 'Account created! Please sign in.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate(SCREENS.LOGIN, { language: lang }),
        },
      ]);
    }
  }, [registerSuccess, dispatch, navigation, lang]);

  // Handle state change
  const handleStateSelect = useCallback((id) => {
    setStateId(id);
  }, []);

  // Handle district change
  const handleDistrictSelect = useCallback((id) => {
    setDistrictId(id);
  }, []);

  // Capture GPS
  const captureLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to register.'
        );
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
    } catch {
      Alert.alert('Error', 'Failed to capture location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Submit
  const handleRegister = () => {
    setLocalError('');
    dispatch(clearAuthErrors());

    // Validate
    if (
      !fullName.trim() ||
      !userName.trim() ||
      !phoneNumber.trim() ||
      !dob.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setLocalError(t.fillAll);
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      setLocalError(t.invalidPhone);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError(t.passwordMismatch);
      return;
    }
    if (!stateId) {
      setLocalError(t.selectState);
      return;
    }
    if (!districtId) {
      setLocalError(t.selectDistrict);
      return;
    }
    if (!mandalId) {
      setLocalError(t.fillAll);
      return;
    }
    if (latitude === null || longitude === null) {
      setLocalError(t.locationRequired);
      return;
    }

    dispatch(
      registerFarmer({
        phoneNumber: phoneNumber.trim(),
        userName: userName.trim(),
        password,
        fullName: fullName.trim(),
        dob: dob.trim(), // "YYYY-MM-DD"
        language: LANGUAGE_MAP[lang], // EN → ENGLISH, HI → HINDI, TE → TELUGU
        stateId,
        districtId,
        mandalId,
        latitude,
        longitude,
      })
    );
  };

  const displayError = localError || registerError;

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
      {/* ─── Header ─── */}
      <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 28 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Ionicons name="person-add" size={30} color={COLORS.white} />
        </View>
        <Text
          style={{ fontSize: 22, fontWeight: '800', color: COLORS.primaryDark }}
        >
          {t.registerTitle}
        </Text>
        <Text
          style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 2 }}
        >
          {t.registerSubtitle}
        </Text>
      </View>

      {/* ─── Error Banner ─── */}
      {displayError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text
            style={{
              color: COLORS.error,
              fontSize: 13,
              marginLeft: 8,
              flex: 1,
            }}
          >
            {displayError}
          </Text>
        </View>
      ) : null}

      {/* ─── Full Name ─── */}
      <InputField
        label={t.fullName}
        placeholder={t.fullNamePlaceholder}
        icon="person-outline"
        value={fullName}
        onChangeText={setFullName}
        disabled={registerLoading}
      />

      {/* ─── Username ─── */}
      <InputField
        label={t.username}
        placeholder={t.usernamePlaceholder}
        icon="at-outline"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
        disabled={registerLoading}
      />

      {/* ─── Phone Number ─── */}
      <InputField
        label={t.phoneNumber}
        placeholder={t.phonePlaceholder}
        icon="call-outline"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        disabled={registerLoading}
      />

      {/* ─── Date of Birth ─── */}
      <InputField
        label={t.dob}
        placeholder={t.dobPlaceholder}
        icon="calendar-outline"
        value={dob}
        onChangeText={setDob}
        disabled={registerLoading}
      />

      {/* ─── Section: Location ─── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          marginTop: 8,
        }}
      >
        <MaterialCommunityIcons
          name="map-marker-radius"
          size={18}
          color={COLORS.primary}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: COLORS.primaryDark,
            marginLeft: 6,
          }}
        >
          {t.state} / {t.district} / {t.mandal}
        </Text>
      </View>

      {/* ─── State Dropdown ─── */}
      <DropdownPicker
        label={t.state}
        placeholder={loadingStates ? 'Loading...' : t.statePlaceholder}
        data={statesList}
        value={stateId}
        onSelect={handleStateSelect}
        disabled={loadingStates}
        icon="flag-outline"
      />

      {/* ─── District Dropdown ─── */}
      <DropdownPicker
        label={t.district}
        placeholder={
          stateId ? t.districtPlaceholder : t.selectState
        }
        data={districtList}
        value={districtId}
        onSelect={handleDistrictSelect}
        disabled={!stateId}
        icon="business-outline"
      />

      {/* ─── Mandal Dropdown ─── */}
      <DropdownPicker
        label={t.mandal}
        placeholder={
          districtId ? t.mandalPlaceholder : t.selectDistrict
        }
        data={mandalList}
        value={mandalId}
        onSelect={setMandalId}
        disabled={!districtId}
        icon="map-outline"
      />

      {/* ─── GPS Location ─── */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: COLORS.textPrimary,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          {t.location}
        </Text>
        <TouchableOpacity
          onPress={captureLocation}
          disabled={locationLoading || registerLoading}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor:
              latitude !== null ? COLORS.selectedBg : COLORS.white,
            borderWidth: 1.5,
            borderColor:
              latitude !== null ? COLORS.primary : COLORS.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons
              name={latitude !== null ? 'checkmark-circle' : 'navigate-outline'}
              size={20}
              color={latitude !== null ? COLORS.primary : COLORS.textMuted}
            />
          )}
          <Text
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 14,
              color:
                latitude !== null ? COLORS.primary : COLORS.textMuted,
              fontWeight: latitude !== null ? '600' : '400',
            }}
          >
            {locationLoading
              ? t.locationFetching
              : latitude !== null
              ? `${t.locationFetched} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
              : t.locationBtn}
          </Text>
          {latitude === null && !locationLoading && (
            <Ionicons
              name="arrow-forward-circle-outline"
              size={20}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Password ─── */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: COLORS.textPrimary,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          {t.password}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.white,
            borderWidth: 1.5,
            borderColor: COLORS.border,
            borderRadius: 14,
            paddingHorizontal: 14,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLORS.textMuted}
          />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 10,
              fontSize: 15,
              color: COLORS.textPrimary,
            }}
            placeholder={t.passwordPlaceholder}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!registerLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Confirm Password ─── */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: COLORS.textPrimary,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          {t.confirmPassword}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.white,
            borderWidth: 1.5,
            borderColor: COLORS.border,
            borderRadius: 14,
            paddingHorizontal: 14,
          }}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={COLORS.textMuted}
          />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 10,
              fontSize: 15,
              color: COLORS.textPrimary,
            }}
            placeholder={t.confirmPasswordPlaceholder}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!registerLoading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Register Button ─── */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={registerLoading}
        activeOpacity={0.85}
        style={{
          marginTop: 12,
          backgroundColor: registerLoading
            ? COLORS.primaryLight
            : COLORS.primary,
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
        }}
      >
        {registerLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.white}
            style={{ marginRight: 8 }}
          />
        ) : (
          <Ionicons
            name="checkmark-done-outline"
            size={20}
            color={COLORS.white}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          style={{ color: COLORS.white, fontSize: 16, fontWeight: '700' }}
        >
          {registerLoading ? t.registering : t.register}
        </Text>
      </TouchableOpacity>

      {/* ─── Login Link ─── */}
      <TouchableOpacity
        style={{ marginTop: 24, alignItems: 'center', paddingVertical: 8 }}
        onPress={() => navigation.navigate(SCREENS.LOGIN, { language: lang })}
        disabled={registerLoading}
      >
        <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
          {t.hasAccount}{' '}
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
            {t.loginLink}
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Reusable Input Field ────────────────────────────────────────

const InputField = ({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  autoCapitalize,
  keyboardType,
  disabled,
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 14,
        paddingHorizontal: 14,
      }}
    >
      <Ionicons name={icon} size={20} color={COLORS.textMuted} />
      <TextInput
        style={{
          flex: 1,
          paddingVertical: 14,
          paddingHorizontal: 10,
          fontSize: 15,
          color: COLORS.textPrimary,
        }}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize={autoCapitalize || 'words'}
        keyboardType={keyboardType || 'default'}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
      />
    </View>
  </View>
);

// ─── Main RegisterScreen ─────────────────────────────────────────

const RegisterScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { registerLoading, registerError, registerSuccess } = useAppSelector(
    (state) => state.auth
  );

  const [step, setStep] = useState(1); // 1 = language, 2 = form
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    dispatch(clearAuthErrors());
    dispatch(clearRegisterSuccess());
  }, [dispatch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step indicator */}
          {step === 2 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setStep(1)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.selectedBg,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={COLORS.primary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.primary,
                    fontWeight: '600',
                    marginLeft: 4,
                  }}
                >
                  {LANGUAGES.find((l) => l.code === language)?.nativeLabel}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 1 ? (
            <LanguageStep
              selectedLang={language}
              onSelect={setLanguage}
              onContinue={() => setStep(2)}
            />
          ) : (
            <FormStep
              lang={language}
              navigation={navigation}
              dispatch={dispatch}
              registerLoading={registerLoading}
              registerError={registerError}
              registerSuccess={registerSuccess}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
