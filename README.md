<p align="center">
  <img src="https://img.shields.io/badge/GramVikash-Village%20Development-2D6A4F?style=for-the-badge&logo=leaf&logoColor=white" alt="GramVikash Badge"/>
</p>

<h1 align="center">🌾 GramVikash</h1>

<p align="center">
  <b>An AI-Powered Rural Farmer Assistance Platform</b><br/>
  <i>Bridging the gap between technology and rural India — one farmer at a time.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react" alt="React Native"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Groq%20AI-LLM-FF6B35" alt="Groq AI"/>
  <img src="https://img.shields.io/badge/PyTorch-EfficientNet-EE4C2C?logo=pytorch" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/Twilio-IVRS%20%26%20SMS-F22F46?logo=twilio" alt="Twilio"/>
</p>

---

## 📌 Problem Statement

- **🌿 Crop diseases go unidentified** — Farmers can't distinguish between diseases. By the time they seek help, significant yield is already lost. There's no accessible, instant diagnostic service in their native language.

- **🚑 Emergency response is a luxury** — Snake bites, pesticide poisoning, tractor accidents, and fires are common in rural areas. With the nearest hospital often hours away and no organized dispatch system, precious time is lost.

- **📋 Government schemes remain undiscovered** — Hundreds of central and state government schemes exist for farmers, but navigating eligibility criteria across complex bureaucratic guidelines is nearly impossible for someone without digital literacy.

- **🗣️ Language is a barrier** — Most digital solutions are English-first. Rural farmers in Andhra Pradesh, Telangana, or Hindi-speaking states are left behind. They think, speak, and understand in their mother tongue — not English.

- **📱 The digital divide is real** — Not every farmer has a smartphone or stable internet. Millions still rely on basic feature phones. They are completely excluded from app-based solutions.

**GramVikash** tackles all of these problems through a **single unified platform** — accessible via a mobile app *and* via a simple phone call.

---

## 💡 What is GramVikash?

**GramVikash** (meaning *"Village Development"* in Hindi & Telugu) is a comprehensive farmer assistance platform that brings together:

- **AI-powered crop health diagnosis with localized solutions** — identifies crop health issues and provides area-specific, actionable solutions tailored to the farmer's soil type, climate, and local agricultural practices
- **One-tap emergency dispatch** with automatic nearest doctor & ambulance detection
- **Smart government scheme matching** with personalized eligibility checking
- **Phone-based IVRS access** so farmers without smartphones can still get help
- **Community-level crop health alerts** that turn individual diagnoses into early warnings for the entire village

All of this — in **English, Hindi, and Telugu**.

---

## 🌟 Key Features

### 🔬 AI Crop Health Diagnosis with Localized Solutions
A farmer simply **takes a photo** of their crop or **describes the symptoms** in their own words. Our AI pipeline provides a comprehensive diagnosis that goes beyond disease identification — it delivers **localized solutions tailored to the farmer's specific region**. Every diagnosis includes:
- What's happening with the crop (disease, nutrient deficiency, pest damage, or healthy status)
- **Area-specific management recommendations** based on local soil type, weather patterns, and seasonal factors
- Actionable treatment advice — including both **organic/cultural practices** and **chemical recommendations**
- Regional crop-specific tips leveraging soil and weather data from the farmer's exact mandal and district

### 🆘 Voice SOS Emergency System
In a crisis, every second counts. The farmer taps the **floating SOS button** (visible on every screen), records a voice message describing the emergency, and the system takes over — **transcribing the audio, classifying the emergency type and severity using AI, finding the nearest available doctor and ambulance driver, and dispatching them via SMS** — all within seconds.

### 🐄 Livestock Emergency Support
When a farmer's livestock is in distress, they can **photograph the animal** and provide a brief description. The system uses **AI vision analysis** to assess the situation, provide immediate care advice, and dispatch a veterinary responder to their GPS location.

### 📋 Smart Scheme Finder
Instead of browsing through hundreds of government schemes, the farmer gets a **personalized list of schemes they're actually eligible for**. The system also identifies schemes where they're **"almost eligible"** — missing qualification by just one criterion — and tells them exactly what they'd need to qualify. A step-by-step **eligibility questionnaire** walks them through any missing information with simple yes/no or numeric questions.

### 📞 IVRS Phone-Based Access
**No smartphone? No internet? No problem.** Farmers can call a dedicated phone number and access crop diagnosis and emergency services through an **Interactive Voice Response System**. They speak their symptoms in their language, and the system responds with an AI-generated diagnosis — all via voice. This is the ultimate bridge across the digital divide.

