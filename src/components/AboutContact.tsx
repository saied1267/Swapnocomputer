import React from "react";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Award, ShieldAlert, MonitorCheck } from "lucide-react";
import { GALLERY_IMAGES } from "../data";

export default function AboutContact() {
  return (
    <div id="about-section" className="space-y-12">
      
      {/* Introduction Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 text-left relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
          <Award className="w-96 h-96 transform translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="space-y-4 max-w-2xl z-10 relative">
          <span className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full inline-block">
            আমাদের পরিচিতি ও অঙ্গীকার
          </span>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug">
            স্বপ্ন টেকনিক্যাল কম্পিউটার ট্রেনিং সেন্টার
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
            স্বপ্ন টেকনিক্যাল কম্পিউটার ও আইটি ট্রেনিং ইনস্টিটিউট ২০২৫ সালে চট্টগ্রামের হাটহাজারী উপজেলার আমান বাজারে প্রতিষ্ঠিত হওয়ার পর থেকে শত শত শিক্ষার্থীকে আইটি বিষয়ে দক্ষ ও স্বাবলম্বী করে তুলেছে। স্থানীয় তরুণ সমাজকে আধুনিক বিশ্বের চ্যালেঞ্জ মোকাবেলায় কম্পিউটার শিক্ষার প্রসারে পরিচালক মোহাম্মদ সাঈদ স্যারের সরাসরি তত্ত্বাবধানে প্রতিষ্ঠানটি নিরলস কাজ করে যাচ্ছে।
          </p>
        </div>
      </div>

      {/* Core Values Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left space-y-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
            <MonitorCheck className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm md:text-base">১:১ কম্পিউটার ও সেশন</h4>
          <p className="text-slate-550 text-xs leading-relaxed">
            প্রতিটি শিক্ষার্থীর জন্য রয়েছে পৃথক কম্পিউটার এবং অনুশীলন সুবিধা। কোনো শেয়ারিং নয়!
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left space-y-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm md:text-base">ডাক বি
          বাভাগ অনুমোদিত</h4>
          <p className="text-slate-550 text-xs leading-relaxed">
            ডাক বিভাগ অনুমোদিত কোর্স প্যাটার্ন ও সার্টিফিকেশন মানদণ্ড অনুযায়ী আমরা শিক্ষা দান করি।
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left space-y-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm md:text-base">আজীবন ল্যাব এক্সেস সাপোর্ট</h4>
          <p className="text-slate-550 text-xs leading-relaxed">
            কোর্স সমাপ্তির পরও যেকোনো জটিলতায় আমাদের ল্যাবে যেকোনো সময় বিনা মূল্যে এসে প্র্যাকটিস ও গাইড সাপোর্ট পাওয়ার সুযোগ।
          </p>
        </div>
      </div>

      {/* Gallery Carousel Grid */}
      <div className="space-y-4">
        <div className="text-left border-b border-slate-100 pb-2">
          <h4 className="font-extrabold text-slate-800 text-base">আমাদের কম্পিউটার ল্যাব ও একাডেমি গ্যালারি</h4>
          <p className="text-xs text-slate-500">Swapno Computer</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GALLERY_IMAGES.map((img) => (
            <div key={img.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all text-left">
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h5 className="font-bold text-slate-800 text-xs md:text-sm">{img.title}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{img.description}</p>
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
              <div className="flex gap-3 items-start text-xs text-slate-650">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">আমাদের ল্যাব অবস্থান:</strong>
                  <span> ইব্রাহিম মার্কেট ২য় তলা, কলেজ রোড, আমান বাজার, হাটহাজারী, চট্টগ্রাম।</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-650">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">মোবাইল ফোন ও হটলাইন:</strong>
                  <span className="font-mono block text-slate-700 font-bold">০১৯৪১৬৫২০৯৭</span>
                  <span className="font-mono block text-slate-500">০১৮৩০০৩৪৮৮ (মোহাম্মদ সাঈদ স্যার)</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-650">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">ইমেইল ঠিকানা (Email):</strong>
                  <span className="font-mono">#</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-650">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-800 text-xs block mb-0.5">সাপ্তাহিক কর্মঘণ্টা:</strong>
                  <span>শনিবার থেকে বৃহস্পতিবার (সকাল ১০:০০ টা - সন্ধা ৭:০০ টা) । শুক্রবার সাপ্তাহিক বন্ধ।</span>
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
              <p className="text-xs text-slate-500">চট্টগ্রাম শহরের অক্সিজেন মোড় হয়ে হাটহাজারী রোডে আমান মোড়</p>
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
                  <p>⛽ অক্সিজেন মোড় (২ কিমি দুরে) •••••• [চট্টগ্রাম-হাটহাজারী রোড] •••••• 🕌 আমান বাজার জামে মসজিদ</p>
                  <p className="font-bold text-slate-800">📍 কলেজ রোড / ইব্রাহিম মার্কেট - ওপরে ২য় তলা</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-3 rounded-xl text-[11px] text-indigo-900 border border-indigo-100 font-medium">
              💡 <strong>সহজে খুঁজে পেতে:</strong> আমাদের ল্যাবে আসার আগে পরিচালক সাঈদ স্যারকে কল দিন। আপনি আমান বাজার মোড় নামলে আমরা আপনাকে রিসিভ করার ব্যবস্থা করতে পারব।
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
