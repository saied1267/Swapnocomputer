import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, UserCheck, ShieldCheck, Tag, BookOpen } from "lucide-react";
import { Student } from "../types";

interface StudentShowcaseProps {
  students: Student[];
}

export default function StudentShowcase({ students }: StudentShowcaseProps) {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

  // Extract unique courses from students to filter dynamically
  const uniqueCourses = useMemo(() => {
    const list = students.map((s) => s.course);
    return ["all", ...Array.from(new Set(list))];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.roll.includes(search) ||
        student.address.toLowerCase().includes(search.toLowerCase());
      
      const matchCourse = selectedCourse === "all" || student.course === selectedCourse;
      
      return matchSearch && matchCourse;
    });
  }, [students, search, selectedCourse]);

  return (
    <div className="space-y-6 text-left">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-1.5 leading-snug">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            আমাদের শিক্ষার্থীরা
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
            স্বপ্ন আইটি থেকে দক্ষ হয়ে ওঠা প্রিয় ছাত্র-ছাত্রীদের তালিকা ও ছবিসমূহ।
          </p>
        </div>

        {/* Dynamic Course Filter Dropdown */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="bg-white border border-slate-205 rounded-xl py-1 px-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
        >
          <option value="all">সব কোর্স ফিল্টার</option>
          {uniqueCourses.filter(c => c !== "all").map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {/* Real-time Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="শিক্ষার্থীর নাম, রোল নম্বর বা ঠিকানা দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 text-slate-800 shadow-3xs"
        />
      </div>

      {/* Grid of Student Cards with fallbacks and lovely animations */}
      {filteredStudents.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl">
          <p className="text-slate-400 text-xs italic">অভিযোগ/অনুসন্ধানের সাথে মিল পাওয়া কোনো শিক্ষার্থী পাওয়া যায়নি!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 max-h-[580px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => (
              <motion.div
                layout
                key={student.roll}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col lg:flex-row items-center lg:items-start gap-3 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
              >
                {/* Micro Verified Watermark */}
                <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md text-[9px] font-bold select-none leading-none scale-90 md:scale-100">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  ভেরিফাইড
                </span>

                {/* Passport portrait display */}
                <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-3xs select-none">
                  {student.pictureUrl ? (
                    <img
                      src={student.pictureUrl}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-indigo-50/50 to-slate-50">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-[8px] font-black mt-1 text-slate-400">ছবি নেই</span>
                    </div>
                  )}
                </div>

                {/* Profile Details block */}
                <div className="text-center lg:text-left flex-1 space-y-1 sm:space-y-1.5 min-w-0 w-full pt-1">
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm truncate leading-tight group-hover:text-indigo-650 transition-colors">
                      {student.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">রোল নম্বর: {student.roll}</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-indigo-750 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md inline-block max-w-full truncate leading-tight flex items-center gap-1">
                      <BookOpen className="w-2.5 h-2.5 shrink-0" />
                      {student.course}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium block truncate">ঠিকানা: {student.address}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
