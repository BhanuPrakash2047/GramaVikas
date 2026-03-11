// ─── Cascading Location Data ─────────────────────────────────────
// 5 States → 5 Districts each → 5 Mandals each

export const STATES = [
  { id: 1, name: 'Andhra Pradesh' },
  { id: 2, name: 'Telangana' },
  { id: 3, name: 'Karnataka' },
  { id: 4, name: 'Tamil Nadu' },
  { id: 5, name: 'Maharashtra' },
];

export const DISTRICTS = {
  1: [
    { id: 101, name: 'Srikakulam' },
    { id: 102, name: 'Vizianagaram' },
    { id: 103, name: 'Visakhapatnam' },
    { id: 104, name: 'East Godavari' },
    { id: 105, name: 'Krishna' },
  ],
  2: [
    { id: 201, name: 'Hyderabad' },
    { id: 202, name: 'Rangareddy' },
    { id: 203, name: 'Warangal' },
    { id: 204, name: 'Karimnagar' },
    { id: 205, name: 'Nizamabad' },
  ],
  3: [
    { id: 301, name: 'Bangalore Urban' },
    { id: 302, name: 'Mysore' },
    { id: 303, name: 'Belgaum' },
    { id: 304, name: 'Tumkur' },
    { id: 305, name: 'Dharwad' },
  ],
  4: [
    { id: 401, name: 'Chennai' },
    { id: 402, name: 'Coimbatore' },
    { id: 403, name: 'Madurai' },
    { id: 404, name: 'Salem' },
    { id: 405, name: 'Tiruchirappalli' },
  ],
  5: [
    { id: 501, name: 'Pune' },
    { id: 502, name: 'Nagpur' },
    { id: 503, name: 'Nashik' },
    { id: 504, name: 'Aurangabad' },
    { id: 505, name: 'Kolhapur' },
  ],
};