### 🔔 Community Crop Health Alert Network
When a farmer receives a crop health diagnosis, **every farmer in the same administrative area (mandal) is automatically notified** via in-app notifications and SMS with localized solutions specific to their community's soil and weather. This creates a **grassroots agricultural intelligence network** — if one farmer identifies an issue with their rice crop, all nearby rice farmers get early warning along with area-specific prevention and treatment strategies.

### ⚠️ Cluster Emergency Alert System
If **3 or more emergencies of the same type** (e.g., snake bites) occur **within 5 kilometers in under an hour**, the system automatically sends SMS alerts to all farmers in the area — warning them of a potential ongoing danger zone.

### 🌦️ Season-Aware Dashboard
The home screen **auto-detects the current agricultural season** — Kharif (June–October), Rabi (November–February), or Summer (March–May) — and displays relevant **seasonal farming tips and advisories**.

### 🏥 Post-Disaster Scheme Push Notifications
When a new **post-disaster relief scheme** is created by the government, **all eligible farmers are automatically notified** — ensuring relief reaches those who need it, when they need it.

---

## 🎯 Unique Aspects

| Feature | Why It Matters |
|---------|----------------|
| **Floating SOS Button** | A persistent, pulsing red emergency button visible on *every* screen. Even a farmer unfamiliar with navigation can instantly record and send an emergency. |
| **"Almost Eligible" Scheme Matching** | Goes beyond pass/fail — tells farmers *exactly* what one thing would make them eligible for a scheme they just missed. |
| **IVRS for the Digitally Excluded** | The *same* AI diagnosis and emergency system works via a basic phone call. No smartphone, no internet, no app needed. |
| **Cluster Alert Detection** | Epidemiological-style pattern detection — identifies when emergencies are clustering geographically and alerts the community. |
| **Mandal-Based Crop Health Network** | One diagnosis triggers a community-wide early warning — all farmers in the mandal are alerted to potential crop health issues with localized solutions, creating a grassroots agricultural surveillance system. |
| **Triple AI Model Stack** | Combines speech recognition (Whisper), image classification (EfficientNet-B0), and large language models (Llama) — all running on free-tier infrastructure for zero-cost AI inference. |
| **End-to-End Multilingual** | Not just translated buttons — the AI itself *thinks* and *responds* in Hindi and Telugu. IVRS speech recognition understands all 3 languages. Notifications arrive in the farmer's chosen language. |
| **Emergency Do's & Don'ts** | Every dispatched emergency includes expert medical/safety instructions specific to the emergency type — critical guidance while help is on the way. |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    📱 MOBILE APP                        │
│              React Native + Expo + Redux                │
│                                                         │
│  ┌──────┐ ┌──────────┐ ┌─────────┐ ┌──────┐ ┌───────┐  │
│  │ Home │ │Diagnostics│ │Emergency│ │Schemes│ │Profile│  │
│  └──┬───┘ └─────┬────┘ └────┬────┘ └───┬──┘ └───┬───┘  │
│     └───────────┴───────────┴──────────┴────────┘       │
│                         │ REST API                      │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│              ☕ SPRING BOOT BACKEND                      │
│                   Java 21 + MySQL                       │
│                                                         │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │ Auth (JWT) │ │  Emergency   │ │  Scheme Engine   │   │
│  │            │ │  Dispatch    │ │  (Eligibility)   │   │
│  └────────────┘ └──────┬───────┘ └──────────────────┘   │
│  ┌────────────┐ ┌──────┴───────┐ ┌──────────────────┐   │
│  │ IVRS/Twilio│ │Cluster Alerts│ │  Notifications   │   │
│  │ Voice Flow │ │  + SMS       │ │  Disease Alerts  │   │
│  └────────────┘ └──────────────┘ └──────────────────┘   │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│            🐍 PYTHON AI MICROSERVICE                    │
│                   FastAPI                               │
│                                                         │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ EfficientNet │ │    RAG      │ │   Groq LLMs     │   │
│  │ B0 Classifier│ │  Knowledge  │ │  (Diagnosis +   │   │
│  │ (25 Classes) │ │  Base Search│ │   Translation)  │   │
│  └──────────────┘ └─────────────┘ └─────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘

         📞 Twilio (SMS + IVRS Phone Calls)
