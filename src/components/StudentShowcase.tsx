import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, UserCheck, ShieldCheck, BookOpen, Calendar, 
  MapPin, ChevronDown, ChevronUp, Phone, User, Award, Hash, CreditCard,
  Lock, Unlock, Eye, EyeOff, AlertCircle, Sparkles
} from "lucide-react";
import { Student, ModelTestResult } from "../types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RefreshCw, Download } from "lucide-react";

interface StudentShowcaseProps {
  students: Student[];
  results?: ModelTestResult[];
  isAdmin?: boolean;
}

export default function StudentShowcase({ students, results = [], isAdmin = false }: StudentShowcaseProps) {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [sortOrder, setSortOrder] = useState<"fifo" | "lifo" | "manual">("manual");
  const [expandedStudentRoll, setExpandedStudentRoll] = useState<string | null>(null);

  // Security Lock/Unlock State
  const [unlockedRolls, setUnlockedRolls] = useState<Record<string, boolean>>({});
  const [rollInputs, setRollInputs] = useState<Record<string, string>>({});
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  // Extract unique courses from students to filter dynamically
  const uniqueCourses = useMemo(() => {
    const list = students.map((s) => s.course);
    return ["all", ...Array.from(new Set(list))];
  }, [students]);

  // Filter and Sort students
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.roll.includes(search) ||
        student.address.toLowerCase().includes(search.toLowerCase());
      
      const matchCourse = selectedCourse === "all" || student.course === selectedCourse;
      
      return matchSearch && matchCourse;
    });

    // Sorting logic: FIFO matches original order (newest last) or by roll ascending
    // LIFO means newest/latest first
    // Manual uses student.serialNo (lower is first)
    if (sortOrder === "lifo") {
      return [...result].reverse();
    }
    if (sortOrder === "manual") {
      return [...result].sort((a, b) => (a.serialNo || 999) - (b.serialNo || 999));
    }
    return result;
  }, [students, search, selectedCourse, sortOrder]);

  const toggleExpand = (roll: string) => {
    setExpandedStudentRoll(expandedStudentRoll === roll ? null : roll);
  };

  const handleUnlockSubmit = (e: React.FormEvent, studentRoll: string, expectedRoll: string, expectedPin: string) => {
    e.preventDefault();
    const rInput = rollInputs[studentRoll] || "";
    const pInput = pinInputs[studentRoll] || "";
    
    if (rInput.trim() === expectedRoll && pInput.trim() === expectedPin) {
      setUnlockedRolls(prev => ({ ...prev, [studentRoll]: true }));
      setErrorMessages(prev => ({ ...prev, [studentRoll]: "" }));
    } else {
      setErrorMessages(prev => ({ 
        ...prev, 
        [studentRoll]: "দুঃখিত, সঠিক রোল নম্বর অথবা ব্যক্তিগত সিকিউরিটি পিন নম্বর দিন!" 
      }));
    }
  };

  const handleInputChange = (studentRoll: string, field: "roll" | "pin", value: string) => {
    if (field === "roll") {
      setRollInputs(prev => ({ ...prev, [studentRoll]: value }));
    } else {
      setPinInputs(prev => ({ ...prev, [studentRoll]: value }));
    }
    // Clear error message when they start correcting
    if (errorMessages[studentRoll]) {
      setErrorMessages(prev => ({ ...prev, [studentRoll]: "" }));
    }
  };

  const togglePinVisibilityLocal = (studentRoll: string) => {
    setShowPins(prev => ({ ...prev, [studentRoll]: !prev[studentRoll] }));
  };

  const [generatingPdfRoll, setGeneratingPdfRoll] = useState<string | null>(null);

  const handleDownloadStudentPDF = async (student: Student, result: ModelTestResult) => {
    const elementId = `result-card-id-${student.roll}`;
    const element = document.getElementById(elementId);
    if (!element) return;
    
    setGeneratingPdfRoll(student.roll);
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(elementId);
          if (clonedEl) {
            clonedEl.style.display = "block";
            clonedEl.style.padding = "20px";
          }
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      const ratio = canvas.width / canvas.height;
      
      let finalWidth = maxWidth;
      let finalHeight = finalWidth / ratio;
      
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = finalHeight * ratio;
      }
      
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.setDrawColor(79, 70, 229);
      pdf.setLineWidth(1);
      pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);
      
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`swapno-it-${student.roll}-result.pdf`);
    } catch (error) {
      console.error(error);
      alert("PDF download failed.");
    } finally {
      setGeneratingPdfRoll(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-2 leading-tight">
            <div className="p-1.5 bg-emerald-50 rounded-xl">
              <UserCheck className="w-5 h-5 text-emerald-600 animate-[pulse_2s_infinite]" />
            </div>
            শিক্ষার্থী গ্যালারি ({filteredStudents.length})
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-snug">
            স্বপ্ন কারিগরি কম্পিউটার প্রশিক্ষন কেন্দ্র থেকে দক্ষ হয়ে ওঠা প্রিয় ছাত্র-ছাত্রীদের তালিকা।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center gap-1">
              <span className="bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200/50 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                এডমিন অ্যাক্সেস সচল
              </span>
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem("swapno_it_is_admin");
                  } catch (e) {}
                  window.location.reload(); // Simple reload clears the app state which fetches session
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                লগআউট
              </button>
            </div>
          )}
          {/* Sorting Dropdown - ADMIN ONLY */}
          {isAdmin && (
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs cursor-pointer hover:border-slate-350 transition-colors"
            >
              <option value="manual">সাজান: ম্যানুয়াল (Weight)</option>
              <option value="fifo">সাজান: FIFO (সরাসরি)</option>
              <option value="lifo">সাজান: LIFO (বিপরীত)</option>
            </select>
          )}

          {/* Dynamic Course Filter Dropdown */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs cursor-pointer hover:border-slate-350 transition-colors"
          >
            <option value="all">সব কোর্স ফিল্টার</option>
            {uniqueCourses.filter(c => c !== "all").map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="শিক্ষার্থীর নাম দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 text-slate-800 shadow-3xs hover:border-indigo-200 transition-colors"
        />
      </div>

      {/* Grid of Student Cards with fallbacks and expanded view profiles */}
      {filteredStudents.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl">
          <p className="text-slate-400 text-xs italic">অনুসন্ধানের সাথে মিল পাওয়া কোনো শিক্ষার্থী পাওয়া যায়নি!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[640px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollcap">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => {
              const isExpanded = expandedStudentRoll === student.roll;
              const isUnlocked = isAdmin || unlockedRolls[student.roll] === true;

              // Mask mobile number for basic privacy (only show last 3 digits)
              const maskedMobile = student.mobile 
                ? student.mobile.substring(0, 4) + "•••" + student.mobile.substring(7)
                : "N/A";

              return (
                <motion.div
                  layout
                  key={student.roll}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`bg-white border rounded-2xl transition-all duration-300 relative overflow-hidden group select-none ${
                    isExpanded 
                      ? "border-indigo-500 shadow-md ring-1 ring-indigo-50" 
                      : "border-slate-150 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div 
                    onClick={() => toggleExpand(student.roll)}
                    className="p-3 sm:p-4 flex items-center gap-4 cursor-pointer"
                  >
                    {/* User Mini Avatar */}
                    <div className="w-14 h-16 rounded-xl border border-slate-250 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs relative">
                      {student.pictureUrl ? (
                        <img
                          src={student.pictureUrl}
                          alt={student.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-350"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 bg-gradient-to-br from-indigo-50/50 to-slate-50">
                          <User className="w-5 h-5 text-slate-300" />
                          <span className="text-[7px] font-black mt-0.5 text-slate-400 uppercase">NO PIC</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Fields */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-start gap-1 sm:gap-2">
                        <h4 className="font-black text-slate-800 text-[13px] sm:text-base leading-tight group-hover:text-indigo-650 transition-colors flex-1 w-full sm:w-auto break-words pb-0.5 sm:pb-0">
                          {student.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 shrink-0 mt-0.5 sm:mt-0">
                          <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100/60 px-1.5 py-0.5 rounded-full text-[8px] font-black shrink-0 leading-none select-none">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            যাচাইকৃত
                          </span>
                          {isUnlocked && (
                            <span className="flex items-center gap-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100/60 px-1.5 py-0.5 rounded-full text-[8px] font-black shrink-0 leading-none select-none">
                              <Unlock className="w-2 h-2 text-indigo-500" />
                              আনলকড
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[10px] text-slate-400 font-bold select-none">
                        <span className="font-mono text-slate-500 text-[11px]">
                          রোল (Roll): <strong className="text-indigo-600 font-black text-[12px]">{student.roll}</strong>
                        </span>
                      </div>

                      {isUnlocked ? (
                        <>
                          <p className="text-[10.5px] font-bold text-indigo-750 bg-indigo-50/70 border border-indigo-100/30 px-2 py-0.5 rounded-md inline-block max-w-full leading-tight mt-1">
                            {student.course}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                            <span className="truncate font-medium">{student.address}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1">
                          <Lock className="w-2.5 h-2.5 text-slate-350" /> 
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium border border-slate-200">বাকি তথ্য সুরক্ষিত</span>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse Button indicator */}
                    <div className="shrink-0 p-1.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-indigo-650" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-indigo-650 animate-bounce" />
                      )}
                    </div>
                  </div>

                  {/* Dynamic Expand Handler Panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-slate-100 overflow-hidden bg-gradient-to-b from-indigo-50/5 via-white to-slate-50/30"
                      >
                        <div className="p-4 sm:p-5 text-xs text-slate-650 space-y-4">
                          
                          {isUnlocked ? (
                            /* GORGEOUS UNLOCKED ACADEMIC CARD VIEW */
                            <div className="space-y-4">
                              <div className="border border-indigo-150/85 rounded-2xl p-4 bg-white shadow-3xs relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                                
                                {/* Card Decorative Band */}
                                <div className="flex justify-between items-center mb-3.5 border-b border-indigo-50 pb-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    SWAPNO IT ID CARD
                                  </span>
                                  <span className="text-[9px] font-mono text-emerald-600 font-black bg-emerald-50 px-1.5 py-0.2 rounded uppercase">
                                    {isAdmin ? "ADMIN VIEW" : "VERIFIED MEMBER"}
                                  </span>
                                </div>

                                {/* Two Column Layout details inside ID Card */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                  
                                  {/* Left column details */}
                                  <div className="space-y-2">
                                    <p className="flex justify-between border-b border-slate-100 pb-1.5 text-left">
                                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 text-slate-300" />
                                        পিতার নাম:
                                      </span> 
                                      <span className="font-extrabold text-slate-800">{student.fatherName || "N/A"}</span>
                                    </p>
                                    <p className="flex justify-between border-b border-slate-100 pb-1.5 text-left">
                                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 text-slate-300" />
                                        মাতার নাম:
                                      </span> 
                                      <span className="font-extrabold text-slate-800">{student.motherName || "N/A"}</span>
                                    </p>
                                  </div>

                                  {/* Right column details */}
                                  <div className="space-y-2">
                                    <p className="flex justify-between border-b border-slate-100 pb-1.5 text-left">
                                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <Hash className="w-3.5 h-3.5 text-slate-300" />
                                        রোল (ID/Roll):
                                      </span> 
                                      <span className="font-bold text-slate-800 font-mono text-[13px]">{student.roll}</span>
                                    </p>
                                    <p className="flex justify-between border-b border-slate-100 pb-1.5 text-left">
                                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                                        মোবাইল (Mobile):
                                      </span> 
                                      <span className="font-mono font-black text-emerald-700">{maskedMobile}</span>
                                    </p>
                                  </div>

                                  {/* Full Width elements */}
                                  <div className="md:col-span-2 space-y-2 pt-1.5">
                                    <p className="flex items-start gap-4 text-left border-b border-slate-100 pb-1.5">
                                      <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                        ঠিকানা (Address):
                                      </span> 
                                      <span className="font-bold text-slate-800 text-xs leading-normal">{student.address || "N/A"}</span>
                                    </p>
                                    {student.regDate && (
                                      <p className="flex justify-between text-[10px] text-slate-400 mt-1 select-none">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-slate-300" />
                                          ভর্তির তারিখ:
                                        </span>
                                        <strong className="font-mono text-slate-500">{student.regDate}</strong>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Student Results Display */}
                              {(() => {
                                const studentResult = results.find(r => r.roll === student.roll);
                                if (!studentResult) return null;
                                return (
                                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                                        <Award className="w-4 h-4 text-emerald-600" />
                                        {studentResult.examType === "final_exam" ? "ফাইনাল বোর্ড ফলাফল" : "মডেল টেস্ট ফলাফল"}
                                      </h5>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${studentResult.gpaGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-200 text-emerald-800'}`}>
                                        গ্রেড: {studentResult.gpaGrade}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold text-slate-600">
                                      <div className="bg-white p-2 rounded shadow-sm border border-emerald-50 text-center"><div className="text-emerald-700/60 pb-1 text-[8px]">এমসিকিউ</div>{studentResult.mcqMarks}</div>
                                      <div className="bg-white p-2 rounded shadow-sm border border-emerald-50 text-center"><div className="text-emerald-700/60 pb-1 text-[8px]">ব্যবহারিক</div>{studentResult.practicalMarks}</div>
                                      <div className="bg-white p-2 rounded shadow-sm border border-emerald-50 text-center"><div className="text-emerald-700/60 pb-1 text-[8px]">ভাইভা</div>{studentResult.vivaMarks}</div>
                                      <div className="bg-white p-2 rounded shadow-sm border border-emerald-50 text-center"><div className="text-emerald-700/60 pb-1 text-[8px]">মোট নম্বর</div>{studentResult.total}</div>
                                    </div>
                                    <div className="pt-2 text-right" id={`result-card-id-${student.roll}`}>
                                      <button 
                                        type="button"
                                        disabled={generatingPdfRoll === student.roll}
                                        onClick={() => handleDownloadStudentPDF(student, studentResult)}
                                        className={`text-xs ${generatingPdfRoll === student.roll ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 ml-auto`}
                                      >
                                        {generatingPdfRoll === student.roll ? (
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Download className="w-3.5 h-3.5" />
                                        )}
                                        {generatingPdfRoll === student.roll ? "ডাউনলোড হচ্ছে..." : "বিস্তারিত ও PDF ডাউনলোড"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Portal Quick Operations Bar for students */}
                              <div className="flex items-center justify-between gap-3 text-[10px] sm:text-xs mt-4">
                                <span className="text-indigo-650 flex items-center gap-1 font-bold">
                                  <Award className="w-3.5 h-3.5 text-indigo-500 inline" />
                                  উচ্চ মানের বাস্তব শিক্ষা সল্যুশন
                                </span>
                                <div className="text-slate-400 font-extrabold flex items-center gap-1 cursor-pointer select-none">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />
                                  স্বপ্ন একাডেমী ভেরিফাইড মেম্বার
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* PRIVACY SECURITY CHAT / VERIFICATION BOX */
                            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl max-w-md mx-auto space-y-4">
                              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 ring-2 ring-indigo-50">
                                  <Lock className="w-4 h-4 text-indigo-600 animate-pulse" />
                                </div>
                                <div className="text-left">
                                  <h5 className="font-extrabold text-slate-850 text-xs">শিক্ষার্থীর সুরক্ষিত তথ্য আনলক করুন</h5>
                                  <p className="text-[10px] text-slate-400 font-medium">ব্যক্তিগত বিস্তারিত দেখতে শিক্ষার্থীর রোল ও পিন কোড দিন।</p>
                                </div>
                              </div>

                              <form 
                                className="space-y-3.5"
                                onSubmit={(e) => handleUnlockSubmit(e, student.roll, student.roll, student.pin)}
                              >
                                {/* Roll input */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 font-bold block">রোল নম্বর (Roll Number)</label>
                                  <div className="relative">
                                    <input 
                                      type="text" 
                                      placeholder="শিক্ষার্থীর একাডেমিক রোল দিন"
                                      value={rollInputs[student.roll] || ""}
                                      onChange={(e) => handleInputChange(student.roll, "roll", e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 pl-8 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono font-bold"
                                      required
                                    />
                                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  </div>
                                </div>

                                {/* Security PIN input */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 font-bold block">৪ থেকে ৮-সংখ্যার সিকিউরিটি পিন (Security PIN)</label>
                                  <div className="relative">
                                    <input 
                                      type={showPins[student.roll] ? "text" : "password"} 
                                      placeholder="ব্যক্তিগত সিকিউরিটি পিন দিন"
                                      maxLength={8}
                                      value={pinInputs[student.roll] || ""}
                                      onChange={(e) => handleInputChange(student.roll, "pin", e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 pl-8 pr-10 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono tracking-widest font-bold"
                                      required
                                    />
                                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <button
                                      type="button"
                                      onClick={() => togglePinVisibilityLocal(student.roll)}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                      {showPins[student.roll] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                {errorMessages[student.roll] && (
                                  <div className="flex gap-1.5 items-start bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100 text-[10.5px]">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span className="font-bold">{errorMessages[student.roll]}</span>
                                  </div>
                                )}

                                <button
                                  type="submit"
                                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-750 hover:to-indigo-800 text-white font-extrabold text-[11px] py-2 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-200 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Unlock className="w-3.5 h-3.5 text-slate-100" />
                                  তথ্য দেখতে আনলক করুন
                                </button>
                              </form>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
