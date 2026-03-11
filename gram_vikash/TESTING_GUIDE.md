# Testing Guide: Diagnosis Notifications & Language Consistency

## Prerequisites
- Java 17+
- Maven
- PostgreSQL (or configured database)
- Python 3.8+ with dependencies installed
- Groq API key configured

---

## 1. Testing Mandal-Based Notifications

### Setup:
1. Create 2-3 farmers in the same mandal via `/api/user/register`
   - Farmer 1: Phone: 9876543210, Mandal: Ambazari, Language: HINDI
   - Farmer 2: Phone: 9876543211, Mandal: Ambazari, Language: ENGLISH
   - Farmer 3: Phone: 9876543212, Mandal: Ambazari, Language: TELUGU

### Test Flow:
```bash
# 1. Submit diagnosis for Farmer 1
POST /api/diagnostic/web
Parameters:
  - userQuery: "My wheat crop has brown spots on leaves with yellow halos"
  - farmerId: 1
  - language: hi
  - region: Maharashtra

# 2. Verify notifications are created for Farmer 2 and 3
GET /api/notification/2
GET /api/notification/3

# Expected: Both farmers should have a DIAGNOSIS_ALERT notification
# Farmer 2's notification should be in English
# Farmer 3's notification should be in Telugu
```

### Expected Response Structure:
```json
{
  "id": 1,
  "farmer": { "id": 2, "fullName": "Ashok Kumar" },
  "notificationType": "DIAGNOSIS_ALERT",
  "title": "Disease Alert: Leaf Spot",
  "message": "A farmer in your area has been diagnosed with Leaf Spot on Wheat (85% confidence). This disease may spread to your crops. Please be alert.",
  "details": "{\"crop\": \"Wheat\", \"disease\": \"Leaf Spot\", \"region\": \"Maharashtra\", \"confidence\": 0.85}",
  "language": "en",
  "isRead": false,
  "createdAt": "2024-02-25T10:30:00"
}
```

---

## 2. Testing Language Consistency

### Test Case 1: Hindi Diagnosis
```bash
POST /api/diagnostic/web
Parameters:
  - userQuery: "मेरी गेहूँ की फसल पर भूरे रंग के धब्बे आ गए हैं"
  - language: hi
  - region: Punjab

# Verification:
# 1. Check response.diagnosis - Should be ONLY in Hindi
# 2. Check response.symptomsMatched - Should be in Hindi
# 3. Check response.managementAdvice - Should be in Hindi
# 4. No English text should appear
```

### Test Case 2: Telugu Diagnosis
```bash
POST /api/diagnostic/web
Parameters:
  - userQuery: "నా వరుస నుండి చేపలు బయటకు వచ్చాయి"
  - language: te
  - region: Andhra Pradesh

# Verification:
# 1. response.diagnosis - ONLY Telugu
# 2. response.symptomsMatched - ONLY Telugu (list items)
# 3. response.managementAdvice - ONLY Telugu (all keys and values)
```

### Test Case 3: Mixed Language Prevention (Negative Test)
```bash
# Request in Telugu should NOT return mixed response like:
{
  "diagnosis": "మీ వరుస..." (Telugu)
  "symptoms": ["Leaf spot", "Wilting"] (English) ❌ WRONG
}

# Should return:
{
  "diagnosis": "మీ వరుస..." (Telugu)
  "symptoms": ["ఆకు నుండి...", "ఔందీ..."] (Telugu) ✓ CORRECT
}
```

---

## 3. Testing Response Conciseness

### Verification:
```bash
# 1. Submit diagnosis
POST /api/diagnostic/web
Parameters:
  - userQuery: "Brown spots on rice leaves with yellow halos"
  - language: en

# 2. Check response structure
{
  "diagnosis": "...", // Should be 200-300 words
  "managementAdvice": {
    "cultural": ["Practice", "Practice"], // MAX 2-3 items
    "chemical": ["Chemical", "Chemical"],
    "preventive": ["Method"] // TOP items only
  }
}

# Word count check: Diagnosis should be concise but complete
# Count words: Should be between 200-300
```

---

## 4. Testing Notification Endpoints

### Get All Notifications:
```bash
GET /api/notification/1
Response: Array of all notifications (ordered by createdAt DESC)
```

### Get Unread Notifications:
```bash
GET /api/notification/1/unread
Response: Array of unread notifications only
```

### Mark Notification as Read:
```bash
PUT /api/notification/1/read
Response: 200 OK
Follow-up: GET /api/notification/1/unread
Expected: Notification 1 should NOT appear in unread list
```

---

## 5. Multi-Farmer Scenario Test

### Setup:
- Farmer A, Farmer B, Farmer C in mandal "Ambazari"
- Farmer D, Farmer E in mandal "Parbhani"

### Test:
```bash
# Diagnosis for Farmer A
POST /api/diagnostic/web (farmerId: A, mandal: Ambazari)

# Check notifications:
GET /api/notification/B  # Should have notification ✓
GET /api/notification/C  # Should have notification ✓
GET /api/notification/D  # Should NOT have notification (different mandal) ✓
GET /api/notification/E  # Should NOT have notification (different mandal) ✓
GET /api/notification/A  # Should NOT have notification (excluded - the diagnosed farmer) ✓
```

