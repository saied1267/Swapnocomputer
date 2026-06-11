import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, MessageSquare, Send, User, Calendar, Sparkles, Megaphone } from "lucide-react";
import { Notice } from "../types";

interface HomeNoticeCardProps {
  key?: React.Key;
  notice: Notice;
  onLike: (id: string) => void;
  onAddComment: (noticeId: string, authorName: string, text: string) => void;
}

export default function HomeNoticeCard({
  notice,
  onLike,
  onAddComment
}: HomeNoticeCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");

    if (!commentText.trim()) {
      setCommentError("মন্তব্যের ঘরটি খালি রাখা যাবে না!");
      return;
    }

    onAddComment(notice.id, commentAuthor.trim() || "বেনামী শিক্ষার্থী", commentText.trim());
    setCommentText(""); // reset only text input
    // Keep author name so they don't have to retype if they post again
  };

  const isNew = (() => {
    try {
      const noticeDate = new Date(notice.date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - noticeDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    } catch {
      return false;
    }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-3xl border border-indigo-100/60 shadow-xl shadow-indigo-100/30 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-300 overflow-hidden text-left relative"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles className="w-24 h-24 text-indigo-500" />
      </div>

      {/* Accent Header */}
      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 px-6 py-4 flex items-center justify-between border-b border-indigo-100/50">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-white text-indigo-700 border border-indigo-100/50 px-3 py-1.5 rounded-full text-xs font-black tracking-wider shadow-sm">
            <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
            প্রাতিষ্ঠানিক নোটিশ
          </span>
          {isNew && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-md animate-pulse uppercase tracking-widest">
              NEW
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-white/60 px-3 py-1.5 rounded-full border border-white/40 shadow-sm backdrop-blur-sm">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{notice.date}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-4">
        <h4 className="font-extrabold text-slate-900 text-lg md:text-xl leading-tight tracking-tight pr-8">
          {notice.title}
        </h4>
        <div className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
          {notice.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
          <div className="mt-4 pt-2 border-t border-slate-50 flex flex-col items-end opacity-80">
            <span className="font-serif italic text-indigo-700 font-black text-sm">সাঈদ স্যার</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-6 mt-4 border-t border-slate-100/80 flex justify-between items-center text-xs font-bold text-slate-500 relative z-10">
          <button
            type="button"
            onClick={() => onLike(notice.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all hover:bg-slate-50 ${
              notice.likedByUser
                ? "text-rose-500 bg-rose-50/40 hover:bg-rose-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 transition-transform ${notice.likedByUser ? "scale-110 fill-current" : ""}`} />
            <span>লাইক ({notice.likesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all hover:bg-slate-50 ${
              showComments ? "text-indigo-650 bg-indigo-50/40" : "hover:text-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>মন্তব্য সমূহ ({notice.comments.length})</span>
          </button>
        </div>

        {/* Comment Section Panel */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="pt-4 space-y-4 border-t border-slate-50"
            >
              {/* Existing comments list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {notice.comments.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-455 font-medium py-3 italic">
                    এখনো কোনো মন্তব্য করা হয়নি। প্রথম মন্তব্যটি আপনিই করুন!
                  </p>
                ) : (
                  notice.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 items-start bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between leading-none">
                          <strong className="text-slate-800 text-xs font-extrabold">{comment.authorName}</strong>
                          <span className="text-[9px] text-slate-400 font-mono">{comment.date}</span>
                        </div>
                        <p className="text-slate-650 text-xs leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form to post a new comment */}
              <form onSubmit={handleSubmitComment} className="bg-slate-50/40 p-3.5 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-[11px] font-black text-indigo-700 block">মন্তব্য লিখুন (Write Comment)</p>
                
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    placeholder="আপনার নাম (ঐচ্ছিক)"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    maxLength={30}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-base md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-11"
                  />
                  <div className="flex gap-2 w-full font-sans">
                    <input
                      type="text"
                      placeholder="এখানে আপনার মতামত লিখুন..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={150}
                      className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-base md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-11"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 transition-all h-11 text-xs font-black min-w-[80px]"
                      title="মন্তব্য পাঠান"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>পাঠান</span>
                    </button>
                  </div>
                </div>
                {commentError && (
                  <p className="text-[10px] text-rose-600 font-bold leading-none pl-1">{commentError}</p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
