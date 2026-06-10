import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Award, Printer, Lock, CheckCircle, Clock, BookOpen, AlertCircle, RefreshCw, Star, ChevronRight, User, Hash, ShieldCheck, Download } from "lucide-react";
import { Student, ModelTestResult } from "../types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ResultCheckerProps {
  students: Student[];
  results: ModelTestResult[];
}

export default function StudentResultChecker({ students, results }: ResultCheckerProps) {
  const [roll, setRoll] = useState("");
  const [pin, setPin] = useState("");
  const [errorInput, setErrorInput] = useState("");
  const [authenticatedStudent, setAuthenticatedStudent] = useState<Student | null>(null);
  const [studentResult, setStudentResult] = useState<ModelTestResult | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [needPinVerfication, setNeedPinVerfication] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);

  const handleQueryRoll = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");
    
    if (!roll.trim()) {
      setErrorInput("অনুগ্রহ করে রোল নম্বর প্রদান করুন।");
      return;
    }
    
    const foundStudent = students.find((s) => s.roll === roll.trim());
    if (!foundStudent) {
      setErrorInput("দুঃখিত, এই রোল নম্বরের কোনো শিক্ষার্থী পাওয়া যায়নি। সঠিক রোল লিখুন।");
      return;
    }

    setMatchedStudent(foundStudent);
    setNeedPinVerfication(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");

    if (!matchedStudent) return;

    if (pin.trim() !== matchedStudent.pin) {
      setErrorInput("ভুল পিন নম্বর! আবার চেষ্টা করুন সঠিক ৪-৮ সংখ্যার ব্যক্তিগত পিন দিয়ে।");
      return;
    }

    // Success login
    const foundResult = results.find((r) => r.roll === matchedStudent.roll);
    setAuthenticatedStudent(matchedStudent);
    setStudentResult(foundResult || null);
    setShowResultCard(true);
    setNeedPinVerfication(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("result-card-content");
    if (!element) return;
    
    // Hide action buttons during export
    const actionsDiv = element.querySelector('.no-print') as HTMLElement;
    const originalDisplay = actionsDiv ? actionsDiv.style.display : '';
    if (actionsDiv) actionsDiv.style.display = 'none';
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        windowWidth: 1024,
        ignoreElements: (node) => node.classList && node.classList.contains("no-print")
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions with margins (10mm padding on all sides)
      const padding = 15;
      const contentWidth = pdfWidth - (padding * 2);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * contentWidth) / imgProps.width;
      
      // Ensure it fits vertically within margins
      let scaleRatio = 1;
      if (pdfHeight > (pageHeight - padding * 2)) {
          scaleRatio = (pageHeight - padding * 2) / pdfHeight;
      }

      const finalWidth = contentWidth * scaleRatio;
      const finalHeight = pdfHeight * scaleRatio;
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      // Draw elegant certificate border
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(5, 5, pdfWidth - 10, pageHeight - 10);
      
      pdf.setDrawColor(79, 70, 229); // indigo-600
      pdf.setLineWidth(1);
      pdf.rect(8, 8, pdfWidth - 16, pageHeight - 16);

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`swapno-it-${authenticatedStudent?.roll || 'result'}-marksheet.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      if (actionsDiv) actionsDiv.style.display = originalDisplay;
    }
  };

  const handleReset = () => {
    setRoll("");
    setPin("");
    setErrorInput("");
    setAuthenticatedStudent(null);
    setStudentResult(null);
    setShowResultCard(false);
    setNeedPinVerfication(false);
    setMatchedStudent(null);
  };

  // Top performers list to show as inspiration / clickable results
  const topPerformers = results
    .filter((r) => r.gpaGrade === "A+")
    .slice(0, 5);

  return (
    <div id="result-checker-section" className="space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          মডেল টেস্ট ও চূড়ান্ত ফলাফল পোর্টাল
        </h2>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          আপনার রোল নম্বর এবং গোপন পিন ব্যবহার করে পরীক্ষার ফলাফল এবং বিস্তারিত মার্কশীট দেখুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Enter Credentials Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">ফলাফল অনুসন্ধান</h3>
            </div>

            {!needPinVerfication && !showResultCard ? (
              // Step 1: Input Roll Number
              <form onSubmit={handleQueryRoll} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 block text-left">
                    শিক্ষার্থীর রোল নম্বর (Roll Number)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="যেমন: 1001, 1005"
                      value={roll}
                      onChange={(e) => setRoll(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {errorInput && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorInput}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-verify-roll"
                  className="w-full bg-slate-900 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  পরবর্তী ধাপ
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            ) : needPinVerfication ? (
              // Step 2: Input Personal PIN
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs space-y-1 text-left border border-amber-100">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                    রোল পাওয়া গেছে: {matchedStudent?.name}
                  </div>
                  <p className="text-slate-600">রেজিস্ট্রেশনকৃত মোবাইল নম্বরে প্রেরিত অথবা রশিদ পত্রে উল্লিখিত ৪ থেকে ৮-ডিজিটের গোপন পিন লিখুন।</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 block text-left">
                    ব্যক্তিগত গোপন পিন (Class PIN)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={8}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {errorInput && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorInput}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    রিসেট করুন
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-pin"
                    className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ফলাফল দেখুন
                  </button>
                </div>
              </form>
            ) : (
              // Step 3: Logged in & result shown
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">{authenticatedStudent?.name}</h4>
                  <p className="text-xs text-slate-500">রোল: {authenticatedStudent?.roll}</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  অন্য রোল চেক করুন
                </button>
              </div>
            )}
          </div>

          {/* Hall of Fame / Top Performers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              সেরা মেধা তালিকা (A+ মেডেল)
            </h4>
            <div className="space-y-2.5">
              {topPerformers.map((performer, idx) => (
                <div
                  key={performer.roll}
                  onClick={() => {
                    setRoll(performer.roll);
                    const matchingStud = students.find(s => s.roll === performer.roll);
                    if (matchingStud) {
                      setMatchedStudent(matchingStud);
                      setNeedPinVerfication(true);
                      setErrorInput("");
                    }
                  }}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group border border-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {students.find((s) => s.roll === performer.roll)?.name || `রোল: ${performer.roll}`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium font-mono">রোল: {performer.roll}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono text-[10px] font-black">
                    A+ ({performer.total}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Result Card (col-span-2) */}
        <div className="lg:col-span-2 h-full">
          {showResultCard && authenticatedStudent ? (
            <motion.div
              id="result-card-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-10 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50/20 relative space-y-6 print-card overflow-hidden"
              style={{ contentVisibility: "auto" }}
            >
              {/* Premium Print Layout CSS Injector */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  /* Hide default browser header line/page title and footer URL */
                  @page {
                    size: A4 portrait;
                    margin: 5mm 8mm 5mm 8mm !important;
                  }
                  
                  /* Clean baseline */
                  body {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    font-family: 'Inter', system-ui, sans-serif !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    overflow: hidden !important;
                    height: 100% !important;
                  }

                  /* Ensure viewport wrappers don't enforce cut-offs or horizontal columns */
                  html, body, #root, main, #result-checker-section, .lg\\:col-span-2 {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    position: static !important;
                    box-sizing: border-box !important;
                  }

                  /* Hide absolutely everything not belonging to the print sheet */
                  .no-print, 
                  html::before,
                  header, 
                  footer, 
                  nav, 
                  button, 
                  #courses-section, 
                  #result-checker-section > :not(.lg\\:col-span-2),
                  .lg\\:col-span-1 {
                    display: none !important;
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }

                  /* Promote the report card to take up beautiful, non-truncated space */
                  .print-card {
                    border: 6px double #3b82f6 !important;
                    outline: 2px solid #1e3a8a !important;
                    padding: 16px 22px !important;
                    margin: 0 auto !important;
                    box-shadow: none !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    border-radius: 8px !important;
                    background-color: #ffffff !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    position: relative !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }

                  /* Compress spacing in header */
                  .print-card .text-center {
                    padding-bottom: 8px !important;
                    margin-bottom: 8px !important;
                  }

                  /* Prevent text truncating by forcing solid landscape elements */
                  .print-biodata-row {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: flex-start !important;
                    gap: 14px !important;
                    width: 100% !important;
                    padding: 8px 12px !important;
                    margin-top: 6px !important;
                    margin-bottom: 8px !important;
                    box-sizing: border-box !important;
                  }

                  .print-details-grid {
                    display: grid !important;
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    gap: 10px !important;
                    flex: 1 !important;
                    width: auto !important;
                  }

                  /* Set tables and table padding tightly */
                  .print-card table {
                    width: 100% !important;
                    margin-top: 6px !important;
                    margin-bottom: 8px !important;
                  }

                  .print-card table th, 
                  .print-card table td {
                    padding: 4px 6px !important;
                    font-size: 11px !important;
                  }

                  .print-metrics-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 8px !important;
                    width: 100% !important;
                    margin-top: 6px !important;
                    margin-bottom: 8px !important;
                  }

                  .print-metrics-grid > div {
                    padding: 6px 8px !important;
                  }

                  .print-signatures-row {
                    display: grid !important;
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    gap: 20px !important;
                    width: 100% !important;
                    margin-top: 10px !important;
                    padding-top: 6px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }

                  /* Preemptively safe-break page items */
                  .print-card, table, tr, td, p, div {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }

                  /* Force high-contrast background highlights */
                  .print-highlight {
                    background-color: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  .print-accent-row {
                    background-color: #e0e7ff !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  .print-badge-gp {
                    background-color: #e0e7ff !important;
                    color: #312e81 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  .print-badge-lg {
                    background-color: #e0e7ff !important;
                    color: #312e81 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  .print-badge-pass {
                    background-color: #d1fae5 !important;
                    color: #065f46 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  .viva-box {
                    background-color: #fffbeb !important;
                    border: 1px solid #fef3c7 !important;
                    padding: 6px 10px !important;
                    margin-top: 6px !important;
                    margin-bottom: 8px !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              `}} />

              {/* Faint Background Logo Watermark for Prestige look */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <Award className="w-96 h-96 text-indigo-900" />
              </div>

              {/* Golden Rosette-Style Official Pass Seal Overlay */}
              <div className="absolute top-28 right-8 w-20 h-20 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full border-4 border-amber-200 flex flex-col items-center justify-center text-white shadow-lg z-10 hidden md:flex select-none rotate-3 opacity-90">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-white m-0.5"></div>
                <span className="text-[7px] font-bold tracking-widest uppercase text-amber-50">SWAPNO IT</span>
                <Award className="w-5 h-5 text-white my-0.5" />
                <span className="text-[7px] font-black tracking-widest uppercase text-yellow-101">C.L. CERTIFIED</span>
              </div>

              {/* Badge Overlay for web UI */}
              <div className="absolute top-5 right-5 no-print uppercase tracking-widest text-[9px] bg-indigo-50 border border-indigo-100 rounded-lg py-1 px-3 text-indigo-700 font-bold">
                অফিসিয়াল মডেল টেস্ট ট্রান্সক্রিপ্ট
              </div>

              {/* Institute Branding on Certificate Header */}
              <div className="text-center space-y-2 pb-6 border-b border-dashed border-slate-200 relative">
                <div className="inline-flex items-center gap-2.5 text-indigo-700 font-black text-2xl tracking-tight">
                  <Award className="w-8 h-8 text-amber-500 fill-amber-300 shrink-0" />
                  স্বপ্ন কারিগরি ও কম্পিউটার ট্রেইনিং সেন্টার
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত কম্পিউটার শিক্ষাপ্রতিষ্ঠান। আমান বাজার, হাটহাজারী, চট্টগ্রাম।
                </p>
                <div className="flex justify-center items-center gap-4 text-[10px] font-extrabold text-slate-400 select-none uppercase tracking-wider font-mono">
                  <span>স্থাপিত: ২০১৯</span>
                  <span>•</span>
                  <span className="bg-slate-100 py-0.5 px-2 rounded text-slate-600 font-bold">রেজি নং: ৫৪৩২১৭২৮১</span>
                </div>
              </div>

              {/* Student Biodata Metadata Display */}
              <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border-l-4 border-l-indigo-600 border-y border-r border-slate-150 items-center md:items-start text-xs md:text-sm print-highlight print-biodata-row bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/10 shadow-xs relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                {/* Passport Size Student Photo with High Quality Placeholder */}
                <div className="w-28 h-36 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-md p-1.5 relative ring-4 ring-indigo-50/60 self-center md:self-start">
                  {authenticatedStudent.pictureUrl ? (
                    <img 
                      src={authenticatedStudent.pictureUrl} 
                      alt={authenticatedStudent.name} 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 rounded-xl flex flex-col items-center justify-center p-2 text-center text-slate-300">
                      <div className="p-2 bg-slate-100 rounded-full mb-1">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">ছবি নেই</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-md select-none tracking-wider shadow-xs">
                    PHOTO
                  </div>
                </div>

                {/* Details side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-full flex-1 print-details-grid">
                  <div className="space-y-3.5 text-left">
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        শিক্ষার্থীর নাম (Student Name)
                      </p>
                      <span className="font-black text-slate-900 text-sm md:text-base leading-tight block">
                        {authenticatedStudent.name}
                      </span>
                    </div>
                    
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        পিতার নাম (Father's Name)
                      </p>
                      <span className="text-slate-700 font-bold block">
                        {authenticatedStudent.fatherName}
                      </span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        মাতার নাম (Mother's Name)
                      </p>
                      <span className="text-slate-700 font-bold block">
                        {authenticatedStudent.motherName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-left">
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-indigo-400" />
                        রোল নম্বর (Class Roll)
                      </p>
                      <span className="font-mono font-black text-indigo-700 text-sm md:text-base block">
                        {authenticatedStudent.roll}
                      </span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        কোর্সের নাম (Course Name)
                      </p>
                      <span className="text-slate-900 font-black text-xs md:text-sm bg-indigo-50/50 text-indigo-950 px-2 py-1 rounded-md inline-block border border-indigo-100/40">
                        {authenticatedStudent.course}
                      </span>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-550" />
                        আইডি গোপন পিন (Class PIN)
                      </p>
                      <span className="font-mono font-bold text-slate-600 bg-slate-105 border border-slate-200 px-2.5 py-0.5 rounded text-xs inline-block">
                        {authenticatedStudent.pin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {studentResult ? (
                // Found Marks in system
                <div className="space-y-6">
                  {/* Result Marks Breakdown */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-2.5 text-left font-bold">বিষয়ক অংশ (Exam Component)</th>
                          <th className="py-2.5 text-center font-bold">সর্বোচ্চ নম্বর</th>
                          <th className="py-2.5 text-center font-bold">প্রাপ্ত নম্বর</th>
                          <th className="py-2.5 text-right font-bold">অনূর্ধ্ব শতাংশ (Pass)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 text-left font-semibold">তাত্ত্বিক/এমসিকিউ পরীক্ষা (Theory & MCQ Exam)</td>
                          <td className="py-3 text-center text-slate-400 font-mono font-bold">৫০</td>
                          <td className="py-3 text-center font-mono font-bold text-indigo-700 text-base">{studentResult.mcqMarks}</td>
                          <td className="py-3 text-right text-slate-400">৪০% (২০)</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 text-left font-semibold">ব্যবহারিক পরীক্ষা (Practical Lab Application)</td>
                          <td className="py-3 text-center text-slate-400 font-mono font-bold">৪০</td>
                          <td className="py-3 text-center font-mono font-bold text-indigo-700 text-base">{studentResult.practicalMarks}</td>
                          <td className="py-3 text-right text-slate-400">৪০% (১৬)</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 text-left font-semibold">ভাইভা ও মৌখিক দক্ষতা (Viva-Voce & Communication)</td>
                          <td className="py-3 text-center text-slate-400 font-mono font-bold">১০</td>
                          <td className="py-3 text-center font-mono font-bold text-indigo-700 text-base">{studentResult.vivaMarks}</td>
                          <td className="py-3 text-right text-slate-400">৪০% (০৪)</td>
                        </tr>
                        <tr className="print-accent-row bg-indigo-50/45 font-extrabold border-t-2 border-indigo-100 text-slate-950">
                          <td className="py-3 text-left pl-3 text-indigo-950 font-black">সর্বমোট প্রাপ্ত নম্বর (Grand Total Marks)</td>
                          <td className="py-3 text-center font-mono">১০০</td>
                          <td className="py-3 text-center font-mono text-indigo-800 text-lg font-black">{studentResult.total}</td>
                          <td className="py-3 text-right pr-3 text-emerald-700 font-black flex items-center justify-end gap-1">
                            <CheckCircle className="w-4 h-4 text-emerald-600 inline" /> UTF-PASS
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-metrics-grid">
                    <div className="print-highlight bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">জিপিএ পয়েন্ট (GPA Point)</span>
                      <strong className="text-2xl text-indigo-700 font-mono font-black">{studentResult.gpaPoint.toFixed(2)}</strong>
                    </div>
                    <div className="print-badge-lg bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] text-indigo-500 uppercase font-black tracking-wider block">লেটার গ্রেড (GPA Grade)</span>
                      <strong className="text-2xl text-indigo-800 font-black uppercase tracking-tight">{studentResult.gpaGrade}</strong>
                    </div>
                    <div className={`print-badge-pass ${studentResult.gpaGrade === "F" ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"} border p-4 rounded-2xl text-center space-y-1 flex flex-col justify-center items-center`}>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">ফলাফল (Status)</span>
                      <strong className={`text-sm ${studentResult.gpaGrade === "F" ? "text-red-700" : "text-emerald-700"} font-black uppercase tracking-widest`}>
                        {studentResult.gpaGrade === "F" ? "FAILED / F" : "PASSED / উত্তীর্ণ"}
                      </strong>
                    </div>
                  </div>

                  {/* Comments from Saiyed Sir */}
                  <div className="viva-box bg-amber-50/50 p-4 rounded-2xl text-left border border-amber-100 text-amber-950 text-xs md:text-sm space-y-1">
                    <h5 className="font-extrabold flex items-center gap-1.5 text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      শিক্ষকের মূল্যায়ন ও মন্তব্য (Saiyed Sir's Evaluation Comment)
                    </h5>
                    <p className="italic text-slate-750 font-medium leading-relaxed">"{studentResult.remarks}"</p>
                  </div>
                </div>
              ) : (
                // Student registered but result not published yet
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-sm md:text-base">পরীক্ষা খাতা ও উত্তরপত্র মূল্যায়নাধীন</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      দুঃখিত, এই শিক্ষার্থীর মডেল টেস্ট ফলাফল এখনো সাইদ কম্পিউটার ল্যাব ডাটাবেজে এন্ট্রি করা হয়নি। অনুগ্রহ করে পরবর্তীতে পুনরায় চেক করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Verification watermark and signatures */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-2 text-xs text-slate-500 items-end font-medium print-signatures-row">
                <div className="text-left space-y-1 select-none">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">রিসিপ্ট কোড (Academic Verification ID):</p>
                  <p className="font-mono text-indigo-900 font-extrabold text-[11px] uppercase tracking-widest">{authenticatedStudent.pin}X{authenticatedStudent.roll}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-8 flex items-end justify-end select-none">
                    <span className="font-serif italic font-semibold text-lg text-indigo-700 tracking-wider">Mohammad Saied</span>
                  </div>
                  <p className="border-t border-slate-200 pt-1 text-xs font-extrabold text-slate-800">
                    মোহাম্মদ সাঈদ <span className="font-semibold block text-[10px] text-slate-500">পরিচালক ও পরীক্ষক, স্বপ্ন আইটি</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print pt-4 flex flex-wrap gap-3 justify-end border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="bg-emerald-650 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 text-white rounded-xl py-2.5 px-5 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  রেজাল্ট PDF ডাউনলোড করুন
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  id="btn-print-academic"
                  className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-2.5 px-5 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  ফলাফল প্রিন্ট করুন
                </button>
              </div>
            </motion.div>
          ) : (
            // Placeholder when no result is selected
            <div className="h-full min-h-[350px] bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col justify-center items-center p-8 text-center space-y-3">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
                <Award className="w-8 h-8 mx-auto text-indigo-200" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-sm">মার্কশীট ও একাডেমিক ফলাফল</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  রোল ও ৪-ডিজিট পিন দিয়ে পোর্টাল আনলক করার পর এখানে শিক্ষার্থীর বিষয়ভিত্তিক নম্বর, জিপিএ এবং গ্রেড শিট স্বয়ংক্রিয়ভাবে জেনারেট হবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