export const MANDALS = {
  // Andhra Pradesh - Srikakulam
  101: [
    { id: 1001, name: 'Srikakulam' },
    { id: 1002, name: 'Etcherla' },
    { id: 1003, name: 'Amadalavalasa' },
    { id: 1004, name: 'Narasannapeta' },
    { id: 1005, name: 'Tekkali' },
  ],
  // Andhra Pradesh - Vizianagaram
  102: [
    { id: 1006, name: 'Vizianagaram' },
    { id: 1007, name: 'Bobbili' },
    { id: 1008, name: 'Parvathipuram' },
    { id: 1009, name: 'Salur' },
    { id: 1010, name: 'Nellimarla' },
  ],
  // Andhra Pradesh - Visakhapatnam
  103: [
    { id: 1011, name: 'Visakhapatnam Urban' },
    { id: 1012, name: 'Gajuwaka' },
    { id: 1013, name: 'Anakapalli' },
    { id: 1014, name: 'Pendurthi' },
    { id: 1015, name: 'Bheemunipatnam' },
  ],
  // Andhra Pradesh - East Godavari
  104: [
    { id: 1016, name: 'Kakinada' },
    { id: 1017, name: 'Rajahmundry' },
    { id: 1018, name: 'Amalapuram' },
    { id: 1019, name: 'Ramachandrapuram' },
    { id: 1020, name: 'Peddapuram' },
  ],
  // Andhra Pradesh - Krishna
  105: [
    { id: 1021, name: 'Vijayawada' },
    { id: 1022, name: 'Machilipatnam' },
    { id: 1023, name: 'Gudivada' },
    { id: 1024, name: 'Nuzvid' },
    { id: 1025, name: 'Jaggayyapeta' },
  ],
  // Telangana - Hyderabad
  201: [
    { id: 2001, name: 'Charminar' },
    { id: 2002, name: 'Khairatabad' },
    { id: 2003, name: 'Secunderabad' },
    { id: 2004, name: 'Musheerabad' },
    { id: 2005, name: 'Amberpet' },
  ],
  // Telangana - Rangareddy
  202: [
    { id: 2006, name: 'Rajendranagar' },
    { id: 2007, name: 'Shamshabad' },
    { id: 2008, name: 'Ibrahimpatnam' },
    { id: 2009, name: 'Chevella' },
    { id: 2010, name: 'Maheshwaram' },
  ],
  // Telangana - Warangal
  203: [
    { id: 2011, name: 'Hanamkonda' },
    { id: 2012, name: 'Kazipet' },
    { id: 2013, name: 'Wardhannapet' },
    { id: 2014, name: 'Dharmasagar' },
    { id: 2015, name: 'Hasanparthy' },
  ],
  // Telangana - Karimnagar
  204: [
    { id: 2016, name: 'Karimnagar' },
    { id: 2017, name: 'Huzurabad' },
    { id: 2018, name: 'Jammikunta' },
    { id: 2019, name: 'Choppadandi' },
    { id: 2020, name: 'Manakondur' },
  ],
  // Telangana - Nizamabad
  205: [
    { id: 2021, name: 'Nizamabad' },
    { id: 2022, name: 'Bodhan' },
    { id: 2023, name: 'Armoor' },
    { id: 2024, name: 'Kamareddy' },
    { id: 2025, name: 'Banswada' },
  ],
  // Karnataka - Bangalore Urban
  301: [
    { id: 3001, name: 'Bangalore North' },
    { id: 3002, name: 'Bangalore South' },
    { id: 3003, name: 'Bangalore East' },
    { id: 3004, name: 'Anekal' },
    { id: 3005, name: 'Yelahanka' },
  ],
  // Karnataka - Mysore
  302: [
    { id: 3006, name: 'Mysore' },
    { id: 3007, name: 'Nanjangud' },
    { id: 3008, name: 'T Narasipura' },
    { id: 3009, name: 'Hunsur' },
    { id: 3010, name: 'Krishnarajanagar' },
  ],
  // Karnataka - Belgaum
  303: [
    { id: 3011, name: 'Belgaum' },
    { id: 3012, name: 'Khanapur' },
    { id: 3013, name: 'Bailhongal' },
    { id: 3014, name: 'Gokak' },
    { id: 3015, name: 'Ramdurg' },
  ],
  // Karnataka - Tumkur
  304: [
    { id: 3016, name: 'Tumkur' },
    { id: 3017, name: 'Tiptur' },
    { id: 3018, name: 'Gubbi' },
    { id: 3019, name: 'Sira' },
    { id: 3020, name: 'Madhugiri' },
  ],
  // Karnataka - Dharwad
  305: [
    { id: 3021, name: 'Dharwad' },
    { id: 3022, name: 'Hubli' },
    { id: 3023, name: 'Kalghatgi' },
    { id: 3024, name: 'Kundgol' },
    { id: 3025, name: 'Navalgund' },
  ],
  // Tamil Nadu - Chennai
  401: [
    { id: 4001, name: 'Tondiarpet' },
    { id: 4002, name: 'Fort St George' },
    { id: 4003, name: 'Mylapore' },
    { id: 4004, name: 'Alandur' },
    { id: 4005, name: 'Ambattur' },
  ],
  // Tamil Nadu - Coimbatore
  402: [
    { id: 4006, name: 'Coimbatore North' },
    { id: 4007, name: 'Coimbatore South' },
    { id: 4008, name: 'Pollachi' },
    { id: 4009, name: 'Mettupalayam' },
    { id: 4010, name: 'Sulur' },
  ],
  // Tamil Nadu - Madurai
  403: [
    { id: 4011, name: 'Madurai North' },
    { id: 4012, name: 'Madurai South' },
    { id: 4013, name: 'Melur' },
    { id: 4014, name: 'Usilampatti' },
    { id: 4015, name: 'Vadipatti' },
  ],
  // Tamil Nadu - Salem
  404: [
    { id: 4016, name: 'Salem' },
    { id: 4017, name: 'Attur' },
    { id: 4018, name: 'Mettur' },
    { id: 4019, name: 'Omalur' },
    { id: 4020, name: 'Sangagiri' },
  ],
  // Tamil Nadu - Tiruchirappalli
  405: [
    { id: 4021, name: 'Tiruchirappalli' },
    { id: 4022, name: 'Srirangam' },
    { id: 4023, name: 'Lalgudi' },
    { id: 4024, name: 'Musiri' },
    { id: 4025, name: 'Thuraiyur' },
  ],
  // Maharashtra - Pune
  501: [
    { id: 5001, name: 'Pune City' },
    { id: 5002, name: 'Haveli' },
    { id: 5003, name: 'Baramati' },
    { id: 5004, name: 'Junnar' },
    { id: 5005, name: 'Shirur' },
  ],
  // Maharashtra - Nagpur
  502: [
    { id: 5006, name: 'Nagpur Urban' },
    { id: 5007, name: 'Nagpur Rural' },
    { id: 5008, name: 'Hingna' },
    { id: 5009, name: 'Kamptee' },
    { id: 5010, name: 'Katol' },
  ],
  // Maharashtra - Nashik
  503: [
    { id: 5011, name: 'Nashik' },
    { id: 5012, name: 'Igatpuri' },
    { id: 5013, name: 'Dindori' },
    { id: 5014, name: 'Niphad' },
    { id: 5015, name: 'Sinnar' },
  ],
  // Maharashtra - Aurangabad
  504: [
    { id: 5016, name: 'Aurangabad' },
    { id: 5017, name: 'Khuldabad' },
    { id: 5018, name: 'Kannad' },
    { id: 5019, name: 'Phulambri' },
    { id: 5020, name: 'Paithan' },
  ],
  // Maharashtra - Kolhapur
  505: [
    { id: 5021, name: 'Kolhapur' },
    { id: 5022, name: 'Karveer' },
    { id: 5023, name: 'Panhala' },
    { id: 5024, name: 'Hatkanangle' },
    { id: 5025, name: 'Shirol' },
  ],
};

