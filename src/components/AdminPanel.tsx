import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Lock, Key, Users, Award, Database, Search, Plus, Trash2, Edit2, 
  Eye, EyeOff, Save, CheckCircle, Smartphone, AlertCircle, RefreshCw, X, FolderOpen, Mail, UserPlus
} from "lucide-react";
import { Student, ModelTestResult, VisitorMessage, Notice, NoticeComment, PdfSheet, CoachingPhoto } from "../types";
import { COURSES } from "../data";

interface AdminPanelProps {
  students: Student[];
  results: ModelTestResult[];
  visitorMessages: VisitorMessage[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (roll: string) => void;
  onUpdateStudent: (student: Student) => void;
  onAddOrUpdateResult: (result: ModelTestResult) => void;
  notices: Notice[];
  onAddNotice: (title: string, content: string) => void;
  onDeleteNotice: (id: string) => void;
  onUpdateNotice: (notice: Notice) => void;
  onDeleteComment: (noticeId: string, commentId: string) => void;
  pdfSheets?: PdfSheet[];
  onAddPdfSheet?: (sheet: PdfSheet) => void;
  onDeletePdfSheet?: (id: string) => void;
  coachingPhotos?: CoachingPhoto[];
  onAddCoachingPhoto?: (photo: CoachingPhoto) => void;
  onDeleteCoachingPhoto?: (id: string) => void;
  isAdmin?: boolean;
  onAuthChange?: (auth: boolean) => void;
}

export default function AdminPanel({
  students,
  results,
  visitorMessages,
  onAddStudent,
  onDeleteStudent,
  onUpdateStudent,
  onAddOrUpdateResult,
  notices,
  onAddNotice,
  onDeleteNotice,
  onUpdateNotice,
  onDeleteComment,
  pdfSheets = [],
  onAddPdfSheet,
  onDeletePdfSheet,
  coachingPhotos = [],
  onAddCoachingPhoto,
  onDeleteCoachingPhoto,
  isAdmin = false,
  onAuthChange
}: AdminPanelProps) {
  const [adminPin, setAdminPin] = useState("");
  // Synchronous initial authentication state from session or props
// Removed local isAuthenticated state, using isAdmin prop directly

  const [errorInput, setErrorInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showPins, setShowPins] = useState<{ [roll: string]: boolean }>({});
  
  // Tab within Admin Panel: 'database', 'leads', 'add-result', 'notices', 'pdf-sheets', 'coaching-photos'
  const [adminTab, setAdminTab] = useState<"database" | "leads" | "add-result" | "notices" | "pdf-sheets" | "coaching-photos">("database");

  // Form State: Add/Edit Notice
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [isEditingNotice, setIsEditingNotice] = useState<string | null>(null); // notice ID
  const [noticeSuccess, setNoticeSuccess] = useState("");

  // Form State: Add/Edit Student
  const [isEditingStudent, setIsEditingStudent] = useState<string | null>(null); // roll
  const [showAddModal, setShowAddModal] = useState(false);
  const [formRoll, setFormRoll] = useState("");
  const [formName, setFormName] = useState("");
  const [formFather, setFormFather] = useState("");
  const [formMother, setFormMother] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCourse, setFormCourse] = useState(COURSES[0].title);
  const [formPin, setFormPin] = useState("");
  const [formPictureUrl, setFormPictureUrl] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Form State: Add/Update Student Result
  const [resRoll, setResRoll] = useState("");
  const [resMcq, setResMcq] = useState(0);
  const [resPractical, setResPractical] = useState(0);
  const [resViva, setResViva] = useState(0);
  const [resRemarks, setResRemarks] = useState("");
  const [resPdfUrl, setResPdfUrl] = useState("");
  const [resSuccessMessage, setResSuccessMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");

    // Admin PINS are either 40404343 or ;M7#@F!9qL$
    if (adminPin.trim() === "40404343" || adminPin.trim() === ";M7#@F!9qL$") {
      try {
        sessionStorage.setItem("swapno_it_is_admin", "true");
      } catch (err) {
        console.warn("Storage failed:", err);
      }
      if (onAuthChange) {
        onAuthChange(true);
      }
      setAdminPin("");
    } else {
      setErrorInput("দুঃখিত, ভুল অ্যাডমিন পিন কোড! শুধুমাত্র সাইদ স্যারের বিশেষ পিন দিয়ে প্রবেশ সম্ভব।");
    }
  };

