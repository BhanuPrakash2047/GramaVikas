import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

export const createScheme = createAsyncThunk(
  'schemes/createScheme',
  async (schemeData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/schemes/create', schemeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const browseSchemes = createAsyncThunk(
  'schemes/browseSchemes',
  async ({ state, category, language } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (state) params.state = state;
      if (category) params.category = category;
      if (language) params.language = language;
      const response = await apiClient.get('/schemes/browse', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchSchemeDetail = createAsyncThunk(
  'schemes/fetchSchemeDetail',
  async ({ schemeId, language = 'EN' }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/schemes/${schemeId}`, {
        params: { language },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const saveUserFields = createAsyncThunk(
  'schemes/saveUserFields',
  async (userFieldData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/schemes/user-fields', userFieldData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const checkEligibility = createAsyncThunk(
  'schemes/checkEligibility',
  async (eligibilityData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        '/schemes/check-eligibility',
        eligibilityData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchMissingFields = createAsyncThunk(
  'schemes/fetchMissingFields',
  async ({ schemeId, farmerId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/schemes/${schemeId}/missing-fields`,
        { params: { farmerId } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  // Scheme list (browse)
  schemes: [],
  schemesLoading: false,
  schemesError: null,

  // Scheme detail
  selectedScheme: null,
  schemeDetailLoading: false,
  schemeDetailError: null,

  // Create scheme
  createSchemeLoading: false,
  createSchemeError: null,
  createSchemeSuccess: false,
  createdScheme: null,

  // User fields
  saveFieldsLoading: false,
  saveFieldsError: null,
  saveFieldsSuccess: false,

  // Eligibility check
  eligibilityResult: null,
  eligibilityLoading: false,
  eligibilityError: null,

  // Missing fields
  missingFields: null,
  missingFieldsLoading: false,
  missingFieldsError: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const schemeSlice = createSlice({
  name: 'schemes',
  initialState,
  reducers: {
    clearSchemeErrors(state) {
      state.schemesError = null;
      state.schemeDetailError = null;
      state.createSchemeError = null;
      state.saveFieldsError = null;
      state.eligibilityError = null;
    },
    clearSelectedScheme(state) {
      state.selectedScheme = null;
      state.schemeDetailError = null;
    },
    clearCreateSchemeSuccess(state) {
      state.createSchemeSuccess = false;
      state.createdScheme = null;
    },
    clearSaveFieldsSuccess(state) {
      state.saveFieldsSuccess = false;
    },
    clearEligibilityResult(state) {
      state.eligibilityResult = null;
      state.eligibilityError = null;
    },
    clearMissingFields(state) {
      state.missingFields = null;
      state.missingFieldsError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Create Scheme ──
    builder
      .addCase(createScheme.pending, (state) => {
        state.createSchemeLoading = true;
        state.createSchemeError = null;
        state.createSchemeSuccess = false;
        state.createdScheme = null;
      })
      .addCase(createScheme.fulfilled, (state, action) => {
        state.createSchemeLoading = false;
        state.createSchemeSuccess = true;
        state.createdScheme = action.payload?.data || null;
        state.createSchemeError = null;
      })
      .addCase(createScheme.rejected, (state, action) => {
        state.createSchemeLoading = false;
        state.createSchemeError =
          action.payload?.message || 'Failed to create scheme';
        state.createSchemeSuccess = false;
      });

    // ── Browse Schemes ──
    builder
      .addCase(browseSchemes.pending, (state) => {
        state.schemesLoading = true;
        state.schemesError = null;
      })
      .addCase(browseSchemes.fulfilled, (state, action) => {
        state.schemesLoading = false;
        state.schemes = action.payload?.data || [];
        state.schemesError = null;
      })
      .addCase(browseSchemes.rejected, (state, action) => {
        state.schemesLoading = false;
        state.schemesError =
          action.payload?.message || 'Failed to fetch schemes';
      });

    // ── Scheme Detail ──
    builder
      .addCase(fetchSchemeDetail.pending, (state) => {
        state.schemeDetailLoading = true;
        state.schemeDetailError = null;
      })
      .addCase(fetchSchemeDetail.fulfilled, (state, action) => {
        state.schemeDetailLoading = false;
        state.selectedScheme = action.payload?.data || null;
        state.schemeDetailError = null;
      })
      .addCase(fetchSchemeDetail.rejected, (state, action) => {
        state.schemeDetailLoading = false;
        state.schemeDetailError =
          action.payload?.message || 'Failed to fetch scheme detail';
      });

    // ── Save User Fields ──
    builder
      .addCase(saveUserFields.pending, (state) => {
        state.saveFieldsLoading = true;
        state.saveFieldsError = null;
        state.saveFieldsSuccess = false;
      })
      .addCase(saveUserFields.fulfilled, (state) => {
        state.saveFieldsLoading = false;
        state.saveFieldsSuccess = true;
        state.saveFieldsError = null;
      })
      .addCase(saveUserFields.rejected, (state, action) => {
        state.saveFieldsLoading = false;
        state.saveFieldsError =
          action.payload?.message || 'Failed to save user fields';
        state.saveFieldsSuccess = false;
      });

    // ── Check Eligibility ──
    builder
      .addCase(checkEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.eligibilityError = null;
        state.eligibilityResult = null;
      })
      .addCase(checkEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityResult = action.payload?.data || null;
        state.eligibilityError = null;
      })
      .addCase(checkEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityError =
          action.payload?.message || 'Eligibility check failed';
      });

    // ── Missing Fields ──
    builder
      .addCase(fetchMissingFields.pending, (state) => {
        state.missingFieldsLoading = true;
        state.missingFieldsError = null;
        state.missingFields = null;
      })
      .addCase(fetchMissingFields.fulfilled, (state, action) => {
        state.missingFieldsLoading = false;
        state.missingFields = action.payload?.data || null;
        state.missingFieldsError = null;
      })
      .addCase(fetchMissingFields.rejected, (state, action) => {
        state.missingFieldsLoading = false;
        state.missingFieldsError =
          action.payload?.message || 'Failed to fetch missing fields';
      });
  },
});

export const {
  clearSchemeErrors,
  clearSelectedScheme,
  clearCreateSchemeSuccess,
  clearSaveFieldsSuccess,
  clearEligibilityResult,
  clearMissingFields,
} = schemeSlice.actions;

export default schemeSlice.reducer;
