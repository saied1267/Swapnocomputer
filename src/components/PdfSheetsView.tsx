import React, { useState } from "react";
import { motion } from "motion/react";
import { FileText, Download, Search, BookOpen, Calendar, User, HardDrive } from "lucide-react";
import { PdfSheet } from "../types";
import { COURSES } from "../data";

interface PdfSheetsViewProps {
  pdfSheets: PdfSheet[];
}

export default function PdfSheetsView({ pdfSheets }: PdfSheetsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const filteredSheets = pdfSheets.filter((sheet) => {
    const matchesSearch = sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sheet.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === "all" || sheet.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-xs font-black">
          <FileText className="w-3.5 h-3.5 animate-pulse" />
          <span>অনলাইন লাইব্রেরি ও লেকচার শিট</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ক্লাস লেকচার ও সাজেশন্স (PDF)
        </h2>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          সাঈদ কম্পিউটার ইনস্টিটিউট-এর নিয়মিত ছাত্র-ছাত্রীদের জন্য প্রয়োজনীয় কোর্স শিট, গাইডলাইন ও কারিগরি বোর্ডের পরীক্ষার সাজেশন ডাউনলোড করুন এখান থেকে।
        </p>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="শিটের নাম বা বিষয় দিয়ে অনুসন্ধান করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick filter */}
          <div className="flex gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-650 text-xs font-black px-3 py-2 border border-slate-200 rounded-2xl transition-all cursor-pointer"
              >
                মুছে ফেলুন
              </button>
            )}
          </div>
        </div>

        {/* Course Filter horizontal bar */}
        <div className="border-t border-slate-50 pt-3">
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 text-left mb-2">কোর্স অনুযায়ী ফিল্টার</p>
          <div className="flex flex-wrap gap-2 justify-start">
            <button
              onClick={() => setSelectedCourse("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCourse === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              সকল শিট ({pdfSheets.length})
            </button>
            {COURSES.map((course) => {
              const count = pdfSheets.filter(s => s.course === course.title).length;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.title)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCourse === course.title
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {course.title} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sheet List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSheets.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-700 font-bold text-sm">কোনো শিট বা গাইড বুক পাওয়া যায়নি</p>
              <p className="text-slate-450 text-xs text-center max-w-xs mx-auto">
                এই ক্যাটাগরিতে এখনো কোনো পিডিএফ যোগ করা হয়নি অথবা আপনার অনুসন্ধানের সাথে মেলেনি।
              </p>
            </div>
          </div>
        ) : (
          filteredSheets.map((sheet) => (
            <motion.div
              layout
              key={sheet.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all text-left flex gap-4 items-start relative group overflow-hidden"
            >
              {/* PDF Icon block with beautiful file size badge */}
              <div className="w-12 h-14 bg-rose-50 text-rose-600 rounded-xl flex flex-col items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-100 transition-colors select-none">
                <FileText className="w-6 h-6" />
                <span className="text-[7.5px] font-black tracking-tighter uppercase text-rose-700 mt-1">PDF</span>
              </div>

              {/* Data block */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="space-y-1">
                  <span className="inline-flex bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                    {sheet.course}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-xs md:text-sm leading-snug group-hover:text-indigo-650 transition-colors line-clamp-2 pr-4">
                    {sheet.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-400 font-sans">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{sheet.uploader || "সাঈদ স্যার"}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{sheet.date}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-500">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{sheet.fileSize || "1.5 MB"}</span>
                  </div>
                </div>
              </div>

              {/* Download Action Trigger */}
              <a
                href={sheet.downloadUrl}
                target="_blank"
                rel="noreferrer noopener"
                download
                className="self-center p-3 bg-slate-50 hover:bg-indigo-600 border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
                title="পিডিএফ ফাইল ডাউনলোড করুণ"
              >
                <Download className="w-4 h-4" />
              </a>
            </motion.div>
          ))
        )}
      </div>

      {/* Student notice card */}
      <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100/40 text-left flex gap-4 items-start select-none">
        <span className="text-xl">🎓</span>
        <div className="space-y-1">
          <strong className="text-xs font-black text-indigo-900 block">অনলাইন স্টাডি ম্যাটেরিয়াল সাপোর্ট</strong>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            যদি কোনো শীট ডাউনলোড বা পড়তে সমস্যা হয়, দয়াকরে ক্লাস চলাকালীন আপনার ল্যাব ইন্সট্রাক্টর বা মোহাম্মদ সাঈদ স্যারকে অবগতির জন্য জানান। আমরা গুগল ড্রাইভ ছাড়াও সরাসরি পেনড্রাইভে ফাইল দেয়ার সাপোর্ট প্রদান করি।
          </p>
        </div>
      </div>
    </div>
  );
}
