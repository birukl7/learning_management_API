import exp from "constants";
import {  Content } from '@/types';
import { Course } from './course';
import { Youtube } from 'lucide-react';
import { create } from 'domain';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    permissions: string[]
    avatar: string | null
    bio: string | null
    subscriptionRequests: SubscriptionRequest[]
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
    > = T & {
    auth: {
        user: User;
    };
};


export interface Category {
    id: number;
    course_name: string;
    name: string;
}

export interface Grade {
    id: number;
    grade_name: string;
    category_id: number;
    stream: string;
}

export interface Department {
    id: number;
    department_name: string;
    category_id: number;
    category: Category
    batches: Batch[]
    created_at?: string
    updated_at?: string
}


export interface Batch {
    id: number;
    batch_name: string;
    department_id: number;
}

export interface Chapter{
    estimated_time: ReactNode;
    order: number;
    id: number;
    title: string;
    description?: string;
    course_id: number;
    contents_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Quiz{
    id: number;
    chapter_id: number;
    title: string;
    quiz_questions_count: number;
    exam_duration: number;
    created_at?: string;
    updated_at?: string;
}

export interface QuizQuestion{
    id: number;
    quiz_id: number;
    question_number: number;
    text: string;
    is_multiple_choice: boolean;
    question_image_url: string;
    text_explanation: string;
    image_explanation_url: string;
    video_explanation_url: string;
    options: JSON;
    answer: JSON;
    created_at?: string;
    updated_at?: string;
}

export interface Content{
    contents_count: ReactNode;
    id: number;
    chapter_id: number;
    name: string;
    order: number;
    url: string;
    created_at?: string;
    updated_at?: string;
}

export interface Course{
    id: number;
    course_name: string;
    thumbnail: string;
    category_id: number;
    grade_id: number;
    department_id: number;
    batch_id: number;
    number_of_chapters: number;
    saves: number;
    likes: number;
    price_one_month: number;
    price_three_month: number;
    price_six_month: number;
    price_one_year: number;
    created_at?: string;
    updated_at?: string;
}

export interface IndexProps {
    auth: any;
    courses: {
      meta: any;
      data: Course[]
      links: Array<{
        url: string | null;
        active: boolean;
        label: string;
      }>;
    };
    categories: Array<{ id: number; name: string; course_name: string }>;
    grades: Array<{ id: number; grade_name: string; category_id: number; stream: string }>;
    departments: Array<{ id: number; department_name: string; category_id: number }>;
    batches: Array<{ id: number; batch_name: string; department_id: number }>;
    filters: {
      category: string;
      search: string;
      sort: string
    };
    canAdd: boolean
    session: string
  }

export interface Content{
    id: number;
    chapter_id: number;
    name: string;
    order: number;
    created_at?: string;
    updated_at?: string;
}

export interface YoutubeContent{
    id: number;
    content_id: number;
    title: string;
    url: string;
    youtube_number: number
    created_at?: string;
    updated_at?: string;
}

export interface TextContent{
    id: number;
    content_id: number;
    title: string;
    description: string;
    created_at?: string;
    updated_at?: string;
}

export interface FileContent{
    id: number;
    content_id: number;
    title: string;
    file_url: string;
    file_number: number
    created_at?: string;
    updated_at?: string;
}

export interface ExamCourse{
    id: number;
    stream: null | 'natural' | 'social',
    exam_year_id: number;
    exam_type_id: number;
    exam_grade_id: number;

    // exam_chapters:{
    //     title: string,
    //     sequence_order: number
    // }[]
    exam_grade: ExamGrade
    exam_type: ExamType
    course_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ExamChapter{
    id: number;
    exam_grade_id: number;
    title: string;
    sequence_order: number;
    created_at: string;
    updated_at: string;
}

export interface ExamYear{
    id: number;
    exam_type_id: number;
    year: string|number;
    created_at?: string;
    updated_at?: string;
}

export interface ExamQuestion{
    exam_id: any
    exam_type_id: any;
    exam_grade_id: any;
    text_explanation: string;
    id:number
    exam_course_id: number
    exam_chapter_id:number
    exam_year_id: number
    question_text: string
    video_explanation_url: string
    question_image_url: string | null,
    image_explanation_url: string | null,
    options: string
    answer: string
    created_at?: string;
    updated_at?: string;
}


export interface ExamType{
    id:number
    name: string
    total_exam_courses: number;
    total_exam_questions: number;
    total_exams: number;
    total_users: number;
    total_years: number;
    created_at?: string;
    updated_at?: string;
}

export interface ExamGrade{
    id: number
    grade: number
    stream: string
    exam_year_id: number
    created_at?: string;
    updated_at?: string;
    exam_chapters: ExamChapter[]
}

export interface CarouselContent{
    id: number
    tag: string,
    image_url: string
    status: "active" | "not-active"
    order: number
    created_by: number
    updated_by: number
    created_at?: string;
    updated_at?: string;
}

export interface SubscriptionRequest{
        id: number
        user: { name: string, email?: string}
        courses: {id: number, name: string}[],
        exams: {
            id: number, 
            exam_type: string,
            exam_course: string}[] | null
            exam_year: ExamYear | null
            total_price: number
            proof_of_payment: string
            subscription_type: string
            transaction_id: string
            status: 'Pending' | 'Approved' | 'Rejected'
            subscriptions?: Subscription[]
            created_at?: string;
            updated_at?: string;
}

export interface Subscription{
        // subscription_type: ReactNode;
   
        id: number
        subscription_request: {
            id: number
            user: { name: string, email: string}
            courses: {name: string}[] | null
            exams: {name: string}[] | null
            total_price: number
            proof_of_payment: string
            status: 'Pending' | 'Approved' | 'Rejected'
            created_at?: string;
            updated_at?: string;
            subscription_type: string;
        }
        subscription_start_date: string
        subscription_end_date: string
        status: string;
        created_at?: string;
        updated_at?: string;
}

export interface Exam {
    id: number
    exam_duration: number
    exam_type_id: number
    exam_year_id: number
    exam_course_id: number | null
    price_one_month: number
    price_three_month: number
    price_six_month: number
    price_one_year: number
    on_sale_one_month: number
    on_sale_three_month: number
    on_sale_six_month: number
    on_sale_one_year: number
    stream: string | null
    created_at?: string
    updated_at?: string
    // Relationships
    exam_course?: ExamCourse | null
    exam_year?: ExamYear
    exam_type?: ExamType
  }


  export interface PaidCourse{
    id: number
    expired: number 
    user: User
    course_price: number
    subscriptionRequest: SubscriptionRequest
    created_at: string 
    updated_at: string 
  }

  export interface PaidExam{
    id: number
    expired: number 
    user: User
    exam_price: number
    subscriptionRequest: SubscriptionRequest
    created_at: string 
    updated_at: string 
  }