```

---

## 🛠️ Tech Stack

### Mobile Application
| Technology | Purpose |
|-----------|---------|
| **React Native** (0.83) | Cross-platform mobile framework |
| **Expo SDK 55** | Development toolchain, native modules |
| **Redux Toolkit** | Global state management with persistence |
| **React Navigation v7** | Screen navigation (bottom tabs + stacks) |
| **NativeWind** | Tailwind CSS styling for React Native |
| **Expo AV** | Audio recording for voice SOS |
| **Expo Image Picker** | Camera & gallery access for crop photos |
| **Expo Location** | GPS coordinate capture |
| **Axios** | HTTP client with retry interceptors |

### Backend Server
| Technology | Purpose |
|-----------|---------|
| **Spring Boot 3.5** | REST API framework |
| **Java 21** | Server-side language |
| **Spring Data JPA** | Database ORM layer |
| **Spring Security + JWT** | Authentication & authorization |
| **MySQL 8** | Relational database |
| **Twilio SDK** | SMS dispatch + IVRS phone system |
| **Lombok** | Reduce boilerplate code |

### AI / ML Microservice
| Technology | Purpose |
|-----------|---------|
| **FastAPI** (Python) | High-performance AI service API |
| **PyTorch + EfficientNet-B0** | Custom crop disease image classifier (25 classes) |
| **Sentence Transformers** | Semantic embedding generation for RAG search |
| **Groq API** | Ultra-fast LLM inference (free tier) |
| — Llama 3.1 8B | Text diagnosis, translation, emergency classification |
| — Llama 3.2 90B Vision | Livestock image analysis |
| — Whisper Large V3 Turbo | Voice-to-text transcription |
| **NumPy** | Cosine similarity computation for RAG retrieval |

### External Services
| Service | Purpose |
|---------|---------|
| **Twilio** | SMS delivery + IVRS phone call handling |
| **AWS Polly** | Text-to-speech for IVRS responses (multilingual) |
| **Groq Cloud** | Free-tier AI inference (LLM + Vision + Speech) |

---

## 📱 Application Flow

### 🔐 Onboarding
1. Farmer opens the app → animated splash screen
2. **Selects preferred language** (English / Hindi / Telugu)
3. Registers with name, phone number, date of birth, and password
4. Selects location through **cascading dropdowns** — State → District → Mandal
5. GPS coordinates are automatically captured
6. Logged in with JWT authentication → lands on the Home dashboard

### 🏠 Home Dashboard
- Personalized greeting with farmer's name and location
- Current **agricultural season** detection with seasonal tips
- **Quick action grid** — Diagnose Crop, Voice SOS, Schemes, Profile
- **Post-disaster scheme carousel** if any active disaster relief schemes exist
- Recent diagnosis results
- Unread notification indicator

### 🔬 Crop Health Diagnosis Flow
1. Farmer navigates to Diagnostics → **Diagnose** tab
2. Types a description of crop health in their language
3. Optionally takes a **photo** of the crop (camera or gallery)
4. Submits → AI pipeline runs:
   - Image classified into crop + health status (disease, pest, nutrient issue, or healthy)
   - Knowledge base searched for relevant agricultural data *specific to that mandal* (soil type, weather patterns, seasonal factors)
   - LLM generates comprehensive localized diagnosis in farmer's language
5. Results displayed:
   - What's wrong with the crop (or confirmation if healthy)
   - Why it's happening (based on local conditions)
   - **Area-specific solutions** tailored to local soil and climate
   - Management options: organic practices, chemical treatments, preventive measures
   - Seasonal and regional best practices
6. **All farmers in the same mandal are notified** of the crop health issue — creating early community warnings

### 🆘 Emergency Flow (Voice SOS)
1. Farmer taps the **floating red SOS button** (available on every screen)
2. Records a voice message describing the emergency
3. System **transcribes** the audio using Whisper AI
4. AI **classifies** the emergency — type (snake bite, poisoning, fire, accident) + severity
5. System **locates nearest** available doctor and ambulance driver within 5km
6. **SMS dispatched** to all available responders with the farmer's GPS coordinates
7. Farmer receives emergency **do's and don'ts** specific to their situation
8. If cluster pattern detected (≥3 similar emergencies nearby), **community alert** sent

### 🐄 Livestock Emergency Flow
1. Farmer navigates to Emergency → **Livestock** tab
2. Takes a **photo** of the distressed animal
3. Adds a text description of symptoms
4. AI Vision model **analyzes the image** and provides:
   - Severity assessment
   - Likely condition
   - Immediate care instructions
5. Nearest veterinary responder **dispatched** via SMS

### 📋 Scheme Discovery Flow
1. Farmer navigates to Schemes → **"For You"** tab
2. System evaluates **all active schemes** against the farmer's profile
3. Schemes categorized as: ✅ Eligible, ⚠️ Almost Eligible, ❌ Not Eligible
4. "Almost Eligible" schemes show **exactly which criterion** the farmer missed
5. Farmer taps a scheme → full details with benefits and translated FAQs
6. Taps "Check Eligibility" → **step-by-step questionnaire** with progress bar
7. Answers simple questions (yes/no, numbers, selections)
8. Final eligibility result displayed

### 📞 IVRS Flow (Phone-Based Access)
1. Farmer **calls the IVRS number** from any phone
2. Hears a welcome message in their registered language
3. **Presses 1** for crop diagnosis → speaks symptoms → receives AI diagnosis via voice
4. **Presses 2** for scheme information
5. **Presses 3** for emergency → describes the situation → AI classifies → responders dispatched → confirmation read aloud with safety instructions

---

## 🏘️ Rural Accessibility Design

GramVikash is built from the ground up with rural India in mind:

| Design Choice | Rationale |
|--------------|-----------|
| **Multilingual first** | Hindi & Telugu alongside English — UI, AI responses, notifications, and IVRS all in the farmer's mother tongue |
| **IVRS phone system** | No smartphone or internet needed — the full diagnostic and emergency system works over a basic phone call |
| **One-tap SOS** | Large, persistent red button eliminates navigation complexity in panic situations |
| **Offline-ready state** | Redux Persist ensures the app works even with intermittent connectivity |
| **GPS auto-capture** | No manual address entry — location detected automatically |
| **Cascading location dropdowns** | State → District → Mandal selection simplifies location input for farmers unfamiliar with typing addresses |
| **Simple question flows** | Scheme eligibility uses yes/no and number inputs — no complex forms |
| **SMS notifications** | Critical alerts (disease warnings, emergency dispatch) sent via SMS — works on any phone |
| **Visual-first diagnosis** | Take a photo instead of typing — designed for lower literacy levels |
| **Voice input for emergencies** | Speak instead of type — natural and fast, especially in crisis situations |
| **Season-aware content** | Dashboard adapts to agricultural seasons automatically — always relevant |
| **Localized crop health solutions** | RAG knowledge base includes Srikakulam district-specific soil types, mandal profiles, and area-specific prevention/treatment strategies for every diagnosis |
| **Zero-cost AI inference** | Uses Groq's free tier — sustainable for a platform serving economically constrained users |

---

## 🌾 Crops & Diseases Covered

Our AI model and knowledge base currently support:

| Crop | Diseases |
|------|----------|
| **Rice / Paddy** | Blast, Bacterial Leaf Blight, Brown Spot, Tungro, Hispa, Neck Blast, Leaf Smut |
| **Wheat** | Leaf Rust, Stem Rust, Stripe Rust, Loose Smut, Septoria, Brown Rust |
| **Potato** | Late Blight, Early Blight, Brown Rot / Bacterial Wilt |
| **Sugarcane** | Red Rot, Wilt, Smut, Grassy Shoot Disease, Ratoon Stunting Disease |
| **Corn / Maize** | Common Rust, Gray Leaf Spot, Blight, Healthy Detection |

---

## 🗺️ Geographic Coverage

Currently configured with hierarchical location data for:

- **Andhra Pradesh** — Srikakulam, Vizianagaram, Visakhapatnam, East Godavari, West Godavari (with mandal-level granularity)
- **Telangana** — Hyderabad, Rangareddy, Warangal, Karimnagar, Nizamabad
- **Uttar Pradesh** — Lucknow, Varanasi, Agra, Prayagraj, Kanpur
- **Madhya Pradesh** — Bhopal, Indore, Jabalpur, Gwalior, Ujjain
- **Maharashtra** — Mumbai, Pune, Nagpur, Nashik, Aurangabad

Each state has **5 districts**, each district has **5 mandals** — totaling **125 mandals** for granular location-based features.

---

## 👥 Team

> *Built with purpose for the people who feed the nation.*

---

## 📄 License

This project was developed as part of a hackathon / academic initiative.

---

<p align="center">
  <b>🌱 GramVikash — Technology in service of rural India 🌱</b>
</p>