---

## 6. Language Enum Mapping Test

### Verify language mapping in DiagnosticService:
```
HINDI → "hi"
TELUGU → "te"
ENGLISH (default) → "en"
```

### Test:
```bash
# Create farmer with HINDI language preference
POST /api/user/register
  language: HINDI

# Request diagnosis without specifying language
POST /api/diagnostic/web (farmerId: <farmer_with_hindi_preference>)

# Expected: Response should be in Hindi automatically (from farmer's preference)
```

---

## 7. Error Handling Tests

### Test 1: Null Mandal (edge case)
```bash
# Farmer with null mandal
POST /api/diagnostic/web (farmerId: <farmer_with_null_mandal>)
# Expected: Diagnosis works, but notification not sent (graceful handling)
# Check logs: "Cannot notify: farmer or mandal is null"
```

### Test 2: Notification Service Failure
```bash
# If NotificationService throws exception:
POST /api/diagnostic/web
# Expected: Diagnosis still returns successfully
# Notification error is logged but doesn't fail the response
```

### Test 3: Translation Service Unavailable
```bash
# If Groq API is down:
POST /api/diagnostic/web (language: hi)
# Expected: Fallback response is used, diagnosis still works
```

---

## 8. Performance Monitoring

### Metrics to Check:
1. **Notification Creation Time**: 
   - For each farmer in mandal, one notification created
   - Check DB logs for insert time

2. **Translation Time**:
   - Diagnosis translation: ~1-2 seconds
   - Symptoms list translation: ~0.5 seconds
   - Management advice translation: ~1-2 seconds

3. **Query Performance**:
   - `findByMandal()` should use index on mandal_id
   - Check query execution plan

---

## 9. Database Verification

### Check Notification Table:
```sql
SELECT * FROM notifications 
WHERE farmer_id = 2 
ORDER BY created_at DESC;

-- Expected columns:
-- id, farmer_id, notification_type, title, message, details, language, is_read, created_at
```

### Check Diagnostic Session:
```sql
SELECT * FROM diagnostic_sessions 
WHERE farmer_id = 1 
ORDER BY created_at DESC;

-- Verify language field is populated correctly
-- Verify region field is populated from farmer's state or request
```

---

## 10. API Contract Examples

### Request: Diagnosis with Language
```json
POST /api/diagnostic/web
Content-Type: multipart/form-data

{
  "userQuery": "My crop shows yellow leaves",
  "farmerId": 1,
  "language": "hi",
  "region": "Maharashtra",
  "image": <file>
}
```

### Response: Multi-Language Diagnosis
```json
{
  "sessionId": 123,
  "classifiedDisease": "Chlorosis",
  "classifiedCrop": "Wheat",
  "confidence": 0.85,
  "diagnosis": "आपकी गेहूँ की फसल को क्लोरोसिस बीमारी है...",
  "symptomsMatched": [
    "पत्तियों का पीला पड़ना",
    "जल-भाव की खामी"
  ],
  "managementAdvice": {
    "cultural": [
      "सिंचाई को सही समय पर करें",
      "जल निकासी सुनिश्चित करें"
    ],
    "chemical": [
      "जिंक सल्फेट का प्रयोग करें"
    ]
  },
  "regionSpecific": true,
  "source": "rag",
  "language": "hi"
}
```

### Notification Response:
```json
GET /api/notification/2

{
  "id": 1,
  "farmer": { "id": 2, "fullName": "Ashok Kumar", "language": "ENGLISH" },
  "notificationType": "DIAGNOSIS_ALERT",
  "title": "Disease Alert: Chlorosis",
  "message": "A farmer in your area has been diagnosed with Chlorosis on Wheat (85% confidence). This disease may spread to your crops. Please be alert.",
  "details": "{\"crop\": \"Wheat\", \"disease\": \"Chlorosis\", \"region\": \"Maharashtra\", \"confidence\": 0.85}",
  "language": "en",
  "isRead": false,
  "createdAt": "2024-02-25T10:35:00"
}
```

---

## Troubleshooting

### Issue 1: Notifications not being created
- Check: Farmer has mandal assigned
- Check: DiagnosticService correctly injected NotificationService
- Check: Database connection is working
- Logs: "Notification sent to farmer X in mandal Y"

### Issue 2: Mixed language in response
- Check: Python service is translating symptoms_matched
- Check: Python service is translating management_advice
- Check: System prompt includes language specification
- Verify: `generate_diagnosis()` includes target language in prompt

### Issue 3: Translation taking too long
- Optimize: Use batch translation if many items
- Consider: Caching frequently translated phrases
- Monitor: Groq API rate limits

### Issue 4: Farmers not finding notifications
- Check: Notification controller exists and deployed
- Check: API endpoint is accessible
- Check: Database query returns results with proper ordering
