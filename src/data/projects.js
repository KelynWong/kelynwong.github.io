/**
 * Projects Data
 * 
 * Each project can have:
 * - id: unique identifier
 * - title: project name
 * - coverImage: path to cover/hero image (replaces icon)
 * - coverAlt: alt text for accessibility
 * - short: one-line summary
 * - description: full description (can be markdown in future)
 * - screenshots: array of image paths for gallery
 * - demo: { type: 'youtube' | 'vimeo' | 'link', id: 'VIDEO_ID' } or null
 * - demoThumb: optional custom thumbnail for demo
 * - links: { github?: url, live?: url, figma?: url }
 * - tags: array of tech/stack
 * - year: (optional) project year
 * - role: (optional) your role
 * - featured: (optional) pin to top
 */

export default [
  {
    id: 'fingerprint-access',
    title: 'Fingerprint Door Access System',
    category: 'iot',
    coverImage: '/src/assets/projects/cover/fingerprint-cover.svg',
    coverAlt: 'Fingerprint Door Access System',
    short: 'Biometric door access with Arduino, real-time ThingSpeak logging, Android remote control & Twitter intruder alerts',
    description: 'A fingerprint-based door access system built with an Arduino Uno, fingerprint sensor, LCD screen, buzzer, servo motor, ultrasonic sensor, and Bluetooth module. When an unrecognized fingerprint is detected, the buzzer triggers a local alert and Twitter sends an automated intruder notification. ThingSpeak handles event logging and cloud monitoring, while a companion Android app gives remote visibility and control — view the full access log, lock or unlock the door from anywhere, and push custom messages to the LCD screen.',
    screenshots: [],
    demo: { type: 'youtube', id: '-_Hpm2QKk54' },
    demoThumb: null,
    links: {
      github: 'https://github.com/KelynWong/FingerprintDoorAccess',
      live: null,
    },
    tags: ['C++', 'Arduino', 'ThingSpeak', 'Android', 'Java', 'Twitter API', 'Bluetooth'],
    year: 2020,
  },
  {
    id: 'keypad-access',
    title: 'Keypad Door Access System',
    category: 'iot',
    coverImage: '/src/assets/projects/cover/keypad-cover.svg',
    coverAlt: 'Keypad Door Access System',
    short: 'Raspberry Pi door system with live camera feed, Streamlit dashboard, motion detection & Twitter intruder alerts',
    description: 'A keypad-based door access system built with a Raspberry Pi, ultrasonic sensor, keypad, servo motor, buzzer, LCD screen, and camera. The system detects when someone approaches, prompts for a passcode, and locks or unlocks the door accordingly. Incorrect entries and unrecognized motion trigger ThingSpeak notifications and automated Twitter intruder alerts. A companion Streamlit dashboard provides a live camera feed, access analytics, and remote controls for the door and buzzer — making the system fully manageable from a web browser.',
    screenshots: [ '/src/assets/projects/keypadDoorAccess/1.png', '/src/assets/projects/keypadDoorAccess/2.png', '/src/assets/projects/keypadDoorAccess/3.png', '/src/assets/projects/keypadDoorAccess/4.png', ],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/IntruderAlertDoorSystem',
      live: null,
    },
    tags: ['Python', 'Raspberry Pi', 'ThingSpeak', 'Streamlit', 'Twitter API', 'OpenCV'],
    year: 2020,
  },
  {
    id: 'face-recognition-attendance',
    title: 'Face Recognition Attendance System',
    category: 'iot',
    coverImage: '/src/assets/projects/cover/face-recognition-cover.svg',
    coverAlt: 'Face Recognition Attendance System',
    short: 'Automated student attendance via face recognition on Raspberry Pi with MySQL storage & Streamlit analytics',
    description: 'A face recognition-based attendance system built with a Raspberry Pi 3 B+, camera, LCD screen, ultrasonic sensor, LED, and buzzer. When a student approaches, the system captures their face from the live camera feed, matches it against a stored encoding database using OpenCV, and records attendance automatically for the active class session in MySQL. A Streamlit dashboard lets lecturers log in securely, review per-student and per-class attendance records, and generate analytics reports — eliminating manual roll calls entirely.',
    screenshots: [ '/src/assets/projects/faceRecognitionAttendance/1.png', '/src/assets/projects/faceRecognitionAttendance/2.png', '/src/assets/projects/faceRecognitionAttendance/3.png', '/src/assets/projects/faceRecognitionAttendance/4.png', '/src/assets/projects/faceRecognitionAttendance/5.png', '/src/assets/projects/faceRecognitionAttendance/6.png', '/src/assets/projects/faceRecognitionAttendance/7.png', '/src/assets/projects/faceRecognitionAttendance/8.png', '/src/assets/projects/faceRecognitionAttendance/9.png', '/src/assets/projects/faceRecognitionAttendance/10.png', ],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/FaceRecoAttendanceSys',
      live: null,
    },
    tags: ['Python', 'OpenCV', 'Raspberry Pi', 'Node-RED', 'Streamlit', 'MySQL'],
    year: 2021,
  },
  {
    id: 'smart-fitness-trainer',
    title: 'Smart Fitness Trainer',
    category: 'iot',
    coverImage: '/src/assets/projects/cover/smart-fitness-cover.svg',
    coverAlt: 'Smart Fitness Trainer',
    short: 'AI workout coach with real-time pose estimation, rep counting, audio feedback & Streamlit analytics dashboard',
    description: 'A smart fitness trainer system built with a Raspberry Pi, USB camera, speakers, fitness band, and Supabase. The system uses pose estimation to analyse user form during exercises in real time, automatically counts repetitions, and delivers audio feedback through the speakers when form breaks down. A Streamlit dashboard lets users log in, start and stop workout sessions, set fitness goals, and review their full workout history and progress analytics — bringing a personal training experience to an affordable embedded hardware setup.',
    screenshots: [],
    demo: { type: 'youtube', id: 'lYzs-p9fdCA' },
    links: {
      github: 'https://github.com/KelynWong/CPS-SmartFitnessTrainer',
      live: null,
    },
    tags: ['Python', 'MediaPipe', 'Pose Estimation', 'Streamlit', 'Supabase', 'Raspberry Pi'],
    year: 2024,
  },
  {
    id: 'covid-mobile-app',
    title: 'Virusnow',
    category: 'mobile',
    coverImage: '/src/assets/projects/cover/covid-cover.svg',
    coverAlt: 'COVID Information Mobile App',
    short: 'Android COVID-19 tracker with live global stats, trending news, symptom guides & dark mode',
    description: 'An Android COVID-19 information app with five screens: Home, Search, World, Information, and Settings. The app surfaces live country and global case statistics, curated trending news, and guidance on symptoms and prevention. It uses AsyncHttp for API calls and Picasso for image loading to keep the experience snappy, while SQLite persists user preferences locally. UI customisation options include dark mode, language selection, and font size settings — designed with accessibility and usability front of mind.',
    screenshots: [],
    demo: null,
    demoThumb: null,
    links: {
      github: 'https://github.com/KelynWong/VirusNow',
      figma: 'https://www.figma.com/design/YwuKASh95itWhuyks9SufW/ANDE---CoD-Assignment-Wireframes?node-id=0-1&t=AdDF6838MXWSJ55J-1',
    },
    tags: ['Java', 'Android SDK', 'AndroidX', 'Material Components', 'SQLite', 'AsyncHttp', 'Picasso'],
    year: '2020 - 2021',
  },
  {
    id: 'jibaboom',
    title: 'JiBaBoom',
    category: 'fullstack',
    coverImage: '/src/assets/projects/cover/jibaboom-cover.svg',
    coverAlt: 'JiBaBoom',
    short: 'Full-stack app with a PostgreSQL REST API, browser data viewer & offline-capable mobile companion',
    description: 'A full-stack application built across three layers: a PostgreSQL-backed REST API built with Node.js and Express, a browser-based viewer for querying and displaying data and results, and a mobile companion app for on-the-go access with offline caching of previous responses. The project demonstrates end-to-end architecture — from database schema design and API endpoint development to building two distinct client interfaces that consume the same backend.',
    screenshots: [],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/applicationDevelopment',
      live: null,
    },
    tags: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Express', 'PostgreSQL'],
    year: 2020,
  },
  {
    id: 'nomsters',
    title: 'Nomsters',
    category: 'fullstack',
    coverImage: '/src/assets/projects/cover/nomsters-cover.svg',
    coverAlt: 'Nomsters Recipe App',
    short: 'Vue 3 recipe discovery & meal planning app with nutrition analysis, cost estimation & grocery lists',
    description: 'Nomsters is a recipe discovery and meal-planning web app that makes home cooking more accessible. Users can browse and submit recipes, save favourites, analyse full nutritional content via the Spoonacular API, estimate ingredient costs, and build grocery lists directly from their meal plans. The Node.js and Express backend exposes authenticated REST endpoints covering user accounts, recipes, diets, cuisines, and favourites. The Vue 3 + Vite frontend delivers a fast, reactive single-page experience across browsing, recipe detail, user profile, and meal-prep views.',
    screenshots: [],
    demo: { type: 'youtube', id: '_zvcPr-Z5L8' },
    links: {
      github: 'https://github.com/KelynWong/Nomsters',
      figma: 'https://www.figma.com/design/Pz7iSTX73PsmRPITju4ULT/WAD2?node-id=33-2166&p=f&t=eKoS2OwPugYmO9Cg-0',
    },
    tags: ['Vue 3', 'Vite', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Express', 'MySQL', 'Spoonacular API'],
    year: 2023,
  },
  {
    id: 'tournament-management',
    title: 'Tournament Management System',
    category: 'fullstack',
    coverImage: '/src/assets/projects/cover/tournament-cover.svg',
    coverAlt: 'Tournament Management System',
    short: 'Badminton tournament platform with Glicko-rated matchmaking, automated scheduling & live spectator dashboard',
    description: 'A full-stack Badminton Tournament Management System that handles the entire tournament lifecycle — from player registration and automated match scheduling to real-time scoring and Glicko-based player rankings for skill-adjusted, fair matchmaking. Organizers manage brackets and results through an admin interface; participants track standings and upcoming fixtures; spectators follow live progress on a dedicated dashboard. The Spring Boot backend is containerized with Docker and the Next.js frontend is deployed on Vercel, resulting in a production-ready, scalable setup.',
    screenshots: [],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/CSD-TMS',
      live: 'https://csd-tms.vercel.app',
      figma: 'https://www.figma.com/design/5kGRcAB2qPJl1rSF3daDLF/tournament-management-system?node-id=8-25477&p=f&t=v7uQYXB9MlsVdfGO-0',
    },
    tags: ['TypeScript', 'Next.js', 'Java', 'Spring Boot', 'Docker', 'Docker Compose', 'Vercel', 'Glicko Rating System'],
    year: 2024,
  },
  {
    id: 'task-master',
    title: 'Task Master',
    category: 'fullstack',
    coverImage: '/src/assets/projects/cover/task-master-cover.svg',
    coverAlt: 'Task Master Project Management',
    short: 'Microservices project management platform with AI idea generation, group enrollment & task assignment',
    description: 'A comprehensive task and project management platform built on a microservices architecture. Users can generate project ideas with AI assistance, create groups, enroll members, and assign tasks — all within a single cohesive interface. Each domain (idea generation, group creation, enrollment, task assignment) is backed by its own dedicated REST API service, keeping the system modular and independently deployable. Services are orchestrated with Docker Compose, and the Vue frontend communicates with each microservice directly for a responsive, real-time experience.',
    screenshots: [],
    demo: { type: 'youtube', id: 'GXQHg51Abq8' },
    links: {
      github: 'https://github.com/kaixuantan/task_management_microservices',
      live: null,
    },
    tags: ['Vue', 'JavaScript', 'SCSS', 'Python', 'Flask', 'Node.js', 'Docker', 'Docker Compose', 'Microservices'],
    year: '2023 - 2024',
  },
  {
    id: 'utilisense',
    title: 'Utilisense',
    category: 'iot',
    coverImage: '/src/assets/projects/cover/utilisense-cover.svg',
    coverAlt: 'Utilisense',
    short: 'AI-powered facility monitoring system with TinyML occupancy detection, LLM insights & Telegram alerts',
    description: 'UtiliSense is a smart facility utilization system built for SMU that monitors classroom and seminar room occupancy in real time. An Arduino Nicla Vision running a TinyML model trained on Edge Impulse counts people in a room without capturing identifiable images, preserving user privacy. Occupancy data is cross-referenced with the Facilities Booking System to automatically flag no-shows, trigger Micro:bit-controlled AC and lighting shutoffs in empty rooms, and surface chronically underutilized spaces. A Streamlit dashboard visualizes actual vs. booked occupancy with actionable analytics, an LLM-powered query interface lets staff ask questions about utilization trends in plain English, and a Telegram bot delivers instant alerts and status updates.',
    screenshots: [],
    demo: { type: 'youtube', id: 'gUGHk7eD5iU' },
    links: {
      github: 'https://github.com/kelynwong/utilisense',
      live: null,
    },
    tags: ['Python', 'Arduino Nicla Vision', 'Edge Impulse', 'TinyML', 'Streamlit', 'Supabase', 'LLM', 'Telegram API', 'Micro:bit', 'Docker'],
    year: '2024 - 2025',
  },
  {
    id: 'medimate',
    title: 'Medimate',
    category: 'mobile',
    coverImage: '/src/assets/projects/cover/medimate-cover.svg',
    coverAlt: 'Medimate',
    short: 'AI-powered Android app for medication management with smart reminders, prescription OCR & gamified adherence',
    description: 'MediMate is a Kotlin-based Android application designed to help individuals on short- and long-term medication stay on track with their prescriptions. The app features an AI chatbot for instant medication guidance, image-to-text recognition that scans and summarises prescription labels into plain language, and a task-style medication tracker that makes logging doses quick and satisfying. A gamified rewards system incentivises consistent adherence, while a built-in community feature connects users for accountability and shared experiences. Built with Jetpack Compose for a modern UI and a clean MVVM architecture separating UI, data, and business logic layers.',
    screenshots: [],
    demo: { type: 'youtube', id: '4jJJxwHomcA' },
    links: {
      github: 'https://github.com/kelynwong/medimate',
      live: null,
    },
    tags: ['Kotlin', 'Jetpack Compose', 'Android SDK', 'MVVM', 'Room', 'AI Chatbot', 'OCR'],
    year: '2024 - 2025',
  },
  {
    id: 'ecoexchange',
    title: 'EcoExchange',
    category: 'fullstack',
    coverImage: '/src/assets/projects/cover/ecoexchange-cover.svg',
    coverAlt: 'EcoExchange',
    short: 'Web platform for scheduling e-waste collection, tracking recycling activity & generating sustainability reports',
    description: 'EcoExchange is a web platform designed to make responsible e-waste disposal accessible and transparent. Users can schedule collection requests for unwanted electronics, track their recycling history, and view impact summaries through a reporting dashboard. The platform is split into a Node.js and Express backend with a RESTful API and a vanilla HTML, CSS, and JavaScript frontend — keeping the stack lightweight and the experience fast. A companion Figma prototype was produced alongside the build to validate user flows before implementation.',
    screenshots: [],
    demo: { type: 'youtube', id: 'z9kWPuow7Z4' },
    links: {
      github: 'https://github.com/kelynwong/ecoexchange',
      figma: 'https://www.figma.com/design/yb20dTT65N13sVOjSK247H/Ecoexchange?node-id=0-1&p=f&t=ytFdHGOjxpFFVwP3-0',
      prototype: 'https://www.figma.com/proto/yb20dTT65N13sVOjSK247H/Ecoexchange?node-id=6-2&starting-point-node-id=6%3A2',
    },
    tags: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Express', 'MySQL', 'Figma'],
    year: '2021 - 2022',
  },
  {
    id: 'accenture-loyalty',
    title: 'Accenture Loyalty',
    category: 'fullstack',
    coverImage: '/src/assets/projects/cover/accenture-loyalty-cover.svg',
    coverAlt: 'Accenture Loyalty',
    short: 'Serverless loyalty points platform on AWS with React frontend, Lambda microservices & CI/CD pipeline',
    description: 'A cloud-native loyalty points management platform built in partnership with Accenture. The system lets companies run customer loyalty programmes end-to-end — enrolling users, awarding and redeeming points, and auditing all transactions through a full activity log. The backend is fully serverless, with dedicated AWS Lambda functions for user management, points processing, logging, and admin operations, all coordinated through API Gateway. The React frontend connects to each Lambda service directly and is deployed via a GitHub Actions CI/CD pipeline to AWS. The platform was live at itsag1t4.com and designed to be multi-tenant, supporting different company brands within a single deployment.',
    screenshots: [],
    demo: [
      { type: 'youtube', id: 'tZoib7KH-so' },
      { type: 'youtube', id: 'OR16wgf3y9Y' },
      { type: 'youtube', id: '-Epsl7PbIco' }
    ],
    links: {
      github: 'https://github.com/kelynwong/project-2023-24t2-project-2023-24t2-g1-t4',
      figma: 'https://www.figma.com/design/5IpZhAPkqxzfgmEI9H1cXp/ITSA?node-id=112-44488&p=f&t=lRNqY5HltJ6Rx709-0',
    },
    tags: ['React', 'JavaScript', 'Python', 'AWS Lambda', 'AWS API Gateway', 'AWS Cognito', 'AWS SAM', 'CI/CD', 'GitHub Actions'],
    year: '2023 - 2024',
  },
];

export const PROJECT_CATEGORY_ORDER = [
  { key: 'iot', label: 'IoT Projects' },
  { key: 'mobile', label: 'Mobile Apps' },
  { key: 'fullstack', label: 'Full Stack Projects' },
]
