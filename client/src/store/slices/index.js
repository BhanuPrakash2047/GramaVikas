// ─── Auth Slice ──────────────────────────────────────────────────
export { default as authReducer } from './authSlice';
export {
  registerFarmer,
  loginFarmer,
  changePassword,
  fetchUserProfile,
  validateToken,
  updateFarmerLocation,
  fetchNearbyFarmers,
  updateFarmerLanguage,
  logout,
  clearAuthErrors,
  clearRegisterSuccess,
  clearChangePasswordSuccess,
  clearLocationUpdateSuccess,
} from './authSlice';

// ─── Diagnostic Slice ────────────────────────────────────────────
export { default as diagnosticReducer } from './diagnosticSlice';
export {
  diagnoseWeb,
  fetchDiagnosticHistory,
  fetchFarmerDashboard,
  fetchLocationDashboard,
  clearDiagnosisResult,
  clearDiagnosticErrors,
  clearDashboard,
} from './diagnosticSlice';

// ─── Scheme Slice ────────────────────────────────────────────────
export { default as schemeReducer } from './schemeSlice';
export {
  createScheme,
  browseSchemes,
  fetchSchemeDetail,
  saveUserFields,
  checkEligibility,
  fetchMissingFields,
  clearSchemeErrors,
  clearSelectedScheme,
  clearCreateSchemeSuccess,
  clearSaveFieldsSuccess,
  clearEligibilityResult,
  clearMissingFields,
} from './schemeSlice';

// ─── Emergency Slice ─────────────────────────────────────────────
export { default as emergencyReducer } from './emergencySlice';
export {
  createEmergency,
  submitVoiceEmergency,
  submitLivestockEmergency,
  clearEmergencyState,
  clearEmergencyErrors,
} from './emergencySlice';

// ─── Notification Slice ──────────────────────────────────────────
export { default as notificationReducer } from './notificationSlice';
export {
  fetchNotifications,
  fetchUnreadNotifications,
  markNotificationAsRead,
  clearNotificationErrors,
  clearNotifications,
} from './notificationSlice';

// ─── Driver Slice ────────────────────────────────────────────────
export { default as driverReducer } from './driverSlice';
export {
  registerDriver,
  updateDriverAvailability,
  fetchNearbyDrivers,
  clearDriverErrors,
  clearDriverRegisterSuccess,
  clearDriverAvailabilitySuccess,
} from './driverSlice';

// ─── Doctor Slice ────────────────────────────────────────────────
export { default as doctorReducer } from './doctorSlice';
export {
  registerDoctor,
  updateDoctorAvailability,
  clearDoctorErrors,
  clearDoctorRegisterSuccess,
  clearDoctorAvailabilitySuccess,
} from './doctorSlice';

// ─── IVRS Slice ──────────────────────────────────────────────────
export { default as ivrsReducer } from './ivrsSlice';
export {
  triggerIncomingCall,
  submitMenuSelection,
  processSymptoms,
  clearIvrsState,
  clearIvrsErrors,
} from './ivrsSlice';
