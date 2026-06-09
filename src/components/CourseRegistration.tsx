import React, { useState } from "react";
import { motion } from "motion/react";
import { Monitor, Palette, Code, Database, Clock, Calendar, CheckSquare, Sparkles, Send, CheckCircle, Flame } from "lucide-react";
import { COURSES } from "../data";
import { Course, VisitorMessage } from "../types";

interface CourseRegistrationProps {
  onAddVisitorMessage: (msg: VisitorMessage) => void;
}

export default function CourseRegistration({ onAddVisitorMessage }: CourseRegistrationProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].title);
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !mobile.trim()) {
      setFormError("অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন!");
      return;
    }

    if (mobile.trim().length < 11) {
      setFormError("সঠিক ১১-ডিজিটের সচল মোবাইল নম্বর দিন যাতে আমরা যোগাযোগ করতে পারি।");
      return;
    }

    const newLead: VisitorMessage = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      mobile: mobile.trim(),
      courseOfInterest: selectedCourse,
      message: note.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    onAddVisitorMessage(newLead);
    setSuccess(true);

    // Reset Form
    setName("");
    setMobile("");
    setNote("");
    
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  // Helper to render lucide icon component dynamically
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Monitor": return <Monitor className="w-5 h-5 text-indigo-600" />;
      case "Palette": return <Palette className="w-5 h-5 text-indigo-600" />;
      case "Code": return <Code className="w-5 h-5 text-indigo-600" />;
      case "Database": return <Database className="w-5 h-5 text-indigo-600" />;
      default: return <Monitor className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div id="courses-section" className="space-y-12">
      
      {/* Intro */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          আমাদের কোর্স সমূহ ও ভর্তি কার্যক্রম
        </h2>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          স্বপ্ন টেকনিক্যাল কম্পিউটার সেন্টারে গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত সিলেবাস অনুযায়ী দক্ষ ট্রেইনার দ্বারা সম্পূর্ণ প্র্যাক্টিক্যাল ক্লাস পরিচালনা করা হয়।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Catalog (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((course) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={course.id}
                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left space-y-5"
              >
                <div className="space-y-4">
                  {/* Icon Card Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl">
                      {renderIcon(course.icon)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">{course.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider font-mono">ID: {course.id.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Course Bengali Info */}
                  <p className="text-slate-705 font-medium text-xs border-l-2 border-indigo-500 pl-3 italic">
                    {course.bengliTitle}
                  </p>

                  {/* Syllabus lists */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">সিলেবাসের বিশেষ অংশসমূহ:</p>
                    <ul className="space-y-1 text-slate-600 text-xs">
                      {course.skillsCovered.map((skill, index) => (
                        <li key={index} className="flex gap-2 items-start shrink-0">
                          <CheckSquare className="w-3.5 h-3.5 mt-0.5 text-indigo-500 shrink-0" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer and Info Badge Row */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold gap-3">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">কোর্স ফি (Fee)</span>
                    <strong className="text-base text-slate-800 font-mono font-black">৳{course.fee.toLocaleString()}</strong>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">সময়সীমা / ক্লাস</span>
                    <span className="text-[11px] text-slate-700 font-mono flex items-center justify-end gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {course.duration}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Discount / Facility Callout */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative text-left">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Flame className="w-56 h-56 text-rose-500 transform rotate-12" />
            </div>
            <div className="space-y-2 z-10">
              <span className="bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest py-1 px-3 rounded-md inline-block">
                বিশেষ ল্যাব অফার 🔥
              </span>
              <h4 className="text-xl font-extrabold text-white">গরীব ও মেধারী শিক্ষার্থীদের জন্য বিশেষ ছাড়!</h4>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                স্বপ্ন আইটিতে দরিদ্র ও অসচ্ছল পরিবারের উদ্যোমী সন্তানদের কম্পিউটার শিক্ষার প্রসারে পরিচালক সাঈদ স্যারের পক্ষ থেকে ফি ছাড়ের সুযোগ রয়েছে।
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-750 text-center shrink-0 w-full md:w-auto z-10">
              <p className="text-xs text-slate-400">ভর্তির হেল্পলাইন (Saiyed Sir)</p>
              <strong className="text-lg text-emerald-450 font-mono font-extrabold block mt-0.5">০১৯৪১৬৫২০৯৭</strong>
              <p className="text-[9px] text-slate-500 font-medium font-sans mt-1">সকাল ৯টা - রাত ৮টা (শুক্রবার বন্ধ)</p>
            </div>
          </div>
        </div>

        {/* Admission Form (1 column Grid) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 md:p-8 shadow-md shadow-indigo-50/30 text-left space-y-6 relative sticky top-6">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                অনলাইন ভর্তি আবেদন ফরম
              </h4>
              <p className="text-xs text-slate-500 text-left">
                ঘরে বসেই স্বপ্ন কম্পিউটারে ভর্তির প্রাথমিক বুকিং করুন। সাঈদ স্যার আপনার সাথে যোগাযোগ করবেন।
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700">আবেদনকারীর নাম (Full Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ জুবায়ের হোসেন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700">সক্রিয় মোবাইল নম্বর (Mobile Number)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ০১৮৩০০০৩৪৮৮"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700">পছন্দনীয় কোর্স (Select Course)</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  {COURSES.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700">অতিরিক্ত জিজ্ঞাসা / ঠিকানা (ঐচ্ছিক)</label>
                <textarea
                  placeholder="আপনার বর্তমান এলাকা অথবা ল্যাব ব্যাচ পছন্দ নিয়ে কোনো মন্তব্য থাকলে লিখুন..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none h-16"
                  maxLength={200}
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 text-red-650 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs space-y-1 text-left border border-emerald-100 font-semibold select-none">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    আবেদন সফলভাবে সাবমিট হয়েছে!
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal">
                    সফল বুকিং রিকোয়েস্টটি অফিস ডেস্কে পাঠানো হয়েছে। সাইদ স্যার শীঘ্রই আপনার মোবাইলে কল দিয়ে সময় চূড়ান্ত করবেন।
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-3 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                আবেদন পত্র দাখিল করুন
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
