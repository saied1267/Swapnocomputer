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
  onUpdateStudent: (student: Student, oldRoll?: string) => void;
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
  const [formDob, setFormDob] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCourse, setFormCourse] = useState(COURSES[0].title);
  const [formPin, setFormPin] = useState("");
  const [formPictureUrl, setFormPictureUrl] = useState("");
  const [formSerialNo, setFormSerialNo] = useState<number | "">("");
  const [formSuccess, setFormSuccess] = useState("");

  // Form State: Add/Update Student Result
  const [resRoll, setResRoll] = useState("");
  const [resExamType, setResExamType] = useState<"model_test" | "final_exam">("model_test");
  const [resMcq, setResMcq] = useState(0);
  const [resPractical, setResPractical] = useState(0);
  const [resViva, setResViva] = useState(0);
  const [resRemarks, setResRemarks] = useState("");
  const [resPdfUrl, setResPdfUrl] = useState("");
  const [resSuccessMessage, setResSuccessMessage] = useState("");

  const [customPinInput, setCustomPinInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");

    const customPin = localStorage.getItem("swapno_custom_admin_pin");
    const validPins = ["40404343", ";M7#@F!9qL$"];
    if (customPin) validPins.push(customPin);

    if (validPins.includes(adminPin.trim())) {
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
      dob: formDob,
      mobile: formMobile.trim(),
      address: formAddress.trim() || "আমান বাজার, চট্টগ্রাম",
      course: formCourse,
      pin: formPin.trim(),
      regDate: isEditingStudent 
        ? (students.find(s => s.roll === isEditingStudent)?.regDate || new Date().toISOString().split("T")[0])
        : new Date().toISOString().split("T")[0],
      pictureUrl: formPictureUrl.trim(),
      serialNo: formSerialNo === "" ? 999 : Number(formSerialNo)
    };

    if (isEditingStudent) {
      onUpdateStudent(newStudent, isEditingStudent);
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
    setFormDob("");
    setFormMobile("");
    setFormAddress("");
    setFormCourse(COURSES[0].title);
    setFormPin("");
    setFormPictureUrl("");
    setFormSerialNo("");
    setIsEditingStudent(null);
    setFormSuccess("");
  };

  const openEditModal = (student: Student) => {
    setIsEditingStudent(student.roll);
    setFormRoll(student.roll);
    setFormName(student.name);
    setFormFather(student.fatherName);
    setFormMother(student.motherName);
    setFormDob(student.dob || "");
    setFormMobile(student.mobile);
    setFormAddress(student.address);
    setFormCourse(student.course);
    setFormPin(student.pin);
    setFormPictureUrl(student.pictureUrl || "");
    setFormSerialNo(student.serialNo === undefined ? "" : student.serialNo);
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
    
    // Calculate Point and Grade using standard grading scale
    let gpaPoint = 0;
    let gpaGrade = "F";
    if (totalMarks >= 80) { gpaPoint = 5.0; gpaGrade = "A+"; }
    else if (totalMarks >= 70) { gpaPoint = 4.0; gpaGrade = "A"; }
    else if (totalMarks >= 60) { gpaPoint = 3.5; gpaGrade = "A-"; }
    else if (totalMarks >= 50) { gpaPoint = 3.0; gpaGrade = "B"; }
    else if (totalMarks >= 40) { gpaPoint = 2.0; gpaGrade = "C"; }
    else if (totalMarks >= 33) { gpaPoint = 1.0; gpaGrade = "D"; }

    const newResult: ModelTestResult = {
      roll: resRoll,
      name: linkedStudent.name,
      course: linkedStudent.course,
      examType: resExamType,
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
    setFormFather(lead.fatherName || "");
    setFormMother(lead.motherName || "");
    setFormDob(lead.dob || "");
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
  }).sort((a, b) => (a.serialNo || 999) - (b.serialNo || 999));

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
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              অফিস অ্যাডমিন পিন (Office Admin PIN)
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="অফিস কোড দিন"
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
            অফিস ও ডাটাবেজ ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            পরিচালক: মোহাম্মদ সাঈদ স্যারের স্বয়ংক্রিয় স্টুডেন্ট ও এডুকেশন ম্যানেজমেন্ট কনসোল।
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
            onClick={() => setShowSettings(true)}
            className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            পাসওয়ার্ড পরিবর্তন
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
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-600"
              >
                <option value="all">সকল কোর্স ফিল্টার</option>
                {COURSES.map(c => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => {
                resetStudentForm();
                // Generate next Roll Number
                const rollsList = students.map(s => Number(s.roll)).filter(r => !isNaN(r));
                const nextRoll = rollsList.length > 0 ? (Math.max(...rollsList) + 1).toString() : "1016";
                setFormRoll(nextRoll);
                // Generate secure random PIN
                const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
                setFormPin(generatedPin);
                setShowAddModal(true);
              }}
              className="w-full sm:w-auto bg-slate-900 hover:bg-rose-600 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              নতুন শিক্ষার্থী যুক্ত করুন
            </button>
          </div>

          {/* Database Grid Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 select-none text-[10px]">
                  <th className="py-3 px-4 font-bold text-left">সিরিয়াল</th>
                  <th className="py-3 px-4 font-bold text-left">রোল</th>
                  <th className="py-3 px-4 font-bold text-left">শিক্ষার্থীর বিবরণ</th>
                  <th className="py-3 px-4 font-bold text-left">পিতা ও মাতার নাম</th>
                  <th className="py-3 px-4 font-bold text-left">মোবাইল ও ঠিকানা</th>
                  <th className="py-3 px-4 font-bold text-left">কোর্স</th>
                  <th className="py-3 px-4 font-bold text-center">নিরাপত্তা পিন</th>
                  <th className="py-3 px-4 font-bold text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((stud) => {
                    const studentTestResult = results.find(r => r.roll === stud.roll);
                    return (
                      <tr key={stud.roll} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-left">{stud.serialNo || "-"}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-left">{stud.roll}</td>
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                              {stud.pictureUrl ? (
                                <img src={stud.pictureUrl} alt={stud.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Users className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm leading-tight">{stud.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">নিবন্ধন তারিখ: {stud.regDate || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <p className="text-slate-600"><span className="text-slate-400">পিতা:</span> {stud.fatherName}</p>
                          <p className="text-slate-600"><span className="text-slate-400">মাতার:</span> {stud.motherName}</p>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <p className="font-semibold text-indigo-700">{stud.mobile}</p>
                          <p className="text-[10px] text-slate-400">{stud.address}</p>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <span className="bg-slate-100 border border-slate-200 text-slate-800 py-1 px-2.5 rounded-full text-[10px] font-bold">
                            {stud.course}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{showPins[stud.roll] ? stud.pin : "••••"}</span>
                            <button
                              type="button"
                              onClick={() => togglePinVisibility(stud.roll)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showPins[stud.roll] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(stud)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="তথ্য এডিট"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিতভাবে ${stud.name}-এর ডাটাবেজ ডিলিট করতে চান?`)) {
                                  onDeleteStudent(stud.roll);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-450 text-xs">
                      দুঃখিত, কোনো শিক্ষার্থীর ডাটা তথ্য মিল পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === "add-result" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Form Side */}
          <div className="md:col-span-2 space-y-4">
            <div className="text-left border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">মার্কশীট ম্যানেজার</h3>
              <p className="text-xs text-slate-500">স্টুডেন্টের রোল নির্বাচন করে পরীক্ষার প্র্যাক্টিক্যাল ও এমসিকিউ স্কোর এন্ট্রি করুন।</p>
            </div>

            <form onSubmit={handleResultSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">শিক্ষার্থী নির্বাচন করুন (Roll & Name)</label>
                  <select
                    value={resRoll}
                    onChange={(e) => {
                      setResRoll(e.target.value);
                      const existingRes = results.find(r => r.roll === e.target.value);
                      if (existingRes) {
                        setResExamType(existingRes.examType || "model_test");
                        setResMcq(existingRes.mcqMarks);
                        setResPractical(existingRes.practicalMarks);
                        setResViva(existingRes.vivaMarks);
                        setResRemarks(existingRes.remarks);
                        setResPdfUrl(existingRes.pdfUrl || "");
                      } else {
                        setResExamType("model_test");
                        setResMcq(0);
                        setResPractical(0);
                        setResViva(0);
                        setResRemarks("");
                        setResPdfUrl("");
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- রোল সিলেক্ট করুন --</option>
                    {students.map(s => (
                      <option key={s.roll} value={s.roll}>
                        রোল: {s.roll} | {s.name} ({s.course})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">পরীক্ষার ধরন</label>
                  <select
                    value={resExamType}
                    onChange={(e) => setResExamType(e.target.value as "model_test" | "final_exam")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="model_test">মডেল টেস্ট</option>
                    <option value="final_exam">ফাইনাল বোর্ড পরীক্ষা</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">এমসিকিউ (লুক-আপ ৫০)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={resMcq}
                    onChange={(e) => setResMcq(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">চলতি ব্যবহারিক (৪০)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={resPractical}
                    onChange={(e) => setResPractical(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">মৌখিক ভাইভা (১০)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={resViva}
                    onChange={(e) => setResViva(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-center font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center text-xs text-indigo-900 font-bold font-mono">
                <span>সর্বমোট পরীক্ষা স্কোর (Total Marks):</span>
                <span className="text-base text-indigo-700 font-extrabold">{Number(resMcq) + Number(resPractical) + Number(resViva)} / ১০০</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">শিক্ষক মূল্যায়ন মন্তব্য</label>
                <textarea
                  placeholder="যেমন: চমৎকার পারফরম্যান্স! আপনার টাইলে টাইপিং স্পিড প্রশংসনীয়।"
                  value={resRemarks}
                  onChange={(e) => setResRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none h-16"
                  maxLength={150}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">অনলাইন রেজাল্ট শিট PDF লিঙ্ক (ঐচ্ছিক)</label>
                <input
                  type="url"
                  placeholder="যেমন: https://example.com/result.pdf"
                  value={resPdfUrl}
                  onChange={(e) => setResPdfUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">এই লিঙ্কে ফাইল থাকলে শিক্ষার্থীরা তাদের পোর্টাল প্রোফাইল থেকে সেটি সরাসরি ডাউনলোড করতে পারবে।</p>
              </div>

              {resSuccessMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex gap-2 items-center select-none font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{resSuccessMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-indigo-650 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                ফলাফল পাবলিশ / আপডেট করুন
              </button>
            </form>
          </div>

          {/* Results Overview List Side */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-left border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">প্রকাশিত মডেল টেস্ট গ্রেড লাইব্রেরী</h3>
              <p className="text-xs text-slate-500">শিক্ষার্থীদের অর্জিত মার্কস, মোট জিপিএ লেটার গ্রেড এবং শিক্ষকদের বিবরণ তালিকা।</p>
            </div>

            <div className="overflow-y-auto max-h-[350px] rounded-xl border border-slate-100">
              <table className="w-full text-left text-[11px] text-slate-600 min-w-[350px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 select-none">
                    <th className="py-2.5 px-3 font-bold">রোল / নাম</th>
                    <th className="py-2.5 px-3 font-bold text-center">এমসিকিউ</th>
                    <th className="py-2.5 px-3 font-bold text-center">ব্যবহারিক</th>
                    <th className="py-2.5 px-3 font-bold text-center">ভাইভা</th>
                    <th className="py-2.5 px-3 font-bold text-center">মোট স্কোর</th>
                    <th className="py-2.5 px-3 font-bold text-center">গ্রেড জিপিএ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {results.length > 0 ? (
                    results.map((res) => (
                      <tr key={res.roll} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-left">
                          <p className="font-bold text-slate-800">{res.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">রোল নম্বর: {res.roll}</p>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">{res.mcqMarks}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">{res.practicalMarks}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">{res.vivaMarks}</td>
                        <td className="py-2 px-3 text-center font-mono font-extrabold text-indigo-700">{res.total}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`${res.gpaGrade === 'F' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'} py-0.5 px-1.5 rounded text-[9px] font-black uppercase font-mono`}>
                            {res.gpaGrade} ({res.gpaPoint.toFixed(1)})
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        এখনো কোনো ফলাফল প্রকাশ করা হয়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {adminTab === "leads" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="text-left border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-base">অনলাইন অ্যাডমিশন রিকোয়েস্ট সমূহ (Leads)</h3>
            <p className="text-xs text-slate-500">ওয়েবসাইটের রেজিষ্ট্রেশন উইন্ডো থেকে ভর্তিচ্ছু শিক্ষার্থীদের আবেদন বিবরণী।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visitorMessages.length > 0 ? (
              visitorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left flex flex-col justify-between hover:shadow-md hover:shadow-slate-50/30 transition-all gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{msg.name}</h4>
                        <p className="text-[10px] text-indigo-750 font-bold flex items-center gap-1 mt-0.5 font-mono">
                          <Smartphone className="w-3 h-3" />
                          {msg.mobile}
                        </p>
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 rounded-full py-0.5 px-2.5 text-[9px] text-indigo-800 font-extrabold font-mono">
                        {msg.date}
                      </span>
                    </div>
                    
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-xs text-slate-650 space-y-2">
                      <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">পিতার নাম:</p>
                          <p className="font-semibold text-slate-700">{msg.fatherName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">মাতার নাম:</p>
                          <p className="font-semibold text-slate-700">{msg.motherName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">জন্ম তারিখ:</p>
                          <p className="font-semibold text-slate-700 font-mono">{msg.dob || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">আগ্রহের কোর্স:</p>
                          <p className="font-bold text-slate-800">{msg.courseOfInterest}</p>
                        </div>
                      </div>
                      {msg.message && (
                        <>
                          <p className="text-[10px] text-slate-405 font-bold mt-1">শিক্ষার্থীর তথ্য/বার্তা:</p>
                          <p className="italic font-medium text-slate-600">"{msg.message}"</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => convertLead(msg)}
                      className="bg-slate-900 hover:bg-rose-650 hover:shadow-lg text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      ভর্তি সম্পন্ন করুন (এন্ট্রি)
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <Mail className="w-8 h-8 text-slate-300" />
                <p>নতুন কোনো ভর্তির নোটিফিকেশন বা বার্তা সংরক্ষিত নেই এই মুহূর্তে।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === "notices" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="text-left border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">নোটিশ প্রকাশ ও মন্তব্য মডারেশন</h3>
              <p className="text-xs text-slate-505">শিক্ষার্থী ও হোমপেইজ ভিজিটরদের উদ্দেশ্যে গুরুত্বপূর্ণ নোটিশ পোস্ট বা সংশোধন করুন।</p>
            </div>
            {isEditingNotice && (
              <button
                onClick={() => {
                  setIsEditingNotice(null);
                  setNoticeTitle("");
                  setNoticeContent("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-650 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                সংশোধন বাতিল করুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column (4 cols) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNoticeSuccess("");
                if (!noticeTitle.trim() || !noticeContent.trim()) {
                  alert("শিরোনাম ও নোটিশের বিবরণ পূরণ করুন!");
                  return;
                }

                if (isEditingNotice) {
                  // editing
                  const original = notices.find(n => n.id === isEditingNotice);
                  if (original) {
                    onUpdateNotice({
                      ...original,
                      title: noticeTitle.trim(),
                      content: noticeContent.trim()
                    });
                    setNoticeSuccess("নোটিশটি সফলভাবে আপডেট করা হয়েছে!");
                  }
                  setIsEditingNotice(null);
                } else {
                  // publishing new
                  onAddNotice(noticeTitle, noticeContent);
                  setNoticeSuccess("নতুন নোটিশ প্রকাশিত হয়েছে এবং হোম পেজে লাইভ দেখাচ্ছে!");
                }

                setNoticeTitle("");
                setNoticeContent("");
                setTimeout(() => setNoticeSuccess(""), 3500);
              }}
              className="lg:col-span-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4 text-left"
            >
              <h4 className="font-black text-xs text-rose-550 uppercase tracking-widest">
                {isEditingNotice ? "📝 নোটিশ এডিট সংশোধন" : "📢 নতুন নোটিশ লিখুন"}
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">নোটিশের শিরোনাম (Title)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মডেল টেস্ট পরীক্ষার নোটিশ"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">নোটিশের বিষয়বস্তু (Body Content)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="এখানে বিস্তারিত নোটিশ এবং নির্দেশনা দিন..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-750 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {noticeSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold leading-relaxed">
                  {noticeSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md"
              >
                {isEditingNotice ? "আপডেট সংরক্ষণ করুন" : "নোটিশ পাবলিশ করুন 🚀"}
              </button>
            </form>

            {/* Notices and comments List column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <h4 className="font-black text-xs text-slate-500 text-left">প্রকাশিত নোটিশ সমূহ ও মন্তব্য রক্ষণাবেক্ষণ</h4>
              
              {notices.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-slate-400 text-xs italic">কোনো নোটিশ ডেটাবেজে সংরক্ষিত নেই।</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {notices.map((notice) => (
                    <div key={notice.id} className="border border-slate-100 rounded-2xl p-4 bg-white shadow-3xs space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h5 className="font-black text-slate-800 text-sm leading-snug">{notice.title}</h5>
                          <span className="text-[10px] text-slate-450 font-mono font-bold block">{notice.date}</span>
                        </div>
                        
                        {/* Edit / Delete actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setIsEditingNotice(notice.id);
                              setNoticeTitle(notice.title);
                              setNoticeContent(notice.content);
                              window.scrollTo({ top: 150, behavior: "smooth" });
                            }}
                            className="p-1.5 text-blue-650 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("এই নোটিশটি এবং এর সকল মন্তব্য কি মুছে ফেলতে চান?")) {
                                onDeleteNotice(notice.id);
                              }
                            }}
                            className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-650 text-xs whitespace-pre-line leading-relaxed italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        "{notice.content}"
                      </p>

                      <div className="flex items-center gap-3 text-[10px] font-mono font-black text-slate-400">
                        <span>লাইক সংখ্যা: {notice.likesCount}</span>
                        <span>•</span>
                        <span>মন্তব্য সংখ্যা: {notice.comments.length}</span>
                      </div>

                      {/* Nested comments moderator tool */}
                      {notice.comments.length > 0 && (
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">মন্তব্য মডারেশন প্যানেল</p>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {notice.comments.map((comment) => (
                              <div key={comment.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-50">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-slate-800 text-[10px] font-extrabold">{comment.authorName}</strong>
                                    <span className="text-[8px] text-slate-400 font-mono">{comment.date}</span>
                                  </div>
                                  <p className="text-slate-650 font-semibold text-[11px] leading-tight pr-4">{comment.text}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm("এই মন্তব্যটি কি মুছে ফেলতে চান?")) {
                                      onDeleteComment(notice.id, comment.id);
                                    }
                                  }}
                                  className="text-[9px] text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded font-black transition-colors shrink-0 cursor-pointer"
                                >
                                  মুছে ফেলুন
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === "pdf-sheets" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="text-left border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-base">লেকচার শিট (PDF) আপলোড ও ম্যানেজমেন্ট</h3>
            <p className="text-xs text-slate-500">ক্লাসরুম বা বিভিন্ন কোর্সের লেকচার এবং সাজেশন শিট শিক্ষার্থীদের ডাউনলোডের জন্য এখানে পোস্ট করুন।</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
              <h4 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-rose-500" />
                নতুন লেকচার শিট এন্ট্রি করুন
              </h4>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const titleInput = form.elements.namedItem("sheetTitle") as HTMLInputElement;
                  const courseSelect = form.elements.namedItem("sheetCourse") as HTMLSelectElement;
                  const urlInput = form.elements.namedItem("sheetUrl") as HTMLInputElement;

                  if (!titleInput.value.trim() || !urlInput.value.trim()) {
                    alert("দয়া করে শিরোনাম ও পিডিএফ ফাইলের সঠিক ইউআরএল দিন!");
                    return;
                  }

                  if (onAddPdfSheet) {
                    onAddPdfSheet({
                      id: `pdf-${Date.now()}`,
                      title: titleInput.value.trim(),
                      course: courseSelect.value,
                      downloadUrl: urlInput.value.trim(),
                      pdfUrl: urlInput.value.trim(),
                      uploader: "Admin",
                      date: new Date().toISOString().split("T")[0],
                      uploadDate: new Date().toISOString().split("T")[0],
                      fileSize: "1.5 MB"
                    });
                    
                    titleInput.value = "";
                    urlInput.value = "";
                    alert("লেকচার শিটটি সফলভাবে ডাটাবেজে আপলোড করা হয়েছে!");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">লেকচার শিটের শিরোনাম (Title)</label>
                  <input
                    name="sheetTitle"
                    type="text"
                    required
                    placeholder="যেমন: ওয়েব ডিজাইন ও এইচটিএমএল বেসিক লেকচার-০১"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">সরাসরি কোর্স নির্ধারণ করুন (Course)</label>
                  <select
                    name="sheetCourse"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                  >
                    {COURSES.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                    <option value="সকল কোর্সের জন্য">সকল কোর্সের জন্য</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">পিডিএফ শিটের সরাসরি URL লিঙ্ক (PDF Link)</label>
                  <input
                    name="sheetUrl"
                    type="url"
                    required
                    placeholder="যেমন: https://example.com/lecture-1.pdf"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  লেকচার শিট এন্ট্রি করুন
                </button>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <h4 className="font-extrabold text-xs text-slate-500 font-sans">ডাটাবেজে সংরক্ষিত পিডিএফ শিট সমূহ</h4>
              
              {pdfSheets.length === 0 ? (
                <div className="py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  কোনো লেকচার শিট ডেটাবেজে পোস্ট করা হয়নি।
                </div>
              ) : (
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-xs text-slate-700">
                    <thead className="bg-slate-55 border-b border-slate-150 text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-2 px-3 text-left">শিরোনাম ও কোর্স</th>
                        <th className="py-2 px-3 text-center">তারিখ</th>
                        <th className="py-2 px-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pdfSheets.map(ps => (
                        <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <strong className="font-bold text-slate-800 block text-xs">{ps.title}</strong>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{ps.course}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">{ps.date}</td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex gap-2 justify-center items-center">
                              <a
                                href={ps.downloadUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-indigo-600 hover:text-indigo-800 p-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-block"
                                title="ডাউনলোড"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  if (confirm("আপনি কি নিশ্চিতভাবে এই শিটটি ডেটাবেজ থেকে মুছে ফেলতে চান?")) {
                                    if (onDeletePdfSheet) onDeletePdfSheet(ps.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-105 rounded-lg transition-colors cursor-pointer"
                                title="মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === "coaching-photos" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="text-left border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-base">প্রতিষ্ঠানের ছবি ও ল্যাব গ্যালারি সংযুক্তি</h3>
            <p className="text-xs text-slate-505">স্বপ্ন আইটি প্রাঙ্গণ, কম্পিউটার ও নেটওয়ার্ক ল্যাবের সুন্দর ছবিসমূহ অ্যাডমিন প্যানেল থেকে পোস্ট করুন।</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
              <h4 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-rose-500" />
                নতুন ছবি যুক্ত করুন
              </h4>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const titleInput = form.elements.namedItem("photoTitle") as HTMLInputElement;
                  const urlInput = form.elements.namedItem("photoUrl") as HTMLInputElement;

                  if (!urlInput.value.trim()) {
                    alert("দয়া করে সঠিক ছবি ইউআরএল দিন!");
                    return;
                  }

                  if (onAddCoachingPhoto) {
                    onAddCoachingPhoto({
                      id: `photo-${Date.now()}`,
                      title: titleInput.value.trim() || "নন-ক্যাপশন",
                      url: urlInput.value.trim(),
                      pictureUrl: urlInput.value.trim(),
                      date: new Date().toISOString().split("T")[0],
                      uploadDate: new Date().toISOString().split("T")[0],
                      description: titleInput.value.trim() || ""
                    });
                    
                    titleInput.value = "";
                    urlInput.value = "";
                    alert("ছবিটি সফলতা ও গৌরবের ল্যাব গ্যালারিতে সংযুক্ত করা হয়েছে!");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">ছবির বিবরণ বা ক্যাপশন (ঐচ্ছিক)</label>
                  <input
                    name="photoTitle"
                    type="text"
                    placeholder="যেমন: আমাদের ট্রেনিং ল্যাবে চলমান ক্লাস প্রজেক্ট"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">ছবির হোস্ট লিঙ্ক / Direct Image URL</label>
                  <input
                    name="photoUrl"
                    type="url"
                    required
                    placeholder="যেমন: https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  গ্যালারিতে যুক্ত করুন
                </button>
              </form>
            </div>

            {/* List/Grid Column */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <h4 className="font-extrabold text-xs text-slate-500 font-sans">ডিজিটাল গ্যালারিতে প্রকাশিত ছবি সমূহ ({coachingPhotos.length})</h4>
              
              {coachingPhotos.length === 0 ? (
                <div className="py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  কোনো ছবি ডেটাবেজে সংরক্ষিত নেই।
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {coachingPhotos.map(cp => (
                    <div key={cp.id} className="relative group rounded-xl overflow-hidden border border-slate-150 shadow-3xs bg-white">
                      <img
                        src={cp.url}
                        alt={cp.title || "স্বপ্ন ল্যাব ফটো"}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-2 text-[10px] text-slate-600 border-t border-slate-100">
                        <span className="font-bold block truncate">{cp.title || "ক্যাপশন ছাড়া ছবি"}</span>
                        <span className="text-[8px] text-slate-405 mt-0.5 block">{cp.date || "পূর্বে আপলোডকৃত"}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("আপনি কি নিশ্চিতভাবে এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?")) {
                            if (onDeleteCoachingPhoto) onDeleteCoachingPhoto(cp.id);
                          }
                        }}
                        className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg p-1.5 shadow-md cursor-pointer transition-all z-10"
                        title="ছবি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden">
            
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center text-left">
              <div>
                <h3 className="font-extrabold text-base">
                  {isEditingStudent ? "শিক্ষার্থীর তথ্য এডিট ও সংশোধন" : "নতুন শিক্ষার্থী রিক্রুট করুন"}
                </h3>
                <p className="text-[11px] text-slate-400">কম্পিউটার ট্রেনিং সেন্টার অফিস ডাটাবেজ এন্ট্রি উইজেট</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetStudentForm();
                }}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4 text-left max-h-[450px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">অনন্য রোল নম্বর (Roll)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 1016"
                    value={formRoll}
                    onChange={(e) => setFormRoll(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">গোপন ৪-৮ ডিজিট পিন (PIN)</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="যেমন: 454567"
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">শিক্ষার্থীর পুরো নাম (Student Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ইশরাত জাহান খুশি"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">পিতার নাম (Father's Name)</label>
                  <input
                    type="text"
                    placeholder="যেমন: শফিউল আলম"
                    value={formFather}
                    onChange={(e) => setFormFather(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">মাতার নাম (Mother's Name)</label>
                  <input
                    type="text"
                    placeholder="যেমন: রেহানা সুলতানা"
                    value={formMother}
                    onChange={(e) => setFormMother(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">মোবাইল নম্বর (Student Mobile)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 018XXXXXXXX"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 font-sans">কোর্স (Selected Course)</label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                  >
                    {COURSES.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">বর্তমান ঠিকানা (Residential Address)</label>
                  <input
                    type="text"
                    placeholder="যেমন: আমান বাজার, চট্টগ্রাম"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">জন্ম তারিখ (Date of Birth)</label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-500">সিরিয়াল নম্বর (Student Serial No.) - ক্রমানুসারে সাজাতে</label>
                <input
                  type="number"
                  placeholder="যেমন: 1, 2, 3 (কম নাম্বার উপরে থাকবে)"
                  value={formSerialNo}
                  onChange={(e) => setFormSerialNo(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* High-fidelity Photo Attachment and Upload Box */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-150 text-left">
                <label className="text-xs font-bold text-slate-700 block">শিক্ষার্থীর ছবি সংযুক্তি (Student Photo)</label>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-lg border border-slate-250 bg-white overflow-hidden shrink-0 flex items-center justify-center relative p-0.5">
                    {formPictureUrl ? (
                      <img src={formPictureUrl} alt="Preview" className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center text-[10px] text-slate-300 font-bold leading-tight">ছবি সংযুক্ত করুন</div>
                    )}
                    {formPictureUrl && (
                      <button
                        type="button"
                        onClick={() => setFormPictureUrl("")}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-700 cursor-pointer"
                        title="ছবি মুছুন"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {/* File uploading triggers */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="form-photo-upload"
                      />
                      <label
                        htmlFor="form-photo-upload"
                        className="bg-white hover:bg-slate-100 text-slate-750 border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        কম্পিউটার থেকে আপলোড করুন
                      </label>
                    </div>

                    {/* Web Image URL Alternative Input */}
                    <input
                      type="text"
                      placeholder="অথবা সরাসরি ওয়েব ইমেজ URL দিন..."
                      value={formPictureUrl.startsWith("data:") ? "" : formPictureUrl}
                      onChange={(e) => setFormPictureUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex gap-2 items-center font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {isEditingStudent ? "তথ্য সংরক্ষণ করুণ" : "নতুন শিক্ষার্থী এনরোল করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-slate-50 px-5 py-4 flex justify-between items-center border-b border-slate-100">
              <h4 className="font-extrabold text-slate-800 text-sm">অ্যাডমিন সেটিংস</h4>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setCustomPinInput("");
                }}
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm hover:shadow transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">নতুন অ্যাডমিন পাসওয়ার্ড (পিন)</label>
                <input
                  type="text"
                  value={customPinInput}
                  onChange={(e) => setCustomPinInput(e.target.value)}
                  placeholder="নতুন পিন লিখুন"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                onClick={() => {
                  if(customPinInput.trim().length >= 4) {
                    localStorage.setItem("swapno_custom_admin_pin", customPinInput.trim());
                    alert("নতুন পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!");
                    setShowSettings(false);
                    setCustomPinInput("");
                  } else {
                    alert("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।");
                  }
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                পাসওয়ার্ড পরিবর্তন করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