// ─── Language Choices ────────────────────────────────────────────

export const LANGUAGES = [
  { code: 'EN', label: 'English', nativeLabel: 'English', icon: '🇬🇧' },
  { code: 'HI', label: 'Hindi', nativeLabel: 'हिन्दी', icon: '🇮🇳' },
  { code: 'TE', label: 'Telugu', nativeLabel: 'తెలుగు', icon: '🏛️' },
];

// ─── Language Mapping (Frontend code to Backend Enum) ────────────

export const LANGUAGE_MAP = {
  'EN': 'ENGLISH',
  'HI': 'HINDI',
  'TE': 'TELUGU',
};

// ─── Translations ────────────────────────────────────────────────
// All field labels in each language for the registration form

export const TRANSLATIONS = {
  EN: {
    // Language Selection
    chooseLang: 'Choose Your Language',
    chooseLangSub: 'Select your preferred language',
    continueBtn: 'Continue',

    // Login
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to your account',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign In',
    loggingIn: 'Signing In...',
    noAccount: "Don't have an account?",
    registerLink: 'Register',

    // Register
    registerTitle: 'Create Account',
    registerSubtitle: 'Join GramVikash today',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    phoneNumber: 'Phone Number',
    phonePlaceholder: 'Enter 10-digit number',
    dob: 'Date of Birth',
    dobPlaceholder: 'YYYY-MM-DD',
    state: 'State',
    statePlaceholder: 'Select your state',
    district: 'District',
    districtPlaceholder: 'Select your district',
    mandal: 'Mandal / Taluka',
    mandalPlaceholder: 'Select your mandal',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    location: 'GPS Location',
    locationFetching: 'Fetching location...',
    locationFetched: 'Location captured',
    locationBtn: 'Get My Location',
    register: 'Create Account',
    registering: 'Creating Account...',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign In',

    // Validation
    fillAll: 'Please fill in all fields',
    passwordMismatch: 'Passwords do not match',
    invalidPhone: 'Please enter a valid 10-digit phone number',
    selectState: 'Please select state first',
    selectDistrict: 'Please select district first',
    locationRequired: 'Please capture your GPS location',
  },
  HI: {
    chooseLang: 'अपनी भाषा चुनें',
    chooseLangSub: 'अपनी पसंदीदा भाषा चुनें',
    continueBtn: 'जारी रखें',

    loginTitle: 'वापस स्वागत है',
    loginSubtitle: 'अपने खाते में साइन इन करें',
    username: 'उपयोगकर्ता नाम',
    usernamePlaceholder: 'अपना उपयोगकर्ता नाम दर्ज करें',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    login: 'साइन इन करें',
    loggingIn: 'साइन इन हो रहा है...',
    noAccount: 'खाता नहीं है?',
    registerLink: 'रजिस्टर करें',

    registerTitle: 'खाता बनाएं',
    registerSubtitle: 'आज ही ग्रामविकाश से जुड़ें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    phoneNumber: 'फ़ोन नंबर',
    phonePlaceholder: '10 अंकों का नंबर दर्ज करें',
    dob: 'जन्म तिथि',
    dobPlaceholder: 'YYYY-MM-DD',
    state: 'राज्य',
    statePlaceholder: 'अपना राज्य चुनें',
    district: 'ज़िला',
    districtPlaceholder: 'अपना ज़िला चुनें',
    mandal: 'मंडल / तालुका',
    mandalPlaceholder: 'अपना मंडल चुनें',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड दोबारा दर्ज करें',
    location: 'GPS स्थान',
    locationFetching: 'स्थान प्राप्त हो रहा है...',
    locationFetched: 'स्थान प्राप्त हुआ',
    locationBtn: 'मेरा स्थान प्राप्त करें',
    register: 'खाता बनाएं',
    registering: 'खाता बन रहा है...',
    hasAccount: 'पहले से खाता है?',
    loginLink: 'साइन इन करें',

    fillAll: 'कृपया सभी फ़ील्ड भरें',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
    invalidPhone: 'कृपया 10 अंकों का फ़ोन नंबर दर्ज करें',
    selectState: 'कृपया पहले राज्य चुनें',
    selectDistrict: 'कृपया पहले ज़िला चुनें',
    locationRequired: 'कृपया अपना GPS स्थान प्राप्त करें',
  },
  TE: {
    chooseLang: 'మీ భాషను ఎంచుకోండి',
    chooseLangSub: 'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
    continueBtn: 'కొనసాగించు',

    loginTitle: 'తిరిగి స్వాగతం',
    loginSubtitle: 'మీ ఖాతాలో సైన్ ఇన్ చేయండి',
    username: 'వాడుకరి పేరు',
    usernamePlaceholder: 'మీ వాడుకరి పేరు నమోదు చేయండి',
    password: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
    login: 'సైన్ ఇన్',
    loggingIn: 'సైన్ ఇన్ అవుతోంది...',
    noAccount: 'ఖాతా లేదా?',
    registerLink: 'నమోదు చేయండి',

    registerTitle: 'ఖాతా సృష్టించండి',
    registerSubtitle: 'ఈరోజే గ్రామవికాశ్‌లో చేరండి',
    fullName: 'పూర్తి పేరు',
    fullNamePlaceholder: 'మీ పూర్తి పేరు నమోదు చేయండి',
    phoneNumber: 'ఫోన్ నంబర్',
    phonePlaceholder: '10 అంకెల నంబర్ నమోదు చేయండి',
    dob: 'పుట్టిన తేదీ',
    dobPlaceholder: 'YYYY-MM-DD',
    state: 'రాష్ట్రం',
    statePlaceholder: 'మీ రాష్ట్రాన్ని ఎంచుకోండి',
    district: 'జిల్లా',
    districtPlaceholder: 'మీ జిల్లాను ఎంచుకోండి',
    mandal: 'మండలం',
    mandalPlaceholder: 'మీ మండలాన్ని ఎంచుకోండి',
    confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
    confirmPasswordPlaceholder: 'పాస్‌వర్డ్ మళ్ళీ నమోదు చేయండి',
    location: 'GPS స్థానం',
    locationFetching: 'స్థానం పొందుతోంది...',
    locationFetched: 'స్థానం సేకరించబడింది',
    locationBtn: 'నా స్థానం పొందు',
    register: 'ఖాతా సృష్టించు',
    registering: 'ఖాతా సృష్టిస్తోంది...',
    hasAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    loginLink: 'సైన్ ఇన్',

    fillAll: 'దయచేసి అన్ని ఫీల్డ్‌లు పూరించండి',
    passwordMismatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు',
    invalidPhone: 'దయచేసి 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి',
    selectState: 'దయచేసి ముందుగా రాష్ట్రాన్ని ఎంచుకోండి',
    selectDistrict: 'దయచేసి ముందుగా జిల్లాను ఎంచుకోండి',
    locationRequired: 'దయచేసి మీ GPS స్థానాన్ని సేకరించండి',
  },
};
