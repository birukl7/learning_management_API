<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamCourse;
use App\Models\ExamGrade;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExamDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function show(Request $request, string $id)
    {
        $query = ExamQuestion::query();
        $exam = Exam::with([
            'examType',
            'examCourse',
            'examYear',
        ])->findOrFail($id);

        $exam_chapters = ExamCourse::findOrFail($exam->exam_course_id)->examChapters;

        $query->where('exam_id', $exam->id);

        if ($request->filled(key: 'search')) {
            $query->where('question_text', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('examChapter')) {
            $query->where('exam_chapter_id', $request->input('examChapter'));
        }

        if ($request->filled('examGrade')) {
            $query->where('exam_grade_id', $request->input('examGrade'));
        }

        $exam_questions = $query->orderBy('created_at', 'desc')->paginate(perPage: 30);

        $paidExams = $exam->paidExams()->with('user')->get();

        $paidExamsWithSubscriptions = $paidExams->map(function ($paidExam) use ($exam) {
            $subscriptionRequest = $paidExam->user
                ->subscriptionRequests()
                ->whereHas('exams', fn($q) => $q->where('exams.id', $exam->id))
                ->with('subscriptions')
                ->latest()
                ->first(); // or ->first() if only one expected
        
            return [
                'id' => $paidExam->id,
                'expired' => (int)$paidExam->expired,
                'user' => $paidExam->user,
                'exam_price' => $paidExam->exam_price,
                'subscriptionRequest' => $subscriptionRequest,
                'created_at' => $paidExam->created_at
            ];
        });


        return Inertia::render('Exam-Detail/Index', [
            'exam' => $exam,
            'filters' => $request->only(['search','examChapter', 'examGrade']),
            'exam_chapters' => $exam_chapters,
            'exam_questions' => $exam_questions,
            'exam_grades' => ExamGrade::all(),
            'paidExams' => $paidExamsWithSubscriptions,
            'canAddExamQuestions' => Auth::user()->hasDirectPermission('add exam questions'),
            'canUpdateExamQuestions' => Auth::user()->hasDirectPermission('update exam questions'),
            'canDeleteExamQuestions' => Auth::user()->hasDirectPermission('delete exam questions'),
        ]);
    }
   

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
