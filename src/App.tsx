import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  School, Monitor, Award, BookOpen, Clock, Heart, Users, ShieldCheck, 
  MapPin, Phone, MessageSquare, Menu, X, ArrowRight, UserCheck, Flame, Cpu, Headphones,
  Brain, Sparkles, RefreshCw
} from "lucide-react";
import { Student, ModelTestResult, VisitorMessage, Notice, NoticeComment } from "./types";
import { INITIAL_STUDENTS, INITIAL_RESULTS } from "./data";

// Import custom subviews
import StudentResultChecker from "./components/StudentResultChecker";
import AdminPanel from "./components/AdminPanel";
import CourseRegistration from "./components/CourseRegistration";
import AboutContact from "./components/AboutContact";
import HomeNoticeCard from "./components/HomeNoticeCard";
import StudentShowcase from "./components/StudentShowcase";

// Import Firebase config & Helpers
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "./firebase";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "courses" | "results" | "about" | "admin">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core state managers
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ModelTestResult[]>([]);
  const [visitorMessages, setVisitorMessages] = useState<VisitorMessage[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackLocalStorage, setUsingFallbackLocalStorage] = useState(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);

  // Firestore DB operations definitions
  const fetchStudents = async () => {
    try {
      const snap = await getDocs(collection(db, "students"));
      const list: Student[] = [];
      snap.forEach((d) => list.push(d.data() as Student));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "students");
      return [];
    }
  };

  const fetchResults = async () => {
    try {
      const snap = await getDocs(collection(db, "results"));
      const list: ModelTestResult[] = [];
      snap.forEach((d) => list.push(d.data() as ModelTestResult));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "results");
      return [];
    }
  };

  const fetchNoticesFromFirestore = async () => {
    try {
      const snap = await getDocs(collection(db, "notices"));
      const list: Notice[] = [];
      for (const d of snap.docs) {
        const noticeData = d.data() as Omit<Notice, "comments">;
        const commentsSnap = await getDocs(collection(db, `notices/${d.id}/comments`));
        const commentsList: NoticeComment[] = [];
        commentsSnap.forEach((cDoc) => {
          commentsList.push(cDoc.data() as NoticeComment);
        });
        commentsList.sort((a, b) => a.date.localeCompare(b.date));
        list.push({
          ...noticeData,
          id: d.id,
          comments: commentsList,
        });
      }
      list.sort((a, b) => b.date.localeCompare(a.date));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "notices");
      return [];
    }
  };

  const fetchVisitorMessages = async () => {
    try {
      const snap = await getDocs(collection(db, "visitorMessages"));
      const list: VisitorMessage[] = [];
      snap.forEach((d) => list.push(d.data() as VisitorMessage));
      list.sort((a, b) => b.date.localeCompare(a.date));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "visitorMessages");
      return [];
    }
  };

  // Seeding effect on component mount
  useEffect(() => {
    const loadAndSeedData = async () => {
      let offlineMode = false;
      let errorMsgStr = "";
      let dbStudents: Student[] = [];
      let dbResults: ModelTestResult[] = [];
      let dbNotices: Notice[] = [];
      let dbMessages: VisitorMessage[] = [];

      try {
        // Try testing connection by reading students collection
        try {
          dbStudents = await fetchStudents();
          if (dbStudents.length === 0) {
            for (const s of INITIAL_STUDENTS) {
              await setDoc(doc(db, "students", s.roll), s);
            }
            dbStudents = INITIAL_STUDENTS;
          }
        } catch (e: any) {
          console.warn("Firestore collection 'students' failed. Enforcing offline fallback.", e);
          offlineMode = true;
          errorMsgStr = e?.message || String(e);
        }

        if (!offlineMode) {
          try {
            dbResults = await fetchResults();
            if (dbResults.length === 0) {
              for (const r of INITIAL_RESULTS) {
                await setDoc(doc(db, "results", r.roll), r);
              }
              dbResults = INITIAL_RESULTS;
            }
          } catch (e: any) {
            console.warn("Firestore collection 'results' failed.", e);
            offlineMode = true;
            errorMsgStr = e?.message || String(e);
          }
        }

        if (!offlineMode) {
          try {
            dbNotices = await fetchNoticesFromFirestore();
            if (dbNotices.length === 0) {
              const presetNotices = [
                {
                  id: "preset-notice-1",
                  title: "কম্পিউটার অফিস অ্যাপ্লিকেশন ১ম মডেল টেস্ট পরীক্ষার সময়সূচী 📢",
                  content: "সম্মানিত শিক্ষার্থীবৃন্দ, আগামী ১৫ই জুন, ২০২৬ তারিখ রোজ রবিবার সকাল ১০:০০ ঘটিকায় আমাদের ল্যাবে কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্সের প্রথম সেশন মডেল টেস্ট পরীক্ষা অনুষ্ঠিত হবে। পরীক্ষায় পাস করার জন্য নূন্যতম ৪০% নম্বর পেতে হবে। সকল নিয়মিত শিক্ষার্থীকে প্রবেশপত্র ও খাতা সহ উপস্থিত থাকার জন্য নির্দেশ দেওয়া যাচ্ছে।",
                  date: "2026-06-09",
                  likesCount: 14,
                },
                {
                  id: "preset-notice-2",
                  title: "পবিত্র ঈদুল আযহা উপলক্ষে সরকারি ছুটি ও নোটিশ 🌙",
                  content: "স্বপ্ন কম্পিউটার ট্রেনিং সেন্টারের সকল শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, পবিত্র ঈদুল আযহা উপলক্ষে আগামী ১২ই জুন থেকে ১৭ই জুন পর্যন্ত সকল অফলাইন থিউরি ও প্র্যাক্টিক্যাল ক্লাস বন্ধ থাকবে। আগামী ১৮ই জুন রোজ বৃহস্পতিবার থেকে যথারীতি সব ব্যাচের ক্লাস শুরু হবে। সবাইকে অগ্রিম পবিত্র ঈদ-উল-আযহার শুভেচ্ছা, ঈদ মোবারক!",
                  date: "2026-06-08",
                  likesCount: 25,
                }
              ];

              const notice1Comments = [
                {
                  id: "cmt-1",
                  authorName: "মিনহাজুল কবির",
                  text: "ইনশাআল্লাহ স্যার, আমরা সবাই প্রস্তুতি নিচ্ছি। পরীক্ষা দেওয়ার জন্য ল্যাবে নির্দিষ্ট পিসি এলোকেশন করা থাকবে কি?",
                  date: "2026-06-09"
                },
                {
                  id: "cmt-2",
                  authorName: "সাঈদ স্যার (পরিচালক)",
                  text: "হ্যাঁ মিনহাজ, ল্যাবের ১ থেকে ১০ নম্বর পিসিতে এই টেস্ট হবে। সকালের ব্যাচের জন্য আলাদা সেট থাকবে।",
                  date: "2026-06-09"
                }
              ];

              const notice2Comments = [
                {
                  id: "cmt-3",
                  authorName: "ফারহানা মিলি",
                  text: "সবাইকে ঈদ মোবারক! ছুটির পর আবারো ল্যাবে দেখা হবে ইনশাআল্লাহ।",
                  date: "2026-06-08"
                }
              ];

              for (const n of presetNotices) {
                await setDoc(doc(db, "notices", n.id), n);
              }
              for (const c of notice1Comments) {
                await setDoc(doc(db, "notices/preset-notice-1/comments", c.id), c);
              }
              for (const c of notice2Comments) {
                await setDoc(doc(db, "notices/preset-notice-2/comments", c.id), c);
              }

              dbNotices = [
                { ...presetNotices[0], comments: notice1Comments, likedByUser: false },
                { ...presetNotices[1], comments: notice2Comments, likedByUser: false }
              ];
            }
          } catch (e: any) {
            console.warn("Firestore collection 'notices' failed.", e);
            offlineMode = true;
            errorMsgStr = e?.message || String(e);
          }
        }

        if (!offlineMode) {
          try {
            dbMessages = await fetchVisitorMessages();
            if (dbMessages.length === 0) {
              const presetMessages = [
                {
                  id: "preset-1",
                  name: "মোহাম্মদ রাশেদ",
                  mobile: "01819882211",
                  courseOfInterest: "Computer Office Application",
                  message: "আমি ৩ মাসের সার্টিফিকেট কোর্সটি করতে আগ্রহী, সকালের কোনো ব্যাচ আছে কি স্যার?",
                  date: "2026-06-08"
                },
                {
                  id: "preset-2",
                  name: "ফারহানা আক্তার মিলি",
                  mobile: "01722667788",
                  courseOfInterest: "Graphic Design & Multimedia",
                  message: "বাসায় প্র্যাকটিসের জন্য কম্পিউটার থাকা কি বাধ্যতামূলক?",
                  date: "2026-06-09"
                }
              ];
              for (const m of presetMessages) {
                await setDoc(doc(db, "visitorMessages", m.id), m);
              }
              dbMessages = presetMessages;
            }
          } catch (e: any) {
            console.warn("Firestore collection 'visitorMessages' failed.", e);
            offlineMode = true;
            errorMsgStr = e?.message || String(e);
          }
        }

        if (offlineMode) {
          setUsingFallbackLocalStorage(true);
          try {
            const parsed = JSON.parse(errorMsgStr);
            setDbErrorMessage(parsed.error || errorMsgStr);
          } catch {
            setDbErrorMessage(errorMsgStr);
          }

          // Load from LocalStorage
          const localStudents = localStorage.getItem("swapno_students");
          const localResults = localStorage.getItem("swapno_results");
          const localNotices = localStorage.getItem("swapno_notices");
          const localMessages = localStorage.getItem("swapno_messages");

          if (localStudents) {
            setStudents(JSON.parse(localStudents));
          } else {
            setStudents(INITIAL_STUDENTS);
            localStorage.setItem("swapno_students", JSON.stringify(INITIAL_STUDENTS));
          }

          if (localResults) {
            setResults(JSON.parse(localResults));
          } else {
            setResults(INITIAL_RESULTS);
            localStorage.setItem("swapno_results", JSON.stringify(INITIAL_RESULTS));
          }

          if (localNotices) {
            setNotices(JSON.parse(localNotices));
          } else {
            const presetNoticesLocal = [
              {
                id: "preset-notice-1",
                title: "কম্পিউটার অফিস অ্যাপ্লিকেশন ১ম মডেল টেস্ট পরীক্ষার সময়সূচী 📢",
                content: "সম্মানিত শিক্ষার্থীবৃন্দ, আগামী ১৫ই জুন, ২০২৬ তারিখ রোজ রবিবার সকাল ১০:০০ ঘটিকায় আমাদের ল্যাবে কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্সের প্রথম সেশন মডেল টেস্ট পরীক্ষা অনুষ্ঠিত হবে। পরীক্ষায় পাস করার জন্য নূন্যতম ৪০% নম্বর পেতে হবে। সকল নিয়মিত শিক্ষার্থীকে প্রবেশপত্র ও খাতা সহ উপস্থিত থাকার জন্য নির্দেশ দেওয়া যাচ্ছে।",
                date: "2026-06-09",
                likesCount: 14,
                comments: [
                  {
                    id: "cmt-1",
                    authorName: "মিনহাজুল কবির",
                    text: "ইনশাআল্লাহ স্যার, আমরা সবাই প্রস্তুতি নিচ্ছি। পরীক্ষা দেওয়ার জন্য ল্যাবে নির্দিষ্ট পিসি এলোকেশন করা থাকবে কি?",
                    date: "2026-06-09"
                  },
                  {
                    id: "cmt-2",
                    authorName: "সাঈদ স্যার (পরিচালক)",
                    text: "হ্যাঁ মিনহাজ, ল্যাবের ১ থেকে ১০ নম্বর পিসিতে এই টেস্ট হবে। সকালের ব্যাচের জন্য আলাদা সেট থাকবে।",
                    date: "2026-06-09"
                  }
                ],
                likedByUser: false
              },
              {
                id: "preset-notice-2",
                title: "পবিত্র ঈদুল আযহা উপলক্ষে সরকারি ছুটি ও নোটিশ 🌙",
                content: "স্বপ্ন কম্পিউটার ট্রেনিং সেন্টারের সকল শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, পবিত্র ঈদুল আযহা উপলক্ষে আগামী ১২ই জুন থেকে ১৭ই জুন পর্যন্ত সকল অফলাইন থিউরি ও প্র্যাক্টিক্যাল ক্লাস বন্ধ থাকবে। আগামী ১৮ই জুন রোজ বৃহস্পতিবার থেকে যথারীতি সব ব্যাচের ক্লাস শুরু হবে। সবাইকে অগ্রিম পবিত্র ঈদ-উল-আযহার শুভেচ্ছা, ঈদ মোবারক!",
                date: "2026-06-08",
                likesCount: 25,
                comments: [
                  {
                    id: "cmt-3",
                    authorName: "ফারহানা মিলি",
                    text: "সবাইকে ঈদ মোবারক! ছুটির পর আবারো ল্যাবে দেখা হবে ইনশাআল্লাহ।",
                    date: "2026-06-08"
                  }
                ],
                likedByUser: false
              }
            ];
            setNotices(presetNoticesLocal);
            localStorage.setItem("swapno_notices", JSON.stringify(presetNoticesLocal));
          }

          if (localMessages) {
            setVisitorMessages(JSON.parse(localMessages));
          } else {
            const presetMessagesLocal = [
              {
                id: "preset-1",
                name: "মোহাম্মদ রাশেদ",
                mobile: "01819882211",
                courseOfInterest: "Computer Office Application",
                message: "আমি ৩ মাসের সার্টিফিকেট কোর্সটি করতে আগ্রহী, সকালের কোনো ব্যাচ আছে কি স্যার?",
                date: "2026-06-08"
              },
              {
                id: "preset-2",
                name: "ফারহানা আক্তার মিলি",
                mobile: "01722667788",
                courseOfInterest: "Graphic Design & Multimedia",
                message: "বাসায় প্র্যাকটিসের জন্য কম্পিউটার থাকা কি বাধ্যতামূলক?",
                date: "2026-06-09"
              }
            ];
            setVisitorMessages(presetMessagesLocal);
            localStorage.setItem("swapno_messages", JSON.stringify(presetMessagesLocal));
          }
        } else {
          setStudents(dbStudents);
          setResults(dbResults);
          setNotices(dbNotices);
          setVisitorMessages(dbMessages);
        }
      } catch (err: any) {
        console.error("Critical error in loadAndSeedData: ", err);
      } finally {
        setLoading(false);
      }
    };
    loadAndSeedData();
  }, []);

  // Synchronizers wrappers
  const handleAddNotice = async (title: string, content: string) => {
    const id = "notice-" + Date.now();
    const newNotice: Omit<Notice, "comments"> = {
      id,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
      likesCount: 0,
    };

    if (usingFallbackLocalStorage) {
      const fullNotice: Notice = { ...newNotice, comments: [], likedByUser: false };
      setNotices((prev) => {
        const next = [fullNotice, ...prev];
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await setDoc(doc(db, "notices", id), newNotice);
      setNotices((prev) => [{ ...newNotice, comments: [] }, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notices/${id}`);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (usingFallbackLocalStorage) {
      setNotices((prev) => {
        const next = prev.filter((n) => n.id !== id);
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
      return;
    }
    try {
      await deleteDoc(doc(db, "notices", id));
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notices/${id}`);
    }
  };

  const handleUpdateNotice = async (updatedNotice: Notice) => {
    if (usingFallbackLocalStorage) {
      setNotices((prev) => {
        const next = prev.map((n) => (n.id === updatedNotice.id ? updatedNotice : n));
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
      return;
    }
    try {
      const { comments, ...sanitizedNotice } = updatedNotice;
      await setDoc(doc(db, "notices", updatedNotice.id), sanitizedNotice);
      setNotices((prev) =>
        prev.map((n) => (n.id === updatedNotice.id ? updatedNotice : n))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notices/${updatedNotice.id}`);
    }
  };

  const handleLikeNotice = async (id: string) => {
    if (usingFallbackLocalStorage) {
      setNotices((prev) => {
        const next = prev.map((n) => {
          if (n.id === id) {
            const alreadyLiked = n.likedByUser;
            const newLikesCount = alreadyLiked ? n.likesCount - 1 : n.likesCount + 1;
            return {
              ...n,
              likesCount: newLikesCount,
              likedByUser: !alreadyLiked
            };
          }
          return n;
        });
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
      return;
    }

    const nIdx = notices.findIndex((n) => n.id === id);
    if (nIdx === -1) return;
    const notice = notices[nIdx];
    const alreadyLiked = notice.likedByUser;
    const newLikesCount = alreadyLiked ? notice.likesCount - 1 : notice.likesCount + 1;
    try {
      await updateDoc(doc(db, "notices", id), {
        likesCount: newLikesCount
      });
      setNotices((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              likesCount: newLikesCount,
              likedByUser: !alreadyLiked
            };
          }
          return n;
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notices/${id}`);
    }
  };

  const handleAddComment = async (noticeId: string, authorName: string, text: string) => {
    const cmtId = "cmt-" + Date.now();
    const newComment: NoticeComment = {
      id: cmtId,
      authorName: authorName.trim() || "বেনামী শিক্ষার্থী",
      text: text.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    if (usingFallbackLocalStorage) {
      setNotices((prev) => {
        const next = prev.map((n) => {
          if (n.id === noticeId) {
            return {
              ...n,
              comments: [...n.comments, newComment]
            };
          }
          return n;
        });
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await setDoc(doc(db, `notices/${noticeId}/comments`, cmtId), newComment);
      setNotices((prev) =>
        prev.map((n) => {
          if (n.id === noticeId) {
            return {
              ...n,
              comments: [...n.comments, newComment]
            };
          }
          return n;
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notices/${noticeId}/comments/${cmtId}`);
    }
  };

  const handleDeleteComment = async (noticeId: string, commentId: string) => {
    if (usingFallbackLocalStorage) {
      setNotices((prev) => {
        const next = prev.map((n) => {
          if (n.id === noticeId) {
            return {
              ...n,
              comments: n.comments.filter((c) => c.id !== commentId)
            };
          }
          return n;
        });
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await deleteDoc(doc(db, `notices/${noticeId}/comments`, commentId));
      setNotices((prev) =>
        prev.map((n) => {
          if (n.id === noticeId) {
            return {
              ...n,
              comments: n.comments.filter((c) => c.id !== commentId)
            };
          }
          return n;
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notices/${noticeId}/comments/${commentId}`);
    }
  };

  const handleAddStudent = async (newStudent: Student) => {
    if (usingFallbackLocalStorage) {
      setStudents((prev) => {
        const next = [newStudent, ...prev];
        localStorage.setItem("swapno_students", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await setDoc(doc(db, "students", newStudent.roll), newStudent);
      setStudents((prev) => [newStudent, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${newStudent.roll}`);
    }
  };

  const handleDeleteStudent = async (roll: string) => {
    if (usingFallbackLocalStorage) {
      setStudents((prev) => {
        const next = prev.filter((s) => s.roll !== roll);
        localStorage.setItem("swapno_students", JSON.stringify(next));
        return next;
      });
      setResults((prev) => {
        const next = prev.filter((r) => r.roll !== roll);
        localStorage.setItem("swapno_results", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "students", roll));
      try {
        await deleteDoc(doc(db, "results", roll));
      } catch {}
      setStudents((prev) => prev.filter((s) => s.roll !== roll));
      setResults((prev) => prev.filter((r) => r.roll !== roll));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `students/${roll}`);
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    if (usingFallbackLocalStorage) {
      setStudents((prev) => {
        const next = prev.map((s) => (s.roll === updatedStudent.roll ? updatedStudent : s));
        localStorage.setItem("swapno_students", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await setDoc(doc(db, "students", updatedStudent.roll), updatedStudent);
      setStudents((prev) => prev.map((s) => (s.roll === updatedStudent.roll ? updatedStudent : s)));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${updatedStudent.roll}`);
    }
  };

  const handleAddOrUpdateResult = async (newResult: ModelTestResult) => {
    if (usingFallbackLocalStorage) {
      setResults((prev) => {
        const exists = prev.some((r) => r.roll === newResult.roll);
        let next: ModelTestResult[];
        if (exists) {
          next = prev.map((r) => (r.roll === newResult.roll ? newResult : r));
        } else {
          next = [newResult, ...prev];
        }
        localStorage.setItem("swapno_results", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await setDoc(doc(db, "results", newResult.roll), newResult);
      setResults((prev) => {
        const exists = prev.some((r) => r.roll === newResult.roll);
        if (exists) {
          return prev.map((r) => (r.roll === newResult.roll ? newResult : r));
        }
        return [newResult, ...prev];
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `results/${newResult.roll}`);
    }
  };

  const handleAddVisitorMessage = async (newMessage: VisitorMessage) => {
    if (usingFallbackLocalStorage) {
      setVisitorMessages((prev) => {
        const next = [newMessage, ...prev];
        localStorage.setItem("swapno_messages", JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await setDoc(doc(db, "visitorMessages", newMessage.id), newMessage);
      setVisitorMessages((prev) => [newMessage, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `visitorMessages/${newMessage.id}`);
    }
  };

  const navigateTo = (tab: "home" | "courses" | "results" | "about" | "admin") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased">
      
      {/* 1. Header Marquee / Live Notification Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-violet-800 to-indigo-900 text-white text-xs md:text-sm py-2 px-4 shadow-sm select-none overflow-hidden relative font-medium no-print">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <span className="bg-rose-500 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm animate-pulse whitespace-nowrap shrink-0">
            জরুরী নোটিশ 📢
          </span>
          {/* Authentic Scrolling Marquee */}
          <div className="whitespace-nowrap overflow-hidden relative w-full">
            <span className="inline-block pl-[100%] animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer">
              স্বপ্ন কম্পিউটার ট্রেনিং সেন্টারে নতুন সেশনে (কম্পিউটার অফিস অ্যাপ্লিকেশন, গ্রাফিক ডিজাইন, ও প্রফেশনাল ওয়েব ডেভেলপমেন্ট) আকর্ষণীয় ছাড়ে ভর্তি চলছে! যোগাযোগ করুন: ০১৯৪১৬৫২০৯৭ / ০১৮৩০০৩৪৮৮। পরিচালক: মোহাম্মদ সাঈদ স্যার।
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
      `}</style>

      {/* 2. Primary Navigation Bar */}
      <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Branding Logo & Badge */}
            <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
              <div 
                onClick={() => navigateTo("home")} 
                className="flex items-center gap-2.5 md:gap-3 cursor-pointer group select-none"
              >
                <div className="w-9 h-9 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform shrink-0">
                  <School className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="text-left leading-tight shrink-0">
                  <h1 className="text-sm md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-1">
                    স্বপ্ন কম্পিউটার <span className="text-indigo-600 font-normal">আইটি</span>
                  </h1>
                  <p className="text-[9px] md:text-xs text-slate-400 font-bold tracking-widest font-mono">SWAPNO IT • HATHAZARI</p>
                </div>
              </div>

              {/* Saiyed AI Top Logo Link - Always Clickable & Visible */}
              <a 
                href="https://saiyedai.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                title="Saiyed AI ওয়েবসাইটে প্রবেশ করুন"
                className="flex items-center gap-1 bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:scale-105 text-white font-extrabold text-[10px] md:text-xs px-2.5 py-1 rounded-full shadow-md transition-all shrink-0 select-none border border-white/20 select-none animate-pulse hover:animate-none"
              >
                <Sparkles className="w-3 h-3 text-teal-200 animate-spin-slow" />
                <span className="font-sans tracking-tight">Saiyed AI</span>
              </a>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: "home", label: "হোম পেইজ" },
                { id: "courses", label: "কোর্স ও এডমিশন" },
                { id: "results", label: "ফলাফল চেক" },
                { id: "about", label: "ল্যাব পরিচিতি" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Admin Quick Entrance & Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigateTo("admin")}
                className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all relative ${
                  activeTab === "admin"
                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600"
                }`}
              >
                অফিস প্যানেল
                {visitorMessages.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-650 text-white rounded-full flex items-center justify-center text-[9px] font-black tracking-normal">
                    {visitorMessages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile burger toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile slide menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-150 py-3 px-4 space-y-2 text-left"
            >
              {[
                { id: "home", label: "হোম পেইজ" },
                { id: "courses", label: "কোর্স ও ভর্তি বুকিং" },
                { id: "results", label: "ফলাফল চেক করুন" },
                { id: "about", label: "ল্যাব পরিচিতি ও ম্যাপ" },
                { id: "admin", label: "অফিস এডমিন প্যানেল" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id as any)}
                  className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-colors block ${
                    activeTab === tab.id
                      ? "bg-indigo-650 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. Main Stage Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {usingFallbackLocalStorage && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-900 no-print">
            <div className="flex gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-xs font-black">অফলাইন স্টোরেজ ব্যাকআপ চালিত (Offline Storage Activated)</p>
                <p className="text-[11px] text-amber-700 font-medium mt-0.5 leading-relaxed">
                  ফায়ারবেস ক্লাউড ডাটাবেজ সংযোগে ধীরগতি বা ইন্টারাপ্ট থাকায় বর্তমানে আপনার ব্রাউজারের অফলাইন স্টোরেজ (LocalStorage) সচল করা হয়েছে। নোটিশ বোর্ড, নতুন শিক্ষার্থী ও ফলাফল সংযোজনসহ সম্পূর্ণ এডমিন প্যানেল সচল রয়েছে।
                </p>
                {dbErrorMessage && (
                  <p className="text-[10px] text-amber-600 font-mono mt-1 break-all bg-amber-100/30 py-0.5 px-1.5 rounded">
                    ত্রুটির বর্ণনা: {dbErrorMessage}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5 self-start sm:self-center shadow-xs"
            >
              <RefreshCw className="w-3 h-3 text-white" />
              ডাটাবেজে রিকানেক্ট করুন
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-600">ক্লাউড ডাটাবেজ সংযোগ প্রতিস্থাপন করা হচ্ছে...</p>
            <p className="text-xs text-slate-400">স্বপ্ন কম্পিউটার ইনস্টিটিউট লাইভ ডাটাবেজ লোড করা হচ্ছে...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              
              {/* Responsive Hero Segment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 md:p-12 rounded-3xl border border-slate-1 py-10 relative overflow-hidden shadow-xs">
                
                {/* Text Block */}
                <div className="lg:col-span-7 space-y-6 text-left z-10">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-750 px-3.5 py-1.5 rounded-full text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    হাটহাজারীর বিশ্বস্ত কম্পিউটার উইং
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    কম্পিউটার শিখুন, <br />
                    <span className="text-indigo-600 relative inline-block">
                      স্বাবলম্বী ক্যারিয়ার
                    </span> গড়ুন।
                  </h2>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg">
                    স্বপ্ন কারিগরি ও কম্পিউটার সেন্টারে সম্পূর্ণ কোলাহলমুক্ত নিরিবিলি পরিবেশে আপনি পাচ্ছেন প্রফেশনাল কোর্স সুবিধা। আমাদের ল্যাবে প্রজেক্টর এবং ডেডিকেটেড হাই-কনফিগার কম্পিউটার রয়েছে। 
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigateTo("courses")}
                      className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-3 px-6 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      ভর্তি বুকিং ফর্ম
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateTo("results")}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-6 font-bold text-sm transition-all cursor-pointer"
                    >
                      পরীক্ষার মার্কশীট দেখুন
                    </button>
                  </div>

                  {/* Highlights row */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-left font-mono">
                    <div>
                      <strong className="text-xl md:text-2xl font-black text-slate-800">৫০০+</strong>
                      <p className="text-[10px] text-slate-400 font-sans font-bold uppercase mt-0.5">সফল গ্র্যাজুয়েট</p>
                    </div>
                    <div>
                      <strong className="text-xl md:text-2xl font-black text-slate-800">৪ টি</strong>
                      <p className="text-[10px] text-slate-400 font-sans font-bold uppercase mt-0.5">আইটি কোর্স</p>
                    </div>
                    <div>
                      <strong className="text-xl md:text-2xl font-black text-slate-800">১:১</strong>
                      <p className="text-[10px] text-slate-400 font-sans font-bold uppercase mt-0.5">ব্যক্তিগত কেয়ার</p>
                    </div>
                  </div>
                </div>

                {/* Graphical Feature Frame Column */}
                <div className="lg:col-span-5 relative">
                  <div className="w-full h-80 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden relative shadow-inner flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
                    <div className="z-10 p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-white shrink-0 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center mx-auto text-indigo-650">
                        <Cpu className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <strong className="font-extrabold text-slate-800 text-sm md:text-base block">আইটি ল্যাব ট্রেনিং সেন্টার পোর্টাল</strong>
                        <p className="text-xs text-slate-550 max-w-xs mx-auto">
                          সকল শিক্ষার্থীর প্র্যাক্টিক্যাল অনুশীলন ডাটাবেজ ট্র্যাক করতে এবং ডিজিটাল সার্টিফিকেট নিশ্চিত করতে আমাদের নতুন স্বয়ংক্রিয় ক্লাউড হাব।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Features Grid */}
              <div className="space-y-4">
                <div className="text-left border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-800 text-base md:text-lg">আমাদের প্রধান কোর্স কারিকুলাম সমূহ</h3>
                  <p className="text-xs text-slate-500">স্বাবলম্বী স্বাধীন ক্যারিয়ার শুরু করার জন্য সেরা প্রোগ্রাম সমূহ বেছে নিন।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                  {[
                    { title: "কম্পিউটার অফিস অ্যাপ্লিকেশন", desc: "MS Word, Excel, PowerPoint শিখে ক্লাবের মত সরকারী-বেসরকারী জবে সরাসরি আবেদন করুন।", icon: <Monitor className="w-5 h-5 text-indigo-650" /> },
                    { title: "গ্রাফিক ডিজাইন ও ইলাস্ট্রেশন", desc: "অ্যাডোবি ফটোশপ, ইলাস্ট্রেটর এবং কালার কনসেপ্ট প্র্যাকটিস করে ফ্রিল্যান্সিং ক্যারিয়ার।", icon: <Award className="w-5 h-5 text-indigo-650" /> },
                    { title: "ওয়েব ডেভেলপমেন্ট ও ডিজাইন", desc: "HTML, CSS, Tailwind এবং আধুনিক জাভাস্ক্রিপ্ট দিয়ে ড্যাশবোর্ড বানানোর বাস্তব কোর্স।", icon: <BookOpen className="w-5 h-5 text-indigo-650" /> },
                    { title: "ডেটাবেজ প্রোগ্রামিং অ্যান্ড ডিজাইন", desc: "রিলেশনাল ডাটা স্ট্রাকচার, এক্সেল ফর্মুলা, ভিবিএ এবং অফিস বিলিং সফটওয়্যার প্রোজেক্টস।", icon: <School className="w-5 h-5 text-indigo-650" /> },
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl w-10 h-10 flex items-center justify-center">
                          {feat.icon}
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">{feat.title}</h4>
                        <p className="text-slate-550 text-xs leading-relaxed">{feat.desc}</p>
                      </div>
                      <button
                        onClick={() => navigateTo("courses")}
                        className="text-left text-[11px] font-bold text-indigo-650 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        বিস্তারিত জানুন
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic interactive columns for Notices & Students Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Notice board (Left part, 7 out of 12 columns) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between text-left">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-1.5 leading-snug">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                        ইনস্টিটিউট লাইভ নোটিশ বোর্ড (Notice Board)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                        সাঈদ স্যার কর্তৃক প্রকাশিত নিয়মিত তথ্যাবলী ও শিক্ষার্থীবৃন্দের মন্তব্য সেশন।
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {notices.length === 0 ? (
                      <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl">
                        <p className="text-slate-400 text-xs italic">এডমিন প্যানেল থেকে এখনো কোনো নোটিশ জারি করা হয়নি।</p>
                      </div>
                    ) : (
                      notices.map((notice) => (
                        <HomeNoticeCard
                          key={notice.id}
                          notice={notice}
                          onLike={handleLikeNotice}
                          onAddComment={handleAddComment}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Registered Student Portrait Showcase (Right part, 5 out of 12 columns) */}
                <div className="lg:col-span-5 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-xs">
                  <StudentShowcase students={students} />
                </div>
              </div>

              {/* Director's Welcome Card Block */}
              <div className="p-6 md:p-8 bg-amber-50/50 rounded-3xl border border-amber-100 text-left flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-3xl mx-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-550 text-white rounded-full flex items-center justify-center font-extrabold text-xl shrink-0 border border-slate-50 shadow-md">
                  এমএস
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-1.5 leading-snug">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    পরিচালকের ডেক্স থেকে মোহাম্মদ সাঈদ স্যারের শুভেচ্ছা বার্তা
                  </h4>
                  <p className="text-slate-650 italic text-xs md:text-sm leading-relaxed">
                    "প্রিয় তরুণ বন্ধুরা, কম্পিউটার শিক্ষা কোনো বিলাসীতা নয় বরং এটি আধুনিক স্বাবলম্বী হওয়ার মূল হাতিয়ার। স্বপ্ন কম্পিউটারে আমরা কোনো জটিলতা ছাড়া অত্যন্ত সহজ ভাষায় চট্টগ্রামের আঞ্চলিক আবেগের সাথে মিশে বাস্তব প্র্যাক্টিক্যাল শিক্ষা প্রদান করি। আপনাদের দক্ষ গড়ে তোলাই আমার একমাত্র স্বপ্ন।"
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold block">মোহাম্মদ সাঈদ • পরিচালক, স্বপ্ন টেকনিক্যাল রূপকার কম্পিউটার</p>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === "courses" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CourseRegistration onAddVisitorMessage={handleAddVisitorMessage} />
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StudentResultChecker students={students} results={results} />
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AboutContact />
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel
                students={students}
                results={results}
                visitorMessages={visitorMessages}
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                onUpdateStudent={handleUpdateStudent}
                onAddOrUpdateResult={handleAddOrUpdateResult}
                notices={notices}
                onAddNotice={handleAddNotice}
                onDeleteNotice={handleDeleteNotice}
                onUpdateNotice={handleUpdateNotice}
                onDeleteComment={handleDeleteComment}
              />
            </motion.div>
          )}
          </AnimatePresence>
        )}
      </main>

      {/* Floating Speed Contact Bubble on Right Column */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col gap-2">
        <a
          href="tel:01941652097"
          title="কল করুন সাঈদ স্যার"
          className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center cursor-pointer"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* 4. Footer Column */}
      <footer className="bg-slate-900 text-slate-400 text-xs md:text-sm py-8 md:py-12 border-t border-slate-800 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-white">
              <School className="w-5 h-5 text-indigo-500" />
              <strong className="text-sm font-bold">স্বপ্ন কম্পিউটার ট্রেনিং</strong>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              স্বাবলম্বী ক্যারিয়ার গড়ার লক্ষ্যে চট্টগ্রামের হাটহাজারী উপজেলার আমান বাজারে প্রতিষ্ঠিত স্বপ্ন কম্পিউটার আইটি সর্বদা মানসম্মত এবং যুগোপযোগী কম্পিউটার প্রশিক্ষণ দিয়ে আসছে।
            </p>
          </div>

          <div className="space-y-2 text-left">
            <strong className="text-white text-xs block font-bold mb-2">কোর্স সমূহ</strong>
            <ul className="space-y-1.5 text-xs text-slate-450 font-sans">
              <li>Computer Office Application</li>
              <li>Graphic Design & Multimedia</li>
              <li>Professional Web Development</li>
              <li>Database Design & Programming</li>
            </ul>
          </div>

          <div className="space-y-2 text-left">
            <strong className="text-white text-xs block font-bold mb-2">গুরুত্বপূর্ণ লিঙ্ক</strong>
            <div className="flex flex-col gap-1 text-xs">
              <button onClick={() => navigateTo("results")} className="text-left text-slate-405 hover:text-indigo-400">পরীক্ষার ফলাফল অনুসন্ধান</button>
              <button onClick={() => navigateTo("courses")} className="text-left text-slate-405 hover:text-indigo-400">নতুন ভর্তি রিকোয়েস্ট</button>
              <button onClick={() => navigateTo("about")} className="text-left text-slate-405 hover:text-indigo-400">ল্যাব রুট ম্যাপ অবস্থান</button>
              <button onClick={() => navigateTo("admin")} className="text-left text-slate-405 hover:text-indigo-400 font-bold text-rose-450">অফিস এডমিন প্যানেল</button>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <strong className="text-white text-xs block font-bold mb-2">গরম নম্বর (Hotline)</strong>
            <p className="text-xs">পরিচালক সরাসরি:</p>
            <strong className="text-sm font-mono text-emerald-450 block font-bold">০১৯৪১৬৫২০৯৭</strong>
            <p className="text-[10px] text-slate-500">আমান বাজার তরাইল মোড় সংলগ্ন রোড, হাটহাজারী, চট্টগ্রাম।</p>
          </div>

        </div>

        {/* Base line licensing */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-left text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} স্বপ্ন কারিগরি কম্পিউটার ও আইটি ট্রেনিং ইনস্টিটিউট। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-1 font-mono">
            <span>স্থাপিত ২০১৯</span>
            <span>•</span>
            <span className="text-indigo-450 animate-pulse">স্মার্ট বাংলাদেশ অর্জনে সংকল্পবদ্ধ</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
