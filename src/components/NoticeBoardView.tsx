import React, { useState } from "react";
import { motion } from "motion/react";
import { Megaphone, Search, Calendar, Sparkles, Star } from "lucide-react";
import { Notice } from "../types";
import HomeNoticeCard from "./HomeNoticeCard";

interface NoticeBoardViewProps {
  notices: Notice[];
  onLike: (id: string) => void;
  onAddComment: (noticeId: string, authorName: string, text: string) => void;
}

export default function NoticeBoardView({ notices, onLike, onAddComment }: NoticeBoardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black no-print">
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span>লাইভ নোটিশ ও এনাউন্সমেন্ট</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ইনস্টিটিউট অফিসিয়াল নোটিশ বোর্ড
        </h2>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          স্বপ্ন কম্পিউটার ইনস্টিটিউট-এর ভর্তি বিজ্ঞপ্তি, পরীক্ষার সূচি, ছুটির নোটিশ ও অফিসিয়াল খবরাখবর সবার আগে এখানে দেখুন।
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="নোটিশের শিরোনাম বা বিষয় দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs md:text-sm font-semibold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-650 text-xs font-black px-2 py-1 transition-colors"
          >
            মুছে ফেলুন
          </button>
        )}
      </div>

      {/* Notices Feed List */}
      <div className="space-y-6">
        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-700 font-bold text-sm">কোনো নোটিশ পাওয়া যায়নি</p>
              <p className="text-slate-400 text-xs text-center max-w-xs mx-auto">
                {searchQuery ? "আপনার অনুসন্ধানকৃত বিষয়ের কোনো তথ্য নোটিশ বোর্ডে নেই।" : "অফিস প্যানেল থেকে কোনো নোটিশ জারি করা হয়নি।"}
              </p>
            </div>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="relative group">
              <HomeNoticeCard
                notice={notice}
                onLike={onLike}
                onAddComment={onAddComment}
              />
            </div>
          ))
        )}
      </div>

      {/* Notice Board Side Advisory info */}
      <div className="p-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 rounded-2xl border border-indigo-100/40 text-left flex gap-4 items-start">
        <span className="text-xl">💡</span>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-indigo-900">শিক্ষার্থীদের জন্য নির্দেশনা</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            নোটিশের যেকোনো বিষয়ে দ্বিমত বা প্রশ্ন থাকলে সরাসরি নোটিশ কমেন্ট বক্সে আপনার মতামত ও নাম লিখে পাঠাতে পারেন। জরুরি তথ্যের জন্য স্ক্রিনের নিচে থাকা অফিস ফোন নাম্বারে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    </div>
  );
}
