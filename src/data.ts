import { Student, ModelTestResult, Course } from "./types";

export const COURSES: Course[] = [
  {
    id: "office-app",
    title: "Computer Office Application",
    bengliTitle: "কম্পিউটার অফিস অ্যাপ্লিকেশন (MS Word, Excel, PowerPoint, Access)",
    duration: "3 Months / 6 Months",
    fee: 4500,
    icon: "Monitor",
    skillsCovered: [
      "Microsoft Word (Documentation, Bangla Typing, Formatting)",
      "Microsoft Excel (Mathematical Calculations, Formatting, Charts)",
      "Microsoft PowerPoint (Presentations, Slide Animations, Transitions)",
      "Microsoft Access (Basic Database, Tables, Queries, Reports)",
      "Internet Browsing, Emailing, Government Job Circular Applications"
    ],
    schedule: "Sun, Tue, Thu (flexible batches)"
  },
  {
    id: "graphics-design",
    title: "Graphic Design & Multimedia",
    bengliTitle: "গ্রাফিক ডিজাইন ও মাল্টিমিডিয়া (Adobe Illustrator, Photoshop)",
    duration: "6 Months",
    fee: 8000,
    icon: "Palette",
    skillsCovered: [
      "Adobe Photoshop (Image Editing, Retouching, Photo Manipulation)",
      "Adobe Illustrator (Vector Design, Logo, Poster, Business Card)",
      "Bengali & English Typography (Bijoy Bayanno & Avro)",
      "Color Theory, Layout Design & Branding Concepts",
      "Freelancing Guidelines (Fiverr, Upwork, Freelancer)"
    ],
    schedule: "Mon, Wed, Sat"
  },
  {
    id: "web-dev",
    title: "Professional Web Development",
    bengliTitle: "প্রফেশনাল ওয়েব ডেভেলপমেন্ট (HTML, CSS, Tailwind, JS, React)",
    duration: "6 Months",
    fee: 12000,
    icon: "Code",
    skillsCovered: [
      "HTML5, CSS3, Modern Responsive Layouts",
      "Tailwind CSS Utility-First Styling Framework",
      "JavaScript Programming Fundamentals & DOM Manipulation",
      "React JS Component Architecture & Hooks",
      "Git & GitHub Version Control, Vercel & Netlify Deployment"
    ],
    schedule: "Mon, Wed, Fri (Evening Batch)"
  },
  {
    id: "database",
    title: "Database Programming & MS Access",
    bengliTitle: "ডেটাবেজ প্রোগ্রামিং অ্যান্ড ডিজাইন",
    duration: "3 Months",
    fee: 5500,
    icon: "Database",
    skillsCovered: [
      "Relational Database Management Systems (RDBMS)",
      "Microsoft Access Advanced forms, subforms, and SQL queries",
      "Excel VBA & Advanced Functions",
      "Data Normalization & Schema Planning",
      "Practical Office Office Billing System Projects"
    ],
    schedule: "Sun, Tue, Thu"
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    roll: "1001",
    name: "Md Minhajul Kabir",
    fatherName: "Kabir Ahmed",
    motherName: "Minu Ara Begum",
    mobile: "01823901234",
    address: "Aman Bazar, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "2021",
    regDate: "2026-01-10",
    pictureUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    roll: "1002",
    name: "Nur Islam Babo",
    fatherName: "Badiul Alam",
    motherName: "Fatema Begum",
    mobile: "01754123456",
    address: "Chowdhury Hat, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "1994",
    regDate: "2026-01-12",
    pictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    roll: "1003",
    name: "Hamida Sultana",
    fatherName: "Mohiuddin Ahmed",
    motherName: "Sultana Razia",
    mobile: "01912345678",
    address: "Fatehpur, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "1885",
    regDate: "2026-01-15",
    pictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    roll: "1004",
    name: "Rakibul Hassan",
    fatherName: "Abul Hashem",
    motherName: "Rehana Begum",
    mobile: "01684321098",
    address: "Katirhat, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "3302",
    regDate: "2026-01-15",
    pictureUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    roll: "1005",
    name: "Suprity Shil",
    fatherName: "Niranjan Shil",
    motherName: "Sabita Shil",
    mobile: "01511223344",
    address: "Modunaghat, Hathazari, Chittagong",
    course: "Graphic Design & Multimedia",
    pin: "4050",
    regDate: "2026-01-18",
    pictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    roll: "1006",
    name: "Tusha Chowdhury",
    fatherName: "Dilip Chowdhury",
    motherName: "Purnima Chowdhury",
    mobile: "01815667788",
    address: "Aman Bazar, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "2020",
    regDate: "2026-01-20"
  },
  {
    roll: "1007",
    name: "Jubayer Ivna",
    fatherName: "Abu Taher",
    motherName: "Rowshan Ara",
    mobile: "01944556677",
    address: "University Gate, Hathazari, Chittagong",
    course: "Graphic Design & Multimedia",
    pin: "1122",
    regDate: "2026-01-22"
  },
  {
    roll: "1008",
    name: "Shirin Akter",
    fatherName: "Abdul Gaffar",
    motherName: "Khadiza Begum",
    mobile: "01788990011",
    address: "Sarkar Hat, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "4590",
    regDate: "2026-01-25"
  },
  {
    roll: "1009",
    name: "Nusrat Alam",
    fatherName: "Khorshed Alam",
    motherName: "Nasrin Sultana",
    mobile: "01855663322",
    address: "Aman Bazar, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "1885",
    regDate: "2026-01-28"
  },
  {
    roll: "1010",
    name: "Emon Chowdhury",
    fatherName: "Subhash Chowdhury",
    motherName: "Kakoly Chowdhury",
    mobile: "01988776655",
    address: "Chowdhury Hat, Hathazari",
    course: "Professional Web Development",
    pin: "8899",
    regDate: "2026-02-01"
  },
  {
    roll: "1011",
    name: "Sharmin Jerin",
    fatherName: "Rafiqul Islam",
    motherName: "Kamrun Nahar",
    mobile: "01711229988",
    address: "Nandir Hat, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "7070",
    regDate: "2026-02-05"
  },
  {
    roll: "1012",
    name: "Hasan Tareq",
    fatherName: "Kamal Uddin",
    motherName: "Monoara Begum",
    mobile: "01833003488",
    address: "Fatehpur, Hathazari, Chittagong",
    course: "Professional Web Development",
    pin: "5050",
    regDate: "2026-02-08"
  },
  {
    roll: "1013",
    name: "Taohid Tanvir",
    fatherName: "Shamsul Alam",
    motherName: "Tasmin Ara",
    mobile: "01521445566",
    address: "Sipahisigh, Hathazari, Chittagong",
    course: "Computer Office Application",
    pin: "1234",
    regDate: "2026-02-10"
  },
  {
    roll: "1014",
    name: "Yasar Bin Faiz",
    fatherName: "Faiz Ahmed",
    motherName: "Sultana Faiz",
    mobile: "01899990011",
    address: "Aman Bazar, Hathazari",
    course: "Database Programming & MS Access",
    pin: "9900",
    regDate: "2026-02-12"
  },
  {
    roll: "1015",
    name: "Ikrar Jahan",
    fatherName: "Jahangir Alam",
    motherName: "Ismat Ara",
    mobile: "01941652111",
    address: "Chowdhury Hat, Chittagong",
    course: "Graphic Design & Multimedia",
    pin: "3636",
    regDate: "2026-02-15"
  }
];

