import React from "react";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Award, MonitorCheck, Image as ImageIcon } from "lucide-react";
import { GALLERY_IMAGES } from "../data";
import { CoachingPhoto } from "../types";

interface AboutContactProps {
  coachingPhotos?: CoachingPhoto[];
}

export default function AboutContact({ coachingPhotos = [] }: AboutContactProps) {
  // Merge static default photos with dynamic database photos
  const displayPhotos = coachingPhotos.length > 0
    ? coachingPhotos
    : GALLERY_IMAGES.map((img) => ({
        id: `photo-${img.id}`,
        title: img.title,
        description: img.description,
        url: img.url,
        date: "সংরক্ষিত"
      }));

  return (
    <div id="about-section" className="space-y-12">
      
      {/* Introduction Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-8 md:p-12 text-left relative overflow-hidden shadow-xl shadow-indigo-900/10 border border-indigo-500/10">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Award className="w-96 h-96 transform translate-x-1/4 translate-y-1/4 text-amber-400" />
        </div>
        <div className="space-y-4 max-w-2xl z-10 relative">
          <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full inline-block">
            আমাদের পরিচিতি ও অঙ্গীকার
          </span>
          <h3 className="text-2xl md:text-3.5xl font-black tracking-tight leading-snug">
            স্বপ্ন টেকনিক্যাল কম্পিউটার ট্রেনিং সেন্টার
          </h3>
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-normal">
            স্বপ্ন টেকনিক্যাল কম্পিউটার ট্রেনিং সেন্টার ২০২৫ সালে চট্টগ্রামের হাটহাজারী উপজেলার আমান বাজারে প্রতিষ্ঠিত হওয়ার পর থেকে শত শত শিক্ষার্থীকে কম্পিউটার বিষয়ে দক্ষ ও স্বাবলম্বী করে তুলেছে। স্থানীয় তরুণ সমাজকে আধুনিক বিশ্বের চ্যালেঞ্জ মোকাবেলায় কম্পিউটার শিক্ষার প্রসারে পরিচালক মোহাম্মদ সাঈদ স্যারের সরাসরি তত্ত্বাবধানে প্রতিষ্ঠানটি নিরলস কাজ করে যাচ্ছে।
          </p>
        </div>
      </div>

      {/* Core Values Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left space-y-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center border border-indigo-100">
            <MonitorCheck className="w-5 h-5 text-indigo-650" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">১:১ কম্পিউটার ও লাইভ প্র্যাকটিস</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            প্রতিটি শিক্ষার্থীর জন্য রয়েছে পৃথক কম্পিউটার এবং হাতে কলমে অনুশীলন সুবিধা।
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left space-y-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center border border-indigo-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">সরকারি অনুমোদিত সেরা সিলেবাস</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            বাংলাদেশ ডাক বিভাগ অনুমোদিত ৩ মাস ও ৬ মাস মেয়াদী জাতীয় স্ট্যান্ডার্ড কম্পিউটার প্রশিক্ষণ সিলেবাস।
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left space-y-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center border border-indigo-100">
            <Heart className="w-5 h-5 text-rose-650" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">সাঈদ স্যারের আজীবন ল্যাব এক্সেস</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            কোর্স সমাপ্তির পরও যেকোনো জটিলতায় আমাদের সেন্টারে যেকোনো সময় বিনা মূল্যে এসে প্র্যাকটিস ও গাইড সাপোর্ট পাওয়ার নিশ্চয়তা।
          </p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        <div className="text-left border-b border-slate-150 pb-3 flex justify-between items-end">
          <div>
            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              আমাদের কম্পিউটার ল্যাব ও গ্যালারি
            </h4>
            <p className="text-xs text-slate-500">স্বপ্ন টেকনিক্যাল কম্পিউটার ট্রেনিং সেন্টারের নিয়মিত ক্লাস এবং সাফল্যের সুন্দর মুহূর্তগুলো।</p>
          </div>
          <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
            মোট ছবি: {displayPhotos.length} টি
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayPhotos.map((img) => (
            <div key={img.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all text-left flex flex-col group hover:-translate-y-1 duration-300">
              <div className="h-44 bg-slate-100 overflow-hidden relative shrink-0">
                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-indigo-650 duration-200 line-clamp-1">{img.title}</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{img.description}</p>
                </div>
                {img.date && (
                  <span className="text-[8.5px] font-mono text-slate-400 block pt-1 border-t border-slate-50">ক্যাপচার: {img.date}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact and Maps Location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact info list */}
        <div className="lg:col-span-1 space-y-4 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h4 className="font-extrabold text-slate-800 text-base">যোগাযোগের ঠিকানা</h4>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start text-xs text-slate-600">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">আমাদের সেন্টারের অবস্থান:</strong>
                  <span>কলেজ রোড, ইব্রাহিম মার্কেট ২য় তলা, আমান বাজার, হাটহাজারী, চট্টগ্রাম।</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-600">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">মোবাইল ফোন ও হটলাইন:</strong>
                  <span className="font-mono block text-slate-700 font-bold">০১৯৪১৬৫২০৯৭</span>
                  <span className="font-mono block text-slate-500">01941652097 (মোহাম্মদ সাঈদ স্যার)</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-600">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">ইমেইল ঠিকানা (Email):</strong>
                  <span className="font-mono"></span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-600">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">সাপ্তাহিক কর্মঘণ্টা:</strong>
                  <span>শনিবার থেকে বৃহস্পতিবার (সকাল ১০:০০ টা - সন্ধা ৭:০০ টা)। শুক্রবার সাপ্তাহিক বন্ধ।</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Static Map Mockup Card */}
        <div className="lg:col-span-2 text-left space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-base">হাটহাজারী রোড থেকে আসার রুট ম্যাপ</h4>
              <p className="text-xs text-slate-500">চট্টগ্রাম শহরের অক্সিজেন মোড় হয়ে হাটহাজারী রোডে আমান বাজার মোড় নামলেই সহজে পাওয়া যাবে।</p>
            </div>
            
            {/* Visual static map representation */}
            <div className="h-64 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Fake visual map mock of Aman Bazar */}
              <div className="z-10 p-5 max-w-sm text-center space-y-4">
                <div className="inline-flex gap-2 items-center bg-white px-3 py-1.5 rounded-full border border-indigo-150 shadow-sm font-semibold text-xs text-indigo-850">
                  <MapPin className="text-indigo-650 w-4 h-4" />
                  স্বপ্ন কম্পিউটার ট্রেনিং সেন্টার পোর্ট
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 select-none font-medium">
                  <p>⛽ অক্সিজেন মোড় (২ কিমি দুরে) •• [চট্টগ্রাম-হাটহাজারী রোড] •• 🕌 আমান বাজার মোড়</p>
                  <p className="font-bold text-slate-800">📍 কলেজ রোড, ইব্রাহিম মার্কেট ২য় তলা</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/55 p-3 rounded-xl text-[11px] text-indigo-900 border border-indigo-100 font-medium">
              💡 <strong>সহজে খুঁজে পেতে:</strong> আমাদের প্রতিষ্টানে আসার আগে পরিচালক সাঈদ স্যারকে কল দিন।
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
