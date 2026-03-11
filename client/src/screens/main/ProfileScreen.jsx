import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchUserProfile,
  updateFarmerProfile,
  logout,
  clearProfileUpdateSuccess,
  clearAuthErrors,
} from '../../store/slices/authSlice';
import { persistor } from '../../store';
import { COLORS } from '../../constants';

// ═══════════════════════════════════════════════════════════
//  EDITABLE FIELD ROW
// ═══════════════════════════════════════════════════════════

const FieldRow = ({ icon, label, value, editable, editing, onChangeText, placeholder, keyboardType }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    }}
  >
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: COLORS.selectedBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}
    >
      <Ionicons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 2 }}>
        {label}
      </Text>
      {editing && editable ? (
        <TextInput
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: COLORS.textPrimary,
            paddingVertical: 2,
            paddingHorizontal: 0,
            borderBottomWidth: 1.5,
            borderBottomColor: COLORS.primary,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType || 'default'}
        />
      ) : (
        <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }}>
          {value || '—'}
        </Text>
      )}
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════
//  LANGUAGE SELECTOR
// ═══════════════════════════════════════════════════════════

const LANGUAGES = [
  { key: 'ENGLISH', label: 'English', emoji: '🇬🇧' },
  { key: 'HINDI', label: 'हिंदी', emoji: '🇮🇳' },
  { key: 'TELUGU', label: 'తెలుగు', emoji: '🇮🇳' },
];

