import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Award, Printer, Lock, CheckCircle, Clock, BookOpen, AlertCircle, RefreshCw, Star, ChevronRight } from "lucide-react";
import { INITIAL_STUDENTS, INITIAL_RESULTS } from "../data";
import { Student, ModelTestResult } from "../types";

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
      setErrorInput("ভুল পিন নম্বর! আবার চেষ্টা করুন সঠিক ৪-সংখ্যার ব্যক্তিগত পিন দিয়ে।");
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
                  <p className="text-slate-600">রেজিস্ট্রেশনকৃত মোবাইল নম্বরে প্রেরিত অথবা রশিদ পত্রে উল্লিখিত ৪-ডিজিটের গোপন পিন লিখুন।</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 block text-left">
                    ব্যক্তিগত গোপন পিন (Class PIN)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
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
                  className="flex items-center justify-between p-2.5 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-colors group border border-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="text-left">
                      <p className="font-semibold text-slate-700 text-xs group-hover:text-indigo-600 transition-colors">
                        {performer.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">রোল: {performer.roll}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-bold py-0.5 px-2 rounded-full">
                    {performer.total}% (A+)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Result Card Report Card */}
        <div className="lg:col-span-2">
          {showResultCard && authenticatedStudent ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-md shadow-indigo-50/40 relative space-y-6 print-card"
            >
              {/* Badge Overlay */}
              <div className="absolute top-5 right-5 no-print uppercase tracking-widest text-[10px] bg-indigo-50 border border-indigo-100 rounded-md py-1 px-3 text-indigo-700 font-bold">
                মডেল টেস্ট ট্রান্সক্রিপ্ট
              </div>

              {/* Institute Branding on Certificate Header */}
              <div className="text-center space-y-2 pb-6 border-b border-dashed border-slate-200">
                <div className="inline-flex items-center gap-2 text-indigo-600 font-extrabold text-xl">
                  <Award className="w-7 h-7" />
                  স্বপ্ন কারিগরি ও কম্পিউটার ট্রেইনিং সেন্টার
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  আমান বাজার, হাটহাজারী, চট্টগ্রাম। পরিচালক: মোহাম্মদ সাঈদ
                </p>
                <p className="text-[10px] font-mono text-slate-400 select-none">
                  স্থাপিত: ২০১৯ • রেজি নং: ৫৪৩২১৭২৮১
                </p>
              </div>

              {/* Student Biodata Metadata Display */}
              <div className="flex flex-col md:flex-row gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 items-start text-xs md:text-sm">
                
                {/* Passport Size Student Photo with High Quality Placeholder */}
                <div className="w-24 h-28 md:w-28 md:h-32 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs p-1 relative self-center md:self-start bg-slate-100/50">
                  {authenticatedStudent.pictureUrl ? (
                    <img 
                      src={authenticatedStudent.pictureUrl} 
                      alt={authenticatedStudent.name} 
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 rounded-lg flex flex-col items-center justify-center p-2 text-center text-slate-300">
                      <svg className="w-8 h-8 opacity-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-[9px] font-bold mt-1 text-slate-400">ছবি নেই</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[8px] font-black uppercase px-1 py-0.5 rounded-xs select-none">
                    PHOTO
                  </div>
                </div>

                {/* Details side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full flex-1">
                  <div className="space-y-2">
                    <p><strong className="text-slate-500">শিক্ষার্থীর নাম:</strong> <span className="font-bold text-slate-800">{authenticatedStudent.name}</span></p>
                    <p><strong className="text-slate-500">পিতার নাম:</strong> <span className="text-slate-700">{authenticatedStudent.fatherName}</span></p>
                    <p><strong className="text-slate-500">মাতার নাম:</strong> <span className="text-slate-700">{authenticatedStudent.motherName}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p><strong className="text-slate-500">রোল নম্বর:</strong> <span className="font-mono font-bold text-slate-800">{authenticatedStudent.roll}</span></p>
                    <p><strong className="text-slate-500">কোর্সের নাম:</strong> <span className="text-slate-700">{authenticatedStudent.course}</span></p>
                    <p><strong className="text-slate-500">ঠিকানা:</strong> <span className="text-slate-700">{authenticatedStudent.address}</span></p>
                  </div>
                </div>
              </div>

              {studentResult ? (
                // Found Marks in system
                <div className="space-y-6">
                  {/* Result Marks Breakdown */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 text-left font-bold">বিষয়ক অংশ (Exam Part)</th>
                          <th className="py-2 text-center font-bold">সর্বোচ্চ নম্বর</th>
                          <th className="py-2 text-center font-bold">প্রাপ্ত নম্বর</th>
                          <th className="py-2 text-right font-bold">শতকরা পাস মার্ক</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr>
                          <td className="py-3 text-left">তাত্ত্বিক/এমসিকিউ (Theory / MCQ Selection)</td>
                          <td className="py-3 text-center text-slate-400 font-mono">৫০</td>
                          <td className="py-3 text-center font-mono font-bold text-indigo-700">{studentResult.mcqMarks}</td>
                          <td className="py-3 text-right">৪০%</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-left">ব্যবহারিক পরীক্ষা (Practical Application Lab)</td>
                          <td className="py-3 text-center text-slate-400 font-mono">৪০</td>
                          <td className="py-3 text-center font-mono font-bold text-indigo-700">{studentResult.practicalMarks}</td>
                          <td className="py-3 text-right">৪০%</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-left">ভাইভা ও মৌখিক দক্ষতা (Viva-Voce / Interview)</td>
                          <td className="py-3 text-center text-slate-400 font-mono">১০</td>
                          <td className="py-3 text-center font-mono font-bold text-indigo-700">{studentResult.vivaMarks}</td>
                          <td className="py-3 text-right">৪০%</td>
                        </tr>
                        <tr className="bg-indigo-50/30 font-bold border-t border-indigo-100 text-slate-800">
                          <td className="py-3 text-left pl-2">মোট গ্রেড মার্কস (Grand Total / 100)</td>
                          <td className="py-3 text-center font-mono">১০০</td>
                          <td className="py-3 text-center font-mono text-indigo-700 text-base">{studentResult.total}</td>
                          <td className="py-3 text-right pr-2 text-emerald-700">উত্তীর্ণ</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">জিপিএ পয়েন্ট (GPA Point)</span>
                      <strong className="text-xl text-indigo-600 font-mono font-extrabold">{studentResult.gpaPoint.toFixed(2)}</strong>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">লেটার গ্রেড (GPA Grade)</span>
                      <strong className="text-xl text-indigo-700 font-extrabold uppercase">{studentResult.gpaGrade}</strong>
                    </div>
                    <div className={`${studentResult.gpaGrade === "F" ? "bg-red-50" : "bg-emerald-50"} border p-4 rounded-2xl text-center space-y-1 flex flex-col justify-center`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">পাস স্ট্যাটাস (Status)</span>
                      <strong className={`text-sm ${studentResult.gpaGrade === "F" ? "text-red-700" : "text-emerald-700"} font-bold`}>
                        {studentResult.gpaGrade === "F" ? "অনুপস্থিত / অকৃতকার্য" : "কৃতিত্বের সাথে উত্তীর্ণ"}
                      </strong>
                    </div>
                  </div>

                  {/* Comments from Saiyed Sir */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl text-left border border-amber-100 text-amber-900 text-xs md:text-sm space-y-1">
                    <h5 className="font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      শিক্ষকের মূল্যায়ন ও মন্তব্য (Saiyed Sir's Evaluation)
                    </h5>
                    <p className="italic text-slate-700 leading-relaxed font-medium">"{studentResult.remarks}"</p>
                  </div>
                </div>
              ) : (
                // Student registered but result not published yet
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">পরীক্ষার খাতা মূল্যায়নাধীন</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      দুঃখিত, এই শিক্ষার্থীর নিবন্ধন সম্পন্ন হলেও এই পরীক্ষাটির মডেল টেস্ট ফলাফল এখনো সাইদ কম্পিউটার ল্যাব ডাটাবেজে এন্ট্রি করা হয়নি। অনুগ্রহ করে পরবর্তীতে পুনরায় চেক করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Verification watermark and signatures */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-2 text-xs text-slate-500 items-end font-medium">
                <div className="text-left space-y-1 select-none">
                  <p className="text-[10px] text-slate-400">রিসিপ্ট কোড:</p>
                  <p className="font-mono text-indigo-900 font-bold text-[11px] uppercase tracking-widest">{authenticatedStudent.pin}X{authenticatedStudent.roll}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-8 flex items-end justify-end select-none">
                    <span className="font-serif italic font-semibold text-xs text-indigo-700 tracking-wider">Mohammad Saied</span>
                  </div>
                  <p className="border-t border-slate-200 pt-1 text-[11px] font-bold text-slate-800">
                    মোহাম্মদ সাঈদ <span className="font-normal block text-[10px] text-slate-500">পরিচালক ও পরীক্ষক, স্বপ্ন আইটি</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handlePrint}
                  id="btn-print-academic"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  ফলাফল প্রিন্ট / PDF ডাউনলোড
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
