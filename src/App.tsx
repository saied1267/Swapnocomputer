import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  School, Monitor, Award, BookOpen, Clock, Heart, Users, ShieldCheck, 
  MapPin, Phone, MessageSquare, Menu, X, ArrowRight, UserCheck, Flame, Cpu, Headphones,
  Brain, Sparkles, RefreshCw
} from "lucide-react";
import { Student, ModelTestResult, VisitorMessage, Notice, NoticeComment, PdfSheet, CoachingPhoto } from "./types";
import { INITIAL_STUDENTS, INITIAL_RESULTS, GALLERY_IMAGES } from "./data";

// Import custom subviews
import StudentResultChecker from "./components/StudentResultChecker";
import AdminPanel from "./components/AdminPanel";
import CourseRegistration from "./components/CourseRegistration";
import AboutContact from "./components/AboutContact";
import HomeNoticeCard from "./components/HomeNoticeCard";
import StudentShowcase from "./components/StudentShowcase";
import NoticeBoardView from "./components/NoticeBoardView";
import PdfSheetsView from "./components/PdfSheetsView";

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
  const [activeTab, setActiveTab] = useState<"home" | "courses" | "results" | "about" | "admin" | "notices" | "pdf-sheets">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin authentication state synced with sessionStorage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("swapno_it_is_admin") === "true";
    } catch {
      return false;
    }
  });

  const handleAdminAuthChange = (auth: boolean) => {
    setIsAdmin(auth);
    try {
      sessionStorage.setItem("swapno_it_is_admin", auth ? "true" : "false");
    } catch (e) {
      console.warn("sessionStorage failed:", e);
    }
  };

  // Core state managers
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ModelTestResult[]>([]);
  const [visitorMessages, setVisitorMessages] = useState<VisitorMessage[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pdfSheets, setPdfSheets] = useState<PdfSheet[]>([]);
  const [coachingPhotos, setCoachingPhotos] = useState<CoachingPhoto[]>([]);
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

  const fetchPdfSheets = async () => {
    try {
      const snap = await getDocs(collection(db, "pdfSheets"));
      const list: PdfSheet[] = [];
      snap.forEach((d) => list.push(d.data() as PdfSheet));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "pdfSheets");
      return [];
    }
  };

  const fetchCoachingPhotos = async () => {
    try {
      const snap = await getDocs(collection(db, "coachingPhotos"));
      const list: CoachingPhoto[] = [];
      snap.forEach((d) => list.push(d.data() as CoachingPhoto));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "coachingPhotos");
      return [];
    }
  };

  // Optimized multi-stage data loader & background synchronizer
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      let isOffline = false;
      let errorStr = "";

      try {
        const [
          cloudStudents,
          cloudResults,
          cloudNotices,
          cloudMessages,
          cloudPdfSheets,
          cloudPhotos
        ] = await Promise.all([
          fetchStudents(),
          fetchResults(),
          fetchNoticesFromFirestore(),
          fetchVisitorMessages(),
          fetchPdfSheets(),
          fetchCoachingPhotos()
        ]);

        setStudents(cloudStudents.length > 0 ? cloudStudents : INITIAL_STUDENTS);
        setResults(cloudResults.length > 0 ? cloudResults : INITIAL_RESULTS);
        setNotices(cloudNotices);
        setVisitorMessages(cloudMessages);
        setPdfSheets(cloudPdfSheets);
        setCoachingPhotos(cloudPhotos);

        // Background seeding if empty
        if (cloudStudents.length < 5) {
          INITIAL_STUDENTS.forEach(s => setDoc(doc(db, "students", s.roll), s));
        }
        if (cloudResults.length < 5) {
          INITIAL_RESULTS.forEach(r => setDoc(doc(db, "results", r.roll), r));
        }

      } catch (err: any) {
        console.warn("Firestore load failed, using fallback:", err);
        isOffline = true;
        errorStr = err.message;
        setStudents(INITIAL_STUDENTS);
        setResults(INITIAL_RESULTS);
      } finally {
        setLoading(false);
        if (isOffline) {
          setUsingFallbackLocalStorage(true);
          setDbErrorMessage(errorStr);
        }
      }
    };
    loadAllData();
  }, []);



  // System-wide elegant state backup helper
  const activateLocalFallback = (err: any, msg: string) => {
    console.warn(msg, err);
    setUsingFallbackLocalStorage(true);
    let rawError = err instanceof Error ? err.message : String(err);
    try {
      const parsed = JSON.parse(rawError);
      setDbErrorMessage(parsed.error || rawError);
    } catch {
      setDbErrorMessage(rawError);
    }
  };

  // Synchronizers wrappers with automatic self-healing fallback options
  const handleAddNotice = async (title: string, content: string) => {
    const id = "notice-" + Date.now();
    const newNotice: Omit<Notice, "comments"> = {
      id,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
      likesCount: 0,
    };

    const saveLocally = () => {
      const fullNotice: Notice = { ...newNotice, comments: [], likedByUser: false };
      setNotices((prev) => {
        const next = [fullNotice, ...prev];
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      saveLocally();
      return;
    }

    try {
      await setDoc(doc(db, "notices", id), newNotice);
      setNotices((prev) => [{ ...newNotice, comments: [] }, ...prev]);
    } catch (err) {
      activateLocalFallback(err, "Cloud database write notice failed. Storing locally.");
      saveLocally();
    }
  };

  const handleDeleteNotice = async (id: string) => {
    const deleteLocally = () => {
      setNotices((prev) => {
        const next = prev.filter((n) => n.id !== id);
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      deleteLocally();
      return;
    }

    try {
      await deleteDoc(doc(db, "notices", id));
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      activateLocalFallback(err, "Cloud database delete notice failed. Removing locally.");
      deleteLocally();
    }
  };

  const handleUpdateNotice = async (updatedNotice: Notice) => {
    const updateLocally = () => {
      setNotices((prev) => {
        const next = prev.map((n) => (n.id === updatedNotice.id ? updatedNotice : n));
        localStorage.setItem("swapno_notices", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      updateLocally();
      return;
    }

    try {
      const { comments, ...sanitizedNotice } = updatedNotice;
      await setDoc(doc(db, "notices", updatedNotice.id), sanitizedNotice);
      setNotices((prev) =>
        prev.map((n) => (n.id === updatedNotice.id ? updatedNotice : n))
      );
    } catch (err) {
      activateLocalFallback(err, "Cloud database update notice failed. Syncing locally.");
      updateLocally();
    }
  };

  const handleLikeNotice = async (id: string) => {
    const nIdx = notices.findIndex((n) => n.id === id);
    if (nIdx === -1) return;
    const notice = notices[nIdx];
    const alreadyLiked = notice.likedByUser;
    const newLikesCount = alreadyLiked ? notice.likesCount - 1 : notice.likesCount + 1;

    const likeLocally = () => {
      setNotices((prev) => {
        const next = prev.map((n) => {
          if (n.id === id) {
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
    };

    if (usingFallbackLocalStorage) {
      likeLocally();
      return;
    }

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
      activateLocalFallback(err, "Cloud database like notice failed. Storing locally.");
      likeLocally();
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

    const addCommentLocally = () => {
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
    };

    if (usingFallbackLocalStorage) {
      addCommentLocally();
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
      activateLocalFallback(err, "Cloud database add comment failed. Saving locally.");
      addCommentLocally();
    }
  };

  const handleDeleteComment = async (noticeId: string, commentId: string) => {
    const deleteCommentLocally = () => {
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
    };

    if (usingFallbackLocalStorage) {
      deleteCommentLocally();
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
      activateLocalFallback(err, "Cloud database delete comment failed. Removing locally.");
      deleteCommentLocally();
    }
  };

  const handleAddStudent = async (newStudent: Student) => {
    const addStudentLocally = () => {
      setStudents((prev) => {
        const next = [newStudent, ...prev];
        localStorage.setItem("swapno_students", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      addStudentLocally();
      return;
    }

    try {
      await setDoc(doc(db, "students", newStudent.roll), newStudent);
      setStudents((prev) => [newStudent, ...prev]);
    } catch (err) {
      activateLocalFallback(err, "Cloud database add student failed. Saving locally.");
      addStudentLocally();
    }
  };

  const handleDeleteStudent = async (roll: string) => {
    const deleteStudentLocally = () => {
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
    };

    if (usingFallbackLocalStorage) {
      deleteStudentLocally();
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
      activateLocalFallback(err, "Cloud database delete student failed. Removing locally.");
      deleteStudentLocally();
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const updateStudentLocally = () => {
      setStudents((prev) => {
        const next = prev.map((s) => (s.roll === updatedStudent.roll ? updatedStudent : s));
        localStorage.setItem("swapno_students", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      updateStudentLocally();
      return;
    }

    try {
      await setDoc(doc(db, "students", updatedStudent.roll), updatedStudent);
      setStudents((prev) => prev.map((s) => (s.roll === updatedStudent.roll ? updatedStudent : s)));
    } catch (err) {
      activateLocalFallback(err, "Cloud database update student failed. Saving locally.");
      updateStudentLocally();
    }
  };

  const handleAddOrUpdateResult = async (newResult: ModelTestResult) => {
    const addOrUpdateResultLocally = () => {
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
    };

    if (usingFallbackLocalStorage) {
      addOrUpdateResultLocally();
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
      activateLocalFallback(err, "Cloud database create/update result failed. Storing locally.");
      addOrUpdateResultLocally();
    }
  };

  const handleAddVisitorMessage = async (newMessage: VisitorMessage) => {
    const addMessageLocally = () => {
      setVisitorMessages((prev) => {
        const next = [newMessage, ...prev];
        localStorage.setItem("swapno_messages", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      addMessageLocally();
      return;
    }

    try {
      await setDoc(doc(db, "visitorMessages", newMessage.id), newMessage);
      setVisitorMessages((prev) => [newMessage, ...prev]);
    } catch (err) {
      activateLocalFallback(err, "Cloud database add message failed. Saving locally.");
      addMessageLocally();
    }
  };

  const handleAddPdfSheet = async (newSheet: PdfSheet) => {
    const addLocally = () => {
      setPdfSheets((prev) => {
        const next = [newSheet, ...prev];
        localStorage.setItem("swapno_pdf_sheets", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      addLocally();
      return;
    }

    try {
      await setDoc(doc(db, "pdfSheets", newSheet.id), newSheet);
      setPdfSheets((prev) => [newSheet, ...prev]);
    } catch (err) {
      activateLocalFallback(err, "Cloud database write pdf sheet failed. Storing locally.");
      addLocally();
    }
  };

  const handleDeletePdfSheet = async (id: string) => {
    const deleteLocally = () => {
      setPdfSheets((prev) => {
        const next = prev.filter((s) => s.id !== id);
        localStorage.setItem("swapno_pdf_sheets", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      deleteLocally();
      return;
    }

    try {
      await deleteDoc(doc(db, "pdfSheets", id));
      setPdfSheets((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      activateLocalFallback(err, "Cloud database delete pdf sheet failed. Removing locally.");
      deleteLocally();
    }
  };

  const handleAddCoachingPhoto = async (newPhoto: CoachingPhoto) => {
    const addLocally = () => {
      setCoachingPhotos((prev) => {
        const next = [newPhoto, ...prev];
        localStorage.setItem("swapno_coaching_photos", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      addLocally();
      return;
    }

    try {
      await setDoc(doc(db, "coachingPhotos", newPhoto.id), newPhoto);
      setCoachingPhotos((prev) => [newPhoto, ...prev]);
    } catch (err) {
      activateLocalFallback(err, "Cloud database write photo failed. Storing locally.");
      addLocally();
    }
  };

  const handleDeleteCoachingPhoto = async (id: string) => {
    const deleteLocally = () => {
      setCoachingPhotos((prev) => {
        const next = prev.filter((p) => p.id !== id);
        localStorage.setItem("swapno_coaching_photos", JSON.stringify(next));
        return next;
      });
    };

    if (usingFallbackLocalStorage) {
      deleteLocally();
      return;
    }

    try {
      await deleteDoc(doc(db, "coachingPhotos", id));
      setCoachingPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      activateLocalFallback(err, "Cloud database delete photo failed. Removing locally.");
      deleteLocally();
    }
  };

  const navigateTo = (tab: "home" | "courses" | "results" | "about" | "admin" | "notices" | "pdf-sheets") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden overflow-y-auto bg-slate-50 flex flex-col justify-between antialiased">
      
      {/* 2. Primary Navigation Bar */}
      <header className="bg-white border-b border-slate-150 shadow-sm sticky top-0 z-40 no-print py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            
            {/* Row 1: Logo Heading & Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start w-full gap-4">
              <div 
                onClick={() => navigateTo("home")} 
                className="flex items-center gap-3 md:gap-4 cursor-pointer group select-none"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-indigo-600 via-indigo-650 to-violet-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-150 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shrink-0">
                  <School className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-left leading-normal shrink-0">
                  <h1 className="text-xl md:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2 font-sans relative group-hover:text-indigo-750 transition-colors">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950">স্বপ্ন কম্পিউটার</span> 
                    <span className="text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2.5 py-0.5 rounded-xl font-extrabold text-base md:text-2xl shadow-3xs relative inline-block animate-[pulse_3s_infinite]">
                      IT
                      <span className="absolute -bottom-0.5 left-0 w-full h-[2.5px] bg-indigo-600 rounded-full"></span>
                    </span>
                  </h1>
                  <p className="text-[10px] md:text-xs text-slate-500 font-extrabold tracking-widest font-mono mt-1 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shadow-xs"></span>
                    SWAPNO COMPUTER • STUDENT PORTAL
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Sub-Navigation Menu (underneath logo heading) */}
            <div className="w-full border-t border-slate-100 pt-3 md:pt-4">
              <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full justify-start md:justify-center px-1 py-1">
                {[
                  { id: "home", label: "হোম" },
                  { id: "courses", label: "কোর্স ও ভর্তি" },
                  { id: "results", label: "ফলাফল " },
                  { id: "notices", label: "নোটিশ বোর্ড" },
                  { id: "pdf-sheets", label: "লেকচার শিট (PDF)" },
                  { id: "about", label: "ল্যাব পরিচিতি" },
                  { id: "admin", label: "এডমিন" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigateTo(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 font-extrabold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                    {tab.id === "admin" && visitorMessages.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full leading-none">
                        {visitorMessages.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
          </div>
        </div>
      </header>

      {/* 3. Main Stage Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-650">Saiyed এআই ডাটাবেজ সংযোগ প্রতিস্থাপন করা হচ্ছে...</p>
            <p className="text-xs text-slate-400 font-semibold"> Saiyed এআই থেকে লাইভ ডাটাবেজ লোড করা হচ্ছে...</p>
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
              
              {/* Student Portrait Showcase at the absolute top of the Home page */}
              <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-xs text-left">
                <StudentShowcase students={students} results={results} isAdmin={isAdmin} />
              </div>

              {/* Responsive Hero Segment */}
              <div className="bg-white p-6 md:p-12 rounded-3xl border border-slate-100 py-10 relative overflow-hidden shadow-xs text-left">
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none"></div>
                
                {/* Text Block */}
                <div className="space-y-6 max-w-4xl z-10 relative">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-750 px-3.5 py-1.5 rounded-full text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>Amanbaar • আমানবাজার</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    কম্পিউটার শিখুন, <br />
                    <span className="text-indigo-600 relative inline-block">
                      স্বাবলম্বী ক্যারিয়ার
                    </span> গড়ুন।
                  </h2>
                  <p className="text-slate-650 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
                    স্বপ্ন কারিগরি ও কম্পিউটার সেন্টারে সম্পূর্ণ কোলাহলমুক্ত নিরিবিলি পরিবেশে আপনি পাচ্ছেন প্রফেশনাল কোর্স সুবিধা। আমাদের ল্যাবে লার্জ মাল্টিমিডিয়া স্ক্রিন এবং ডেডিকেটেড হাই-কনফিগারেশন কম্পিউটার রয়েছে। সাঈদ স্যারের সরাসরি তত্ত্বাবধানে আপনি পাবেন প্র্যাক্টিক্যাল ক্যারিয়ার সリューション।
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigateTo("courses")}
                      className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-3 px-6 font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>ভর্তি বুকিং ফর্ম</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateTo("results")}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-6 font-bold text-xs md:text-sm transition-all cursor-pointer"
                    >
                      <span>পরীক্ষার মার্কশীট দেখুন</span>
                    </button>
                  </div>

                  {/* Highlights row */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-left font-mono max-w-sm">
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
                  <StudentShowcase students={students} results={results} isAdmin={isAdmin} />
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
                    পরিচালকের পক্ষ থেকে মোহাম্মদ সাঈদ ও আসাদ স্যারের শুভেচ্ছা বার্তা
                  </h4>
                  <p className="text-slate-650 italic text-xs md:text-sm leading-relaxed">
                    "প্রিয় তরুণ বন্ধুরা, কম্পিউটার শিক্ষা কোনো বিলাসীতা নয় বরং এটি আধুনিক স্বাবলম্বী হওয়ার মূল হাতিয়ার। স্বপ্ন কম্পিউটারে আমরা কোনো জটিলতা ছাড়া অত্যন্ত সহজ ভাষায় চট্টগ্রামের আঞ্চলিক আবেগের সাথে মিশে বাস্তব প্র্যাক্টিক্যাল শিক্ষা প্রদান করি। আপনাদের দক্ষ গড়ে তোলাই আমার একমাত্র স্বপ্ন।"
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold block">মোহাম্মদ সাঈদ • পরিচালক, স্বপ্ন টেকনিক্যাল কম্পিউটার </p>
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

          {activeTab === "notices" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NoticeBoardView
                notices={notices}
                onLike={handleLikeNotice}
                onAddComment={handleAddComment}
              />
            </motion.div>
          )}

          {activeTab === "pdf-sheets" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PdfSheetsView pdfSheets={pdfSheets} />
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AboutContact coachingPhotos={coachingPhotos} />
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
                pdfSheets={pdfSheets}
                onAddPdfSheet={handleAddPdfSheet}
                onDeletePdfSheet={handleDeletePdfSheet}
                coachingPhotos={coachingPhotos}
                onAddCoachingPhoto={handleAddCoachingPhoto}
                onDeleteCoachingPhoto={handleDeleteCoachingPhoto}
                isAdmin={isAdmin}
                onAuthChange={handleAdminAuthChange}
              />
            </motion.div>
          )}
          </AnimatePresence>
        )}
      </main>

      {/* Floating Action/AI Chat Head Widget Stack */}
      <div className="fixed bottom-6 right-6 z-50 no-print flex flex-col gap-3 items-end">
        
        {/* Dynamic Saiyed AI Chat Head with Tooltip */}
        <motion.div 
          className="flex items-center gap-2 group cursor-grab active:cursor-grabbing touch-none select-none"
          drag
          dragElastic={0.15}
          dragMomentum={false}
          initial={{ scale: 0, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Tooltip bubble that pops up on hover */}
          <div className="hidden sm:block bg-slate-950 text-white font-sans text-[11px] font-black py-2 px-3.5 rounded-2xl shadow-xl border border-indigo-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap tracking-wide mr-2 translate-x-3 group-hover:translate-x-0">
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 inline" />
              সাঈদ এআই (Saiyed AI)
            </span>
            <span className="text-indigo-200 mt-0.5 block">চ্যাট ও প্রশ্নের উত্তর পেতে ক্লিক করুন 💬</span>
          </div>

          <a
            href="https://saiyedai.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Saiyed AI ওয়েবসাইট ও এআই চ্যাট করুন"
            className="w-[48px] h-[48px] bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/60 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 ring-2 ring-indigo-500/20 group relative overflow-visible"
          >
            {/* Pulsing ambient glowing ring */}
            <span className="absolute inset-x-0 inset-y-0 rounded-full bg-indigo-500/20 animate-ping opacity-50 pointer-events-none"></span>
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/5 to-amber-500/5 animate-pulse pointer-events-none"></span>

            <div className="relative flex flex-col items-center justify-center text-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
              <span className="text-[5.5px] font-extrabold text-amber-300 tracking-wider mt-0.5 font-mono uppercase leading-none">
                SAIYED
              </span>
              <span className="text-[6.5px] font-black text-indigo-105 mt-[0.5px] leading-none">
                এআই
              </span>
              {/* Active green indicator badge */}
              <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-500 border border-slate-950 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            </div>
          </a>
        </motion.div>
      </div>

      {/* 4. Footer Column */}
      <footer className="bg-slate-900 text-slate-400 text-xs md:text-sm py-8 md:py-12 border-t border-slate-800 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-white">
              <School className="w-5 h-5 text-indigo-500" />
              <strong className="text-sm font-bold">স্বপ্ন কম্পিউটার ট্রেনিং সেন্টার</strong>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              স্বাবলম্বী ক্যারিয়ার গড়ার লক্ষ্যে চট্টগ্রামের হাটহাজারী উপজেলার আমান বাজারে প্রতিষ্ঠিত স্বপ্ন কম্পিউটার প্রশিক্ষণ কেন্দ্র সর্বদা মানসম্মত এবং যুগোপযোগী কম্পিউটার প্রশিক্ষণ দিয়ে আসছে।
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
            <strong className="text-white text-xs block font-bold mb-2">প্রতিষ্ঠানের ঠিকানা</strong>
            <p className="text-xs leading-relaxed text-slate-400">
              আমান বাজার মোড়, কলেজ রোড রোড,<br />
              হাটহাজারী, চট্টগ্রাম।
            </p>
          </div>

        </div>

        {/* Base line licensing */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-left text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} স্বপ্ন কারিগরি কম্পিউটার ট্রেনিং সেন্টার। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-1 font-mono">
            <span>স্থাপিত ২০২৫</span>
            <span>•</span>
            <span className="text-indigo-450 animate-pulse">স্মার্ট বাংলাদেশ অর্জনে সংকল্পবদ্ধ</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