export const INITIAL_RESULTS: ModelTestResult[] = [
  {
    roll: "1001",
    name: "Md Minhajul Kabir",
    course: "Computer Office Application",
    mcqMarks: 44,
    practicalMarks: 36,
    vivaMarks: 9,
    total: 89,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "চমৎকার পারফরম্যান্স! আপনার টাইপিং এবং ফর্মুলা স্কিল খুবই ভালো।"
  },
  {
    roll: "1002",
    name: "Nur Islam Babo",
    course: "Computer Office Application",
    mcqMarks: 38,
    practicalMarks: 32,
    vivaMarks: 8,
    total: 78,
    gpaPoint: 4.5,
    gpaGrade: "A",
    remarks: "খুব চমৎকার। এক্সেল ফর্মুলাগুলোতে আরও একটু অনুশীলন করতে হবে।"
  },
  {
    roll: "1003",
    name: "Hamida Sultana",
    course: "Computer Office Application",
    mcqMarks: 46,
    practicalMarks: 38,
    vivaMarks: 10,
    total: 94,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "অসাধারণ ফলাফল! ব্যাচের অন্যতম সেরা মার্কশীট আপনার।"
  },
  {
    roll: "1004",
    name: "Rakibul Hassan",
    course: "Computer Office Application",
    mcqMarks: 42,
    practicalMarks: 35,
    vivaMarks: 8,
    total: 85,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "উত্তীর্ণ হয়েছেন। কম্পিউটার ডক্যুমেন্টেশনে দারুণ সাবলীলতা দেখিয়েছেন।"
  },
  {
    roll: "1005",
    name: "Suprity Shil",
    course: "Graphic Design & Multimedia",
    mcqMarks: 35,
    practicalMarks: 38,
    vivaMarks: 9,
    total: 82,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "ডিজাইন সেন্স অত্যন্ত সুক্ষ্ম ও চমৎকার। কালার সিলেকশন প্রশংসনীয়।"
  },
  {
    roll: "1006",
    name: "Tusha Chowdhury",
    course: "Computer Office Application",
    mcqMarks: 32,
    practicalMarks: 28,
    vivaMarks: 7,
    total: 67,
    gpaPoint: 3.5,
    gpaGrade: "A-",
    remarks: "উত্তীর্ণ হয়েছেন। তবে থিওরি এবং শর্টকাট কি গুলোতে মনোযোগ বাড়াতে হবে।"
  },
  {
    roll: "1007",
    name: "Jubayer Ivna",
    course: "Graphic Design & Multimedia",
    mcqMarks: 36,
    practicalMarks: 34,
    vivaMarks: 8,
    total: 78,
    gpaPoint: 4.5,
    gpaGrade: "A",
    remarks: "ভেক্টর ড্রইং এ দারুণ দক্ষতা দেখিয়েছেন। টাইপ টুল নিয়ে আরও প্র্যাকটিস করুন।"
  },
  {
    roll: "1008",
    name: "Shirin Akter",
    course: "Computer Office Application",
    mcqMarks: 40,
    practicalMarks: 33,
    vivaMarks: 8,
    total: 81,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "অনেক চমৎকার পারফরম্যান্স। স্পিড আরও বাড়ানোর ওপর জোর দিন।"
  },
  {
    roll: "1009",
    name: "Nusrat Alam",
    course: "Computer Office Application",
    mcqMarks: 45,
    practicalMarks: 37,
    vivaMarks: 9,
    total: 91,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "এ প্লাস! থিউরি এবং প্র্যাক্টিক্যাল দুটোতেই অনেক পরিপক্ব।"
  },
  {
    roll: "1010",
    name: "Emon Chowdhury",
    course: "Professional Web Development",
    mcqMarks: 38,
    practicalMarks: 35,
    vivaMarks: 9,
    total: 82,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "রসপোর্ন্সিভ ডিজাইন ও CSS পজিশনিং অত্যন্ত সুন্দরভাবে ফুটিয়ে তুলেছেন।"
  },
  {
    roll: "1011",
    name: "Sharmin Jerin",
    course: "Computer Office Application",
    mcqMarks: 28,
    practicalMarks: 26,
    vivaMarks: 6,
    total: 60,
    gpaPoint: 3.0,
    gpaGrade: "B",
    remarks: "পাস করেছেন। পাওয়ার পয়েন্ট স্লাইড এবং এক্সেল শিটে আরও কঠোর প্র্যাকটিস প্রয়োজন।"
  },
  {
    roll: "1012",
    name: "Hasan Tareq",
    course: "Professional Web Development",
    mcqMarks: 45,
    practicalMarks: 38,
    vivaMarks: 10,
    total: 93,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "চমৎকার কোডিং স্টাইল! কমপ্লেক্স লজিক হ্যান্ডেলিং দক্ষতা অনেক উঁচুমনের।"
  },
  {
    roll: "1013",
    name: "Taohid Tanvir",
    course: "Computer Office Application",
    mcqMarks: 35,
    practicalMarks: 30,
    vivaMarks: 7,
    total: 72,
    gpaPoint: 4.0,
    gpaGrade: "A",
    remarks: "ভালো হয়েছে। নিয়মিত ক্লাসে আসার সুফল পেয়েছেন পরীক্ষায়।"
  },
  {
    roll: "1014",
    name: "Yasar Bin Faiz",
    course: "Database Programming & MS Access",
    mcqMarks: 42,
    practicalMarks: 36,
    vivaMarks: 8,
    total: 86,
    gpaPoint: 5.0,
    gpaGrade: "A+",
    remarks: "কোয়েরি রিলেশনশিপ এবং ফর্ম ডিজাইন নিখুঁত হয়েছে।"
  },
  {
    roll: "1015",
    name: "Ikrar Jahan",
    course: "Graphic Design & Multimedia",
    mcqMarks: 30,
    practicalMarks: 28,
    vivaMarks: 7,
    total: 65,
    gpaPoint: 3.5,
    gpaGrade: "A-",
    remarks: "পাস করেছেন। ফটোশপ লেয়ার মাস্কিং এবং পেন টুলে আরও মনযোগী হতে হবে।"
  }
];

export const GALLERY_IMAGES = [
  {
    id: 1,
    title: "আইটি ল্যাব ক্লাস সেশন",
    description: "স্বেচ্ছাসেবী কম্পিউটার ক্লাসে শিক্ষার্থীদের হাতেকলমে প্রশিক্ষণ প্রদান করা হচ্ছে।",
    url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    title: "সাফল্যের আনন্দ",
    description: "মডেল টেস্ট ও চূড়ান্ত পরীক্ষায় উত্তীর্ণ সেরা শিক্ষার্থীদের সার্টিফিকেট বিতরণ উৎসব।",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    title: "গ্রুপ ওয়ার্ক ও অনুশীলন",
    description: "দলগত কাজের মাধ্যমে ডেটাবেজ প্রোজেক্ট নিয়ে আলোচনা করছেন শিক্ষার্থীরা।",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 4,
    title: "উন্নত ল্যাব ফ্যাসিলিটি",
    description: "হ্যালুসিনেশনহীন ডেডিকেটেড কম্পিউটার আইটি রুম ও দ্রুতগতির ব্রডব্যান্ড ইন্টারনেট সুবিধা।",
    url: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=600"
  }
];
