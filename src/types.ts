export interface Student {
  roll: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob?: string;
  mobile: string;
  address: string;
  course: string;
  pin: string;
  regDate?: string;
  pictureUrl?: string;
  order?: number;
}

export interface NoticeComment {
  id: string;
  authorName: string;
  text: string;
  date: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  likesCount: number;
  comments: NoticeComment[];
  likedByUser?: boolean;
}

export interface ModelTestResult {
  roll: string;
  name: string;
  course: string;
  examType?: "model_test" | "final_exam";
  mcqMarks: number;     // out of 50
  practicalMarks: number; // out of 40
  vivaMarks: number;      // out of 10
  total: number;          // out of 100
  gpaPoint: number;       // e.g., 5.0, 4.0, 3.5 etc
  gpaGrade: string;       // e.g., A+, A, A-, B, F
  remarks: string;        // custom feedback
  pdfUrl?: string;        // Optional uploaded PDF result link or board certificate path
}

export interface Course {
  id: string;
  title: string;
  bengliTitle: string;
  duration: string;
  fee: number;
  icon: string;
  skillsCovered: string[];
  schedule: string;
}

export interface VisitorMessage {
  id: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  mobile: string;
  courseOfInterest: string;
  message: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderRoll: string;
  senderName: string;
  receiverRoll: string; // "group" for common chat, or other student roll for DM
  text: string;
  timestamp: number;
}

export interface PdfSheet {
  id: string;
  title: string;
  course: string;
  downloadUrl: string;
  pdfUrl?: string;
  uploader?: string;
  date: string;
  uploadDate?: string;
  fileSize?: string;
}

export interface CoachingPhoto {
  id: string;
  title: string;
  url: string;
  pictureUrl?: string;
  date: string;
  uploadDate?: string;
  description?: string;
}

