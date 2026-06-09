import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, MessageSquare, Send, User, Calendar } from "lucide-react";
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow duration-300 overflow-hidden text-left"
    >
      {/* Accent Header */}
      <div className="bg-indigo-50/40 px-5 py-3 border-b border-slate-50 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-750 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
          📢 প্রাতিষ্ঠানিক নোটিশ
        </span>
        <div className="flex items-center gap-1 text-[11px] text-slate-450 font-bold font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{notice.date}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-4">
        <h4 className="font-black text-slate-800 text-base md:text-lg leading-snug">
          {notice.title}
        </h4>
        <p className="text-slate-650 text-xs md:text-sm leading-relaxed whitespace-pre-line">
          {notice.content}
        </p>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
          <button
            onClick={() => onLike(notice.id)}
            className={`flex items-center gap-2 px-35 py-1.5 rounded-lg transition-all select-none hover:bg-slate-50 ${
              notice.likedByUser
                ? "text-rose-500 bg-rose-50/40 hover:bg-rose-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 transition-transform ${notice.likedByUser ? "scale-110 fill-current" : ""}`} />
            <span>লাইক ({notice.likesCount})</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all select-none hover:bg-slate-50 ${
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-4 space-y-4 border-t border-slate-50"
            >
              {/* Existing comments list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {notice.comments.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-400 font-medium py-3 italic">
                    এখনো কোনো মন্তব্য করা হয়নি। প্রথম মন্তব্যটি আপনিই করুন!
                  </p>
                ) : (
                  notice.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 items-start bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      <div className="w-7 h-7 rounded-full bg-slate-205 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 select-none bg-indigo-50 text-indigo-700">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between leading-none">
                          <strong className="text-slate-800 text-xs font-extrabold">{comment.authorName}</strong>
                          <span className="text-[9px] text-slate-400 font-mono">{comment.date}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form to post a new comment */}
              <form onSubmit={handleSubmitComment} className="bg-slate-50/40 p-3 rounded-xl border border-slate-100 space-y-2.5">
                <p className="text-[10px] font-bold text-indigo-700 block">মন্তব্য করুন (Add Comment)</p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="আপনার নাম (ঐচ্ছিক)"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    maxLength={30}
                    className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex-[3] flex gap-1.5">
                    <input
                      type="text"
                      placeholder="এখানে আপনার মতামত লিখুন..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={150}
                      className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg p-2 flex items-center justify-center cursor-pointer shadow-xs shrink-0 transition-colors"
                      title="মন্তব্য পাঠান"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {commentError && (
                  <p className="text-[10px] text-rose-600 font-bold leading-none">{commentError}</p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