  const togglePinVisibility = (roll: string) => {
    setShowPins(prev => ({ ...prev, [roll]: !prev[roll] }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("দুঃখিত, ফাইলের সাইজ ২ মেগাবাইটের কম হতে হবে!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormPictureUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess("");

    if (!formRoll || !formName || !formMobile || !formPin) {
      alert("রোল, নাম, মোবাইল এবং সিকিউরিটি পিন অবশ্যই দিতে হবে!");
      return;
    }

    if (formPin.trim().length < 4 || formPin.trim().length > 8) {
      alert("সিকিউরিটি পিন অবশ্যই ৪ থেকে ৮ সংখ্যার মধ্যে হতে হবে!");
      return;
    }

    // Check roll unique if adding fresh
    if (!isEditingStudent && students.some(s => s.roll === formRoll.trim())) {
      alert("এই রোল নম্বরের শিক্ষার্থী ইতিপূর্বেই ডাটাবেজে নথিবদ্ধ করা আছে!");
      return;
    }

    const newStudent: Student = {
      roll: formRoll.trim(),
      name: formName.trim(),
      fatherName: formFather.trim() || "N/A",
      motherName: formMother.trim() || "N/A",
      mobile: formMobile.trim(),
      address: formAddress.trim() || "আমান বাজার, চট্টগ্রাম",
      course: formCourse,
      pin: formPin.trim(),
      regDate: isEditingStudent 
        ? (students.find(s => s.roll === isEditingStudent)?.regDate || new Date().toISOString().split("T")[0])
        : new Date().toISOString().split("T")[0],
      pictureUrl: formPictureUrl.trim()
    };

    if (isEditingStudent) {
      onUpdateStudent(newStudent);
      setFormSuccess("শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!");
    } else {
      onAddStudent(newStudent);
      setFormSuccess("নতুন শিক্ষার্থী সফলভাবে ডাটাবেজে যুক্ত হয়েছে!");
    }

    // Reset Form
    setTimeout(() => {
      setShowAddModal(false);
      resetStudentForm();
    }, 1500);
  };

  const resetStudentForm = () => {
    setFormRoll("");
    setFormName("");
    setFormFather("");
    setFormMother("");
    setFormMobile("");
    setFormAddress("");
    setFormCourse(COURSES[0].title);
    setFormPin("");
    setFormPictureUrl("");
    setIsEditingStudent(null);
    setFormSuccess("");
  };

  const openEditModal = (student: Student) => {
    setIsEditingStudent(student.roll);
    setFormRoll(student.roll);
    setFormName(student.name);
    setFormFather(student.fatherName);
    setFormMother(student.motherName);
    setFormMobile(student.mobile);
    setFormAddress(student.address);
    setFormCourse(student.course);
    setFormPin(student.pin);
    setFormPictureUrl(student.pictureUrl || "");
    setShowAddModal(true);
  };

  const handleResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResSuccessMessage("");

    if (!resRoll) {
      alert("শিক্ষার্থীর রোল সিলেক্ট করুন!");
      return;
    }

    const linkedStudent = students.find(s => s.roll === resRoll);
    if (!linkedStudent) {
      alert("নির্বাচিত রোলের কোনো শিক্ষার্থী পাওয়া যায়নি!");
      return;
    }

    const totalMarks = Number(resMcq) + Number(resPractical) + Number(resViva);
    
    // Calculate Point and Grade
    let gpaPoint = 0;
    let gpaGrade = "F";
    if (totalMarks >= 80) { gpaPoint = 5.0; gpaGrade = "A+"; }
    else if (totalMarks >= 70) { gpaPoint = 4.0; gpaGrade = "A"; }
    else if (totalMarks >= 60) { gpaPoint = 3.5; gpaGrade = "A-"; }
    else if (totalMarks >= 50) { gpaPoint = 3.0; gpaGrade = "B"; }
    else if (totalMarks >= 40) { gpaPoint = 2.0; gpaGrade = "C"; }

    const newResult: ModelTestResult = {
      roll: resRoll,
      name: linkedStudent.name,
      course: linkedStudent.course,
      mcqMarks: Number(resMcq),
      practicalMarks: Number(resPractical),
      vivaMarks: Number(resViva),
      total: totalMarks,
      gpaPoint,
      gpaGrade,
      remarks: resRemarks.trim() || "উত্তীর্ণ হয়েছেন। নিয়মিত ক্লাসে থাকুন।",
      pdfUrl: resPdfUrl.trim() || undefined
    };

    onAddOrUpdateResult(newResult);
    setResSuccessMessage("মডেল টেস্ট স্কোরকার্ড সফলভাবে এন্ট্রি/আপডেট করা হয়েছে!");
    
    // Clear Score fields
    setTimeout(() => {
      setResRoll("");
      setResMcq(0);
      setResPractical(0);
      setResViva(0);
      setResRemarks("");
      setResPdfUrl("");
      setResSuccessMessage("");
    }, 1500);
  };

  const handleLogOut = () => {
    try {
      sessionStorage.removeItem("swapno_it_is_admin");
    } catch (e) {}
    setAdminPin("");
    if (onAuthChange) {
      onAuthChange(false);
    }
  };

  // Convert admission lead to students form preset
  const convertLead = (lead: VisitorMessage) => {
    resetStudentForm();
    setFormName(lead.name);
    setFormMobile(lead.mobile);
    const matchedCourse = COURSES.find(c => c.id === lead.courseOfInterest || c.title === lead.courseOfInterest);
    if (matchedCourse) {
      setFormCourse(matchedCourse.title);
    }
    // Generate randomized 4 digit PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormPin(generatedPin);
    
    // Generate next Roll Number
    const rollsList = students.map(s => Number(s.roll)).filter(r => !isNaN(r));
    const nextRoll = rollsList.length > 0 ? (Math.max(...rollsList) + 1).toString() : "1016";
    setFormRoll(nextRoll);

    setAdminTab("database");
    setShowAddModal(true);
  };

  // Filter and Search logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll.includes(searchQuery) ||
      student.mobile.includes(searchQuery);
    
    const matchesCourse = 
      courseFilter === "all" || 
      student.course === courseFilter;

    return matchesSearch && matchesCourse;
  });

