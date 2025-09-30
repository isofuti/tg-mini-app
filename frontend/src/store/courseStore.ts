import { create } from 'zustand';
import { api } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description?: string;
  courseType: string;
  status: string;
  isDemo: boolean;
  completedLessons?: number;
  totalLessons?: number;
  createdAt: string;
}

interface Theme {
  id: string;
  themeNumber: number;
  title: string;
  description?: string;
  lessonsCount: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  content?: string;
  lessonType: string;
  isGenerated: boolean;
  isCompleted?: boolean;
}

interface CourseState {
  courses: Course[];
  currentCourse: (Course & { themes?: Theme[] }) | null;
  currentLesson: Lesson | null;
  isLoading: boolean;
  
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Promise<void>;
  fetchLesson: (id: string) => Promise<void>;
  completeLesson: (id: string) => Promise<number>;
  createCourse: (data: any) => Promise<Course>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  currentLesson: null,
  isLoading: false,

  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getCourses();
      set({ courses: response.courses, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      set({ isLoading: false });
    }
  },

  fetchCourse: async (id: string) => {
    set({ isLoading: true });
    try {
      const course = await api.getCourse(id);
      set({ currentCourse: course, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch course:', error);
      set({ isLoading: false });
    }
  },

  fetchLesson: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await api.getLesson(id);
      set({ currentLesson: response.lesson, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      set({ isLoading: false });
    }
  },

  completeLesson: async (id: string) => {
    try {
      const response = await api.completeLesson(id);
      
      // Update lesson as completed
      set((state) => ({
        currentLesson: state.currentLesson
          ? { ...state.currentLesson, isCompleted: true }
          : null,
      }));
      
      return response.points || 0;
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  },

  createCourse: async (data: any) => {
    try {
      const response = await api.createCourse(data);
      
      // Refresh courses list
      await get().fetchCourses();
      
      return response.course;
    } catch (error) {
      console.error('Failed to create course:', error);
      throw error;
    }
  },
}));
