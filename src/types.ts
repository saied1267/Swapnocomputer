export interface Student {
  roll: string;
  name: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  address: string;
  course: string;
  pin: string;
  regDate?: string;
  pictureUrl?: string;
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
  mcqMarks: number;     // out of 50
  practicalMarks: number; // out of 40
  vivaMarks: number;      // out of 10
  total: number;          // out of 100
  gpaPoint: number;       // e.g., 5.0, 4.0, 3.5 etc
  gpaGrade: string;       // e.g., A+, A, A-, B, F
  remarks: string;        // custom feedback
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
  mobile: string;
  courseOfInterest: string;
  message: string;
  date: string;
}