  // Calculate Metrics dashboard
  const totalStudentsCount = students.length;
  const gradeAPlusCount = results.filter(r => r.gpaGrade === "A+").length;
  const averageTotalMark = results.length > 0
    ? Math.round(results.reduce((acc, current) => acc + current.total, 0) / results.length)
    : 0;

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-800">অ্যাডমিন কন্ট্রোল প্যানেল</h3>
            <p className="text-sm text-slate-500">
              এই অংশটি লক করা। ডাটাবেজে স্টুডেন্ট যোগ ও পরীক্ষার ফলাফল প্রকাশ করতে পিন কোড দিয়ে লগইন করুন।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                অফিস অ্যাডমিন পিন (Office Admin PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="অফিস ৮-সংখ্যার পিন (যেমন: 40404343)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorInput && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex gap-2 items-start text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorInput}</span>
              </div>
            )}

            <button
              type="submit"
              id="btn-admin-submit"
              className="w-full bg-slate-900 hover:bg-slate-850 hover:shadow-lg text-white rounded-xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              পোর্টাল আনলক করুন
            </button>
          </form>

          <p className="text-[10px] text-slate-400 font-mono">
            *অফিস ব্যবহারের জন্য সংরক্ষিত। শিক্ষার্থীদের রোল পিন এখানে কাজ করবে না।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-rose-500" />
            অফিস ও ডাটাবেজ অ্যাডমিনিস্ট্রেশন
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            পরিচালক: মোহাম্মদ সাঈদ স্যারের স্বয়ংক্রিয় স্টুডেন্ট ও একাডেমিক ম্যানেজমেন্ট কনসোল।
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab("database")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "database"
                ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            স্টুডেন্ট ডাটাবেজ ({students.length})
          </button>
          <button
            onClick={() => setAdminTab("add-result")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "add-result"
                ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            মার্কশীট এন্ট্রি / ফলাফল প্রকাশ
          </button>
          <button
            onClick={() => setAdminTab("leads")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
              adminTab === "leads"
                ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            ভর্তি ইচ্ছুক বার্তা ({visitorMessages.length})
            {visitorMessages.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black animate-pulse">
                {visitorMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab("notices")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "notices"
                ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            নোটিশ বোর্ড ও মন্তব্য মডারেশন ({notices.length})
          </button>
          <button
            onClick={() => setAdminTab("pdf-sheets")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "pdf-sheets"
                ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            পিডিএফ শিট ({pdfSheets.length})
          </button>
          <button
            onClick={() => setAdminTab("coaching-photos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "coaching-photos"
                ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            ল্যাব গ্যালারি ছবি ({coachingPhotos.length})
          </button>
          <button
            onClick={handleLogOut}
            className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* Mini Visual Dashboards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="p-3 bg-rose-50 text-rose-550 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">মোট নথিবদ্ধ শিক্ষার্থী</p>
            <strong className="text-2xl text-slate-800 font-mono font-black">{totalStudentsCount} জন</strong>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">সেরা জিপিএ এ প্লাস (A+)</p>
            <strong className="text-2xl text-slate-800 font-mono font-black">{gradeAPlusCount} জন</strong>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">গড় মডেল টেস্ট মার্কস</p>
            <strong className="text-2xl text-slate-800 font-mono font-black">{averageTotalMark}%</strong>
          </div>
        </div>
      </div>

      {/* Main Tab View Contents */}
      {adminTab === "database" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Query, Filter, & Add Student trigger */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="নাম, রোল বা মোবাইল দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
         