const LanguageSelector = ({ selected, onSelect, editing }) => (
  <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: editing ? 10 : 0 }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: COLORS.selectedBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name="language" size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 2 }}>
          LANGUAGE
        </Text>
        {!editing && (
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }}>
            {LANGUAGES.find((l) => l.key === selected)?.label || selected || '—'}
          </Text>
        )}
      </View>
    </View>
    {editing && (
      <View style={{ flexDirection: 'row', gap: 8, marginLeft: 52 }}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.key}
            onPress={() => onSelect(lang.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: selected === lang.key ? COLORS.primary : '#F5F5F5',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: selected === lang.key ? COLORS.primary : COLORS.border,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: selected === lang.key ? COLORS.white : COLORS.textPrimary }}>
              {lang.emoji} {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

// ═══════════════════════════════════════════════════════════
//  PROFILE SCREEN
// ═══════════════════════════════════════════════════════════

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {
    profile,
    profileLoading,
    userName,
    profileUpdateLoading,
    profileUpdateSuccess,
    profileUpdateError,
  } = useAppSelector((s) => s.auth);

  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Editable local state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [language, setLanguage] = useState('ENGLISH');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Load profile on mount
  useEffect(() => {
    if (userName) {
      dispatch(fetchUserProfile(userName));
    }
  }, [userName, dispatch]);

  // Sync local state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setDob(profile.dob || '');
      setLanguage(profile.language || 'ENGLISH');
      setLatitude(profile.latitude != null ? String(profile.latitude) : '');
      setLongitude(profile.longitude != null ? String(profile.longitude) : '');
    }
  }, [profile]);

  // Handle update success
  useEffect(() => {
    if (profileUpdateSuccess) {
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      dispatch(clearProfileUpdateSuccess());
    }
  }, [profileUpdateSuccess, dispatch]);

  // Handle update errors
  useEffect(() => {
    if (profileUpdateError) {
      Alert.alert('Update Failed', String(profileUpdateError));
      dispatch(clearAuthErrors());
    }
  }, [profileUpdateError, dispatch]);

  const onRefresh = useCallback(() => {
    if (userName) {
      setRefreshing(true);
      dispatch(fetchUserProfile(userName)).finally(() => setRefreshing(false));
    }
  }, [userName, dispatch]);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to set your coordinates.');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(String(loc.coords.latitude));
      setLongitude(String(loc.coords.longitude));
      Alert.alert('Location Updated', `Lat: ${loc.coords.latitude.toFixed(6)}\nLng: ${loc.coords.longitude.toFixed(6)}`);
    } catch (err) {
      console.error('Location error:', err);
      Alert.alert('Error', 'Could not get current location.');
    }
    setLocationLoading(false);
  };

  const handleSave = () => {
    if (!profile?.id) return;

    const profileData = {
      fullName: fullName.trim() || null,
      dob: dob || null,
      language,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    };

    dispatch(updateFarmerProfile({ farmerId: profile.id, profileData }));
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (profile) {
      setFullName(profile.fullName || '');
      setDob(profile.dob || '');
      setLanguage(profile.language || 'ENGLISH');
      setLatitude(profile.latitude != null ? String(profile.latitude) : '');
      setLongitude(profile.longitude != null ? String(profile.longitude) : '');
    }
    setEditing(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        dispatch(logout());
        persistor.purge();
      }
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          persistor.purge();
        },
      },
    ]);
  };

  if (profileLoading && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header / Avatar Area */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: 24,
            paddingBottom: 20,
            backgroundColor: COLORS.background,
          }}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 34, fontWeight: '800', color: COLORS.white }}>
              {(profile?.fullName || profile?.userName || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.primaryDark }}>
            {profile?.fullName || profile?.userName || 'Farmer'}
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
            @{profile?.userName || '—'}
          </Text>
          {profile?.age != null && (
            <View
              style={{
                marginTop: 8,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.selectedBg,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 10,
              }}
            >
              <Ionicons name="calendar" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>
                {profile.age} years old
              </Text>
            </View>
          )}
        </View>

        {/* Edit / Save buttons */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 10 }}>
          {editing ? (
            <>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={profileUpdateLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {profileUpdateLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                )}
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.white }}>
                  {profileUpdateLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="create" size={18} color={COLORS.white} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.white }}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Personal Info Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 20,
            marginHorizontal: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: COLORS.selectedBg,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 }}>
              PERSONAL INFORMATION
            </Text>
          </View>

          <FieldRow
            icon="person"
            label="FULL NAME"
            value={fullName}
            editable
            editing={editing}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />
          <FieldRow
            icon="call"
            label="PHONE"
            value={profile?.phoneNumber}
            editable={false}
            editing={editing}
          />
          <FieldRow
            icon="calendar"
            label="DATE OF BIRTH"
            value={dob}
            editable
            editing={editing}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
          />
          <LanguageSelector selected={language} onSelect={setLanguage} editing={editing} />
        </View>

        {/* Location Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 20,
            marginHorizontal: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: COLORS.selectedBg,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 }}>
              LOCATION
            </Text>
          </View>

          <FieldRow icon="map" label="STATE" value={profile?.stateName} editable={false} editing={editing} />
          <FieldRow icon="business" label="DISTRICT" value={profile?.districtName} editable={false} editing={editing} />
          <FieldRow icon="location" label="MANDAL" value={profile?.mandalName} editable={false} editing={editing} />

          {/* Lat/Long */}
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: COLORS.selectedBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="navigate" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 2 }}>
                GPS COORDINATES
              </Text>
              {editing ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: '600',
                      color: COLORS.textPrimary,
                      borderBottomWidth: 1.5,
                      borderBottomColor: COLORS.primary,
                      paddingVertical: 2,
                    }}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="Lat"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: '600',
                      color: COLORS.textPrimary,
                      borderBottomWidth: 1.5,
                      borderBottomColor: COLORS.primary,
                      paddingVertical: 2,
                    }}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="Lng"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }}>
                  {latitude && longitude
                    ? `${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`
                    : 'Not set'}
                </Text>
              )}
            </View>
          </View>

          {/* Get Current Location button */}
          {editing && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <TouchableOpacity
                onPress={handleGetLocation}
                disabled={locationLoading}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: '#E3F2FD',
                  borderWidth: 1.5,
                  borderColor: '#90CAF9',
                  gap: 8,
                }}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#1565C0" />
                ) : (
                  <Ionicons name="locate" size={20} color="#1565C0" />
                )}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1565C0' }}>
                  {locationLoading ? 'Getting location...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 20,
            marginHorizontal: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: COLORS.selectedBg,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 }}>
              ACCOUNT
            </Text>
          </View>

          <FieldRow icon="person-circle" label="USERNAME" value={profile?.userName} editable={false} editing={editing} />
          <FieldRow
            icon="shield-checkmark"
            label="STATUS"
            value={profile?.isActive ? 'Active' : 'Inactive'}
            editable={false}
            editing={editing}
          />
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: '#FFEBEE',
              borderWidth: 1.5,
              borderColor: '#FFCDD2',
              gap: 8,
            }}
          >
            <Ionicons name="log-out" size={20} color="#F44336" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#F44336' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
