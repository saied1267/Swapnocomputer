import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  School, Monitor, Award, BookOpen, Clock, Heart, Users, ShieldCheck, 
  MapPin, Phone, MessageSquare, Menu, X, ArrowRight, UserCheck, Flame, Cpu, Headphones,
  Brain, Sparkles, RefreshCw, Smartphone
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
  const [activeTab, setActiveTab] = useState<"home" | "courses" | "results" | "about" | "admin" | "notices" | "pdf-sheets">(() => {
    const hash = window.location.hash.replace("#", "");
    if (["home", "courses", "results", "about", "admin", "notices", "pdf-sheets"].includes(hash)) {
      return hash as any;
    }
    return "home";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["home", "courses", "results", "about", "admin", "notices", "pdf-sheets"].includes(hash)) {
        setActiveTab(hash as any);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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

        // Safer background seeding: Only if the collection is truly very small (initial setup phase)
        // and we are NOT in an error state. 
        if (!isOffline && cloudStudents.length === 0) {
          console.info("Seeding initial students to cloud...");
          INITIAL_STUDENTS.forEach(s => setDoc(doc(db, "students", s.roll), s));
        }
        if (!isOffline && cloudResults.length === 0) {
          console.info("Seeding initial results to cloud...");
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

  const handleUpdateStudent = async (updatedStudent: Student, oldRoll?: string) => {
    const updateStudentLocally = () => {
      setStudents((prev) => {
        const targetRoll = oldRoll || updatedStudent.roll;
        const next = prev.map((s) => (s.roll === targetRoll ? updatedStudent : s));
        localStorage.setItem("swapno_students", JSON.stringify(next));
        return next;
      });
      if (oldRoll && oldRoll !== updatedStudent.roll) {
        setResults((prev) => {
          const next = prev.map(r => r.roll === oldRoll ? { ...r, roll: updatedStudent.roll } : r);
          localStorage.setItem("swapno_results", JSON.stringify(next));
          return next;
        });
      }
    };

    if (usingFallbackLocalStorage) {
      updateStudentLocally();
      return;
    }

    try {
      if (oldRoll && oldRoll !== updatedStudent.roll) {
        // Roll changed: Delete old doc, create new one
        await deleteDoc(doc(db, "students", oldRoll));
        // Also update linked results if any
        const resultDoc = doc(db, "results", oldRoll);
        try {
          const resSnap = await getDocs(collection(db, "results"));
          const matched = resSnap.docs.find(d => d.id === oldRoll);
          if (matched) {
            await setDoc(doc(db, "results", updatedStudent.roll), { ...matched.data(), roll: updatedStudent.roll });
            await deleteDoc(doc(db, "results", oldRoll));
          }
        } catch (e) {
          console.warn("Failed to migrate results for roll change", e);
        }
      }
      await setDoc(doc(db, "students", updatedStudent.roll), updatedStudent);
      setStudents((prev) => {
        const targetRoll = oldRoll || updatedStudent.roll;
        return prev.map((s) => (s.roll === targetRoll ? updatedStudent : s));
      });
      if (oldRoll && oldRoll !== updatedStudent.roll) {
        setResults(prev => prev.map(r => r.roll === oldRoll ? { ...r, roll: updatedStudent.roll } : r));
      }
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
    window.location.hash = tab;
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden overflow-y-auto bg-slate-50 flex flex-col justify-between antialiased">
      
      {/* Fixed Saiyed AI Round Floating Widget - Lower Side Positioned */}
      <div className="fixed right-3 bottom-28 z-[100] no-print">
        <motion.div 
          className="flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing touch-none select-none"
          drag
          dragElastic={0.2}
          dragMomentum={false}
          initial={{ scale: 0, opacity: 0, x: 50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <a
            href="https://saiyedai.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Saiyed AI - সাঈদ এআই"
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.3)] flex flex-col items-center justify-center hover:scale-110 hover:border-amber-400/60 active:scale-95 transition-all duration-300 group overflow-visible relative"
          >
            {/* Outer pulse effect */}
            <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-75 pointer-events-none"></span>
            
            <div className="flex flex-col items-center justify-center -mt-0.5">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span className="text-[5px] md:text-[7px] font-black text-amber-100 uppercase tracking-tighter mt-0.5 font-mono">SAIYED</span>
              <span className="text-[6px] md:text-[8px] font-black text-indigo-100 leading-none">AI</span>
            </div>

            {/* Status indicator */}
            <div className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse shadow-sm"></div>
          </a>
        </motion.div>
      </div>

            {/* 2. Primary Navigation Bar */}
            <header className="bg-white border-b border-slate-150 shadow-sm sticky top-0 z-40 no-print py-3 sm:py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                
                <div className="flex flex-col sm:flex-row items-start justify-start w-full gap-4 mt-4 md:mt-2">
              <div 
                onClick={() => navigateTo("home")} 
                className="flex items-center gap-3 md:gap-4 cursor-pointer group select-none"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-tr from-indigo-700 to-violet-700 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                  <School className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div className="text-left leading-tight shrink-0">
                  <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    <span>স্বপ্ন কারিগরি কম্পিউটার</span> 
                    <span className="text-slate-600">প্রশিক্ষন কেন্দ্র</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Row 2: Sub-Navigation Menu (underneath logo heading) */}
            <div className="w-full border-t border-slate-100 mt-3 pt-2 md:pt-4 overflow-hidden">
              <nav className="flex items-center justify-between sm:justify-start gap-0.5 sm:gap-2 w-full px-0.5 py-1">
                {[
                  { id: "home", label: "হোম", icon: <School className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                  { id: "courses", label: "ভর্তি", icon: <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                  { id: "results", label: "ফলাফল", icon: <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                  { id: "notices", label: "নোটিশ", icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                  { id: "pdf-sheets", label: "লেকচার শিট", icon: <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                  { id: "about", label: "ল্যাব", icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                  { id: "admin", label: "এডমিন", icon: <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                ].filter(tab => tab.id !== "admin" || (typeof window !== "undefined" && window.location.hash === "#admin")).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigateTo(tab.id as any)}
                    className={`flex-1 sm:flex-none px-1 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                      activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-sm sm:shadow-md shadow-indigo-100"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab.icon}
                    <span className="leading-none sm:leading-normal">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
          </div>
        </header>

      {/* 3. Main Stage Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-start py-8 md:py-12 gap-3 text-center min-h-[300px]">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mt-4" />
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800">সাঈদ এআই ডাটাবেজ এর সাথে সংযোগ স্থাপন করা হচ্ছে...</p>
              <p className="text-[11px] text-indigo-600 font-black uppercase tracking-widest">সাঈদ এআই থেকে ডাটাবেজ লোড হচ্ছে...</p>
            </div>
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
                    <span>Swapno Computer Academy • আমান বাজার শাখা</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    কম্পিউটার শিখুন, <br />
                    <span className="text-indigo-600 relative inline-block">
                      স্বপ্ন জয়
                    </span> করুন।
                  </h2>
                  <p className="text-slate-650 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
                    স্বপ্ন কারিগরি কম্পিউটার প্রশিক্ষন কেন্দ্রে সম্পূর্ণ কোলাহলমুক্ত নিরিবিলি পরিবেশে আপনি পাচ্ছেন প্রফেশনাল কোর্স সুবিধা। আমাদের ল্যাবে লার্জ মাল্টিমিডিয়া স্ক্রিন এবং ডেডিকেটেড হাই-কনফিগারেশন কম্পিউটার রয়েছে। মোহাম্মদ সাঈদ স্যারের সরাসরি তত্ত্বাবধানে আপনি পাবেন প্র্যাক্টিক্যাল ক্যারিয়ার সলিউশন।
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigateTo("courses")}
                      className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white rounded-xl py-3.5 px-7 font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-indigo-100"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>ভর্তি বুকিং ফর্ম</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a 
                      href="tel:01941652097"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 px-7 font-black text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-50"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-100" />
                      <span>কল করুন: ০১৯৪ ১৬৫২০৯৭</span>
                    </a>
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

                {/* Registered Student Portrait Showcase (Right part, 5 out of 12 columns) - Removed duplicate as it is now at the top of the page */}
                <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-slate-100 shadow-3xs flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-indigo-100">
                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">স্মার্ট লার্নিং ইকোসিস্টেম</h4>
                    <p className="text-[11px] text-slate-500 mt-1">সাঈদ স্যারের সাথে প্রযুক্তি শিখুন এবং আপনার ক্যারিয়ার সফল করুন। আমান বাজারের সবচেয়ে বিশ্বস্ত একাডেমি।</p>
                  </div>
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
                    "প্রিয় তরুণ বন্ধুরা, কম্পিউটার শিক্ষা কোনো বিলাসীতা নয় বরং এটি আধুনিক স্বাবলম্বী হওয়ার মূল হাতিয়ার। স্বপ্ন কারিগরি কম্পিউটার প্রশিক্ষন কেন্দ্রে আমরা কোনো জটিলতা ছাড়া অত্যন্ত সহজ ভাষায় চট্টগ্রামের আঞ্চলিক আবেগের সাথে মিশে বাস্তব প্র্যাক্টিক্যাল শিক্ষা প্রদান করি। আপনাদের দক্ষ গড়ে তোলাই আমার একমাত্র স্বপ্ন।"
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold block">মোহাম্মদ সাঈদ • পরিচালক, স্বপ্ন কারিগরি কম্পিউটার প্রশিক্ষন কেন্দ্র (স্থাপিত ২০২৫)</p>
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

      {/* Saiyed AI Widget moved to Top */}

      {/* 4. Footer Column */}
      <footer className="bg-slate-900 text-slate-400 text-xs md:text-sm py-8 md:py-12 border-t border-slate-800 mt-12 no-print pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-white">
              <School className="w-5 h-5 text-indigo-500" />
              <strong className="text-sm font-bold">স্বপ্ন কারিগরি কম্পিউটার ট্রেনিং</strong>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              স্বাবলম্বী ক্যারিয়ার গড়ার লক্ষ্যে চট্টগ্রামের আমান বাজারে প্রতিষ্ঠিত স্বপ্ন কারিগরি কম্পিউটার প্রশিক্ষন কেন্দ্র সর্বদা মানসম্মত এবং যুগোপযোগী কম্পিউটার প্রশিক্ষণ দিয়ে আসছে।
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
            </div>
          </div>

          <div className="space-y-3 text-left">
            <strong className="text-white text-xs block font-bold mb-2">প্রতিষ্ঠানের ঠিকানা</strong>
            <p className="text-xs leading-relaxed text-slate-400">
              হাজি ইব্রাহিম মার্কেট ২য় তলা, কলেজ রোড,<br />
              আমান বাজার, হাটহাজারি, চট্টগ্রাম।
            </p>
          </div>

        </div>

        {/* Base line licensing */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-left text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} স্বপ্ন কারিগরি কম্পিউটার প্রশিক্ষন কেন্দ্র। সর্বস্বত্ব সংরক্ষিত।</p>
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
