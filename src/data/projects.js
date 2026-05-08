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
    coverImage: '/src/assets/images/projects/fingerprint-cover.jpg', // replace with actual project image
    coverAlt: 'Fingerprint Door Access System',
    short: 'Biometric door access with Arduino, ThingSpeak, Android app & Twitter alerts',
    description: 'A fingerprint-based door access system built with an Arduino Uno, fingerprint sensor, LCD screen, buzzer, servo motor, ultrasonic sensor, and Bluetooth module. ThingSpeak handles data logging and monitoring, while the Android app provides access-log viewing, remote door lock and unlock control, and LCD message display. Twitter is used to send intruder alerts when suspicious activity is detected.',
    screenshots: [], // add paths like ['/src/assets/projects/fingerprint-1.jpg', ...]
    demo: { type: 'youtube', id: '-_Hpm2QKk54' },
    demoThumb: null,
    links: {
      github: 'https://github.com/KelynWong/FingerprintDoorAccess',
      live: null,
    },
    tags: ['C++', 'Arduino', 'ThingSpeak', 'Android', 'Twitter API'],
    year: 2023,
    featured: true,
  },
  {
    id: 'keypad-access',
    title: 'Keypad Door Access System',
    coverImage: '/src/assets/images/projects/keypad-cover.jpg',
    coverAlt: 'Keypad Door Access System',
    short: 'Raspberry Pi-based access with Streamlit dashboard, real-time video & notifications',
    description: 'A keypad-based door access system built with a Raspberry Pi, ultrasonic sensor to detect someone near the entrance, a keypad for passcode entry, a servo motor to lock or unlock the door, a buzzer for local alerts, an LCD screen for status messages and a camera to show live feed. Integrates with ThingSpeak to log events and send notifications when incorrect passwords are entered or when movement is detected without a valid code. A companion Streamlit dashboard provides a live video view, access analytics, and remote controls for the door and buzzer, making it possible to monitor and manage the system from a web interface. Twitter is used to send intruder alerts when suspicious activity is detected.',
    screenshots: [],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/IntruderAlertDoorSystem',
      live: null,
    },
    tags: ['Python', 'Raspberry Pi', 'ThingSpeak', 'Streamlit', 'Twitter API'],
    year: 2023,
  },
  {
    id: 'face-recognition-attendance',
    title: 'Face Recognition Attendance System',
    coverImage: '/src/assets/images/projects/face-recognition-cover.jpg',
    coverAlt: 'Face Recognition Attendance System',
    short: 'Automated attendance with face recognition, OpenCV, MySQL & Streamlit analytics',
    description: 'A face recognition-based attendance system built with Raspberry Pi 3 B+, camera, LCD screen, ultrasonic sensor, green LED, buzzer, OpenCV, and MySQL. The system captures student faces from a camera feed, matches them against a stored encoding database, and records attendance automatically for each class. A Streamlit dashboard lets lecturers log in, review attendance records, and view class analytics and reports.',
    screenshots: [],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/FaceRecognitionAttendanceSys',
      live: null,
    },
    tags: ['Python', 'OpenCV', 'Node-RED', 'Streamlit', 'MySQL'],
    year: 2023,
  },
  {
    id: 'smart-fitness-trainer',
    title: 'Smart Fitness Trainer',
    coverImage: '/src/assets/images/projects/smart-fitness-cover.jpg',
    coverAlt: 'Smart Fitness Trainer',
    short: 'AI-powered workout coach with pose estimation, rep counting & analytics dashboard',
    description: 'A smart fitness trainer system built with Raspberry Pi, USB camera, speakers, fitness band, monitor and supabase. The system uses pose estimation to analyze user form during exercises, providing real-time feedback and counting repetitions. A Streamlit dashboard allows users to log in, start/stop workouts, track their workout history & analytics, goals and manage their profiles.',
    screenshots: [],
    demo: { type: 'youtube', id: 'lYzs-p9fdCA' },
    links: {
      github: 'https://github.com/KelynWong/CPS-SmartFitnessTrainer',
      live: null,
    },
    tags: ['Python', 'Streamlit', 'Supabase'],
    year: 2023,
  },
  {
    id: 'covid-mobile-app',
    title: 'An Informative COVID Mobile App',
    coverImage: '/src/assets/images/projects/covid-cover.jpg',
    coverAlt: 'COVID Information Mobile App',
    short: 'Android COVID info app with stats, news, symptoms, prevention & dark mode',
    description: 'An Android COVID-19 information app with Home, Search, World, Information, and Settings screens. It displays country and global case statistics, trending news, symptoms and prevention guidance, and includes UI preferences such as dark mode, language selection, and font settings.',
    screenshots: [],
    demo: { type: 'link', id: 'https://www.figma.com/design/YwuKASh95itWhuyks9SufW/ANDE---CoD-Assignment-Wireframes?node-id=0-1&t=AdDF6838MXWSJ55J-1' },
    demoThumb: null,
    links: {
      github: 'https://github.com/KelynWong/VirusNow',
      live: null,
    },
    tags: ['Java', 'Android SDK', 'AndroidX', 'Material Components', 'SQLite', 'AsyncHttp', 'Picasso'],
    year: 2022,
  },
  {
    id: 'jibaboom',
    title: 'JiBaBoom',
    coverImage: '/src/assets/images/projects/jibaboom-cover.jpg',
    coverAlt: 'JiBaBoom',
    short: 'Full-stack app with PostgreSQL API, browser viewer & mobile companion',
    description: 'A full-stack application development project with a PostgreSQL-backed API, a browser-based data and results viewer, and a mobile companion app for viewing results and caching responses offline.',
    screenshots: [],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/applicationDevelopment',
      live: null,
    },
    tags: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Express', 'PostgreSQL'],
    year: 2022,
  },
  {
    id: 'nomsters',
    title: 'Nomsters',
    coverImage: '/src/assets/images/projects/nomsters-cover.jpg',
    coverAlt: 'Nomsters Recipe App',
    short: 'Vue 3 recipe discovery & meal planning with nutrition analysis & grocery shopping',
    description: 'A web application for recipe discovery, sharing and meal planning that combines user accounts, favourite/submitable recipes, nutrition analysis (Spoonacular integration), ingredient cost estimation and a grocery feature. The backend exposes authenticated REST endpoints (signup/login, user profiles, recipes, diets, cuisines, favourites) and the frontend is a Vue 3 + Vite single-page interface with pages for browsing, recipe details, profile and grocery/meal-prep flows.',
    screenshots: [],
    demo: { type: 'youtube', id: '_zvcPr-Z5L8' },
    links: {
      github: 'https://github.com/KelynWong/Nomsters',
      live: null,
    },
    tags: ['Vue 3', 'Vite', 'CSS', 'JavaScript', 'HTML', 'Node.js', 'Express', 'MySQL', 'Spoonacular API'],
    year: 2022,
  },
  {
    id: 'tournament-management',
    title: 'Tournament Management System',
    coverImage: '/src/assets/images/projects/tournament-cover.jpg',
    coverAlt: 'Tournament Management System',
    short: 'Web-based system for organizing competitions, fixtures & results tracking',
    description: 'A web-based tournament management system for organizing competitions, tracking fixtures and results, and keeping tournament data in one place.',
    screenshots: [],
    demo: null,
    links: {
      github: 'https://github.com/KelynWong/CSD_G1T4',
      live: null,
    },
    tags: [],
    year: 2021,
  },
  {
    id: 'task-master',
    title: 'Task Master',
    coverImage: '/src/assets/images/projects/task-master-cover.jpg',
    coverAlt: 'Task Master Project Management',
    short: 'Microservices-based project management with Docker, group creation & task assignment',
    description: 'A comprehensive task and project management platform designed to streamline workflows. Users can generate ideas, create groups, enroll members, and assign tasks all in one place. Built with a microservices architecture featuring separate services for idea generation, group creation, enrollment, and task assignment, each with dedicated REST APIs.',
    screenshots: [],
    demo: { type: 'youtube', id: 'GXQHg51Abq8' },
    links: {
      github: 'https://github.com/kaixuantan/task_management_microservices',
      live: null,
    },
    tags: ['Vue', 'JavaScript', 'Python', 'Flask', 'Docker', 'Docker Compose', 'Node.js', 'SCSS'],
    year: 2023,
  },
];
