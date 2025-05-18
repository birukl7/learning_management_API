<?php

namespace App\Http\Resources\Api;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamCourseTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        // Ensure $this is a collection
        $exams = collect($this->resource);
        $firstExam = $exams->first();

        return [
            'id' => $firstExam->examCourse->id,
            'course_name' => optional($firstExam->examCourse)->course_name,
            'exam_years' => $this->getGroupedExamYears($exams, $user),
        ];
    }

    private function getGroupedExamYears($exams, User $user): array
    {
        return $exams
            ->groupBy('exam_year_id')
            ->map(function ($exams, $yearId) use ($user) {
                $firstExam = $exams->first();

                if (!$firstExam) {
                    return [
                        'id' => $yearId,
                        'year_name' => null,
                        'exam_questions_count' => 0,
                        'exam_sheet_id' => null,
                        'exam_duration' => null,
                        'price_one_month' => null,
                        'price_three_month' => null,
                        'price_six_month' => null,
                        'price_one_year' => null,
                        'on_sale_one_month' => null,
                        'on_sale_three_month' => null,
                        'on_sale_six_month' => null,
                        'on_sale_one_year' => null,
                        'is_paid' => false,
                        'subscription_status' => null,
                        'is_pending' => false,
                        'is_approved' => false,
                        'is_rejected' => false,
                    ];
                }

                $isPaid = $firstExam->paidExams()->where('user_id', $user->id)->exists();
                $subscription = $firstExam->subscriptionRequests()->where('user_id', $user->id)->latest()->first();
                $subscriptionStatus = $subscription?->status;

                return [
                    'id' => $yearId,
                    'year_name' => optional($firstExam->examYear)->year,
                    'exam_questions_count' => $exams->sum(fn ($exam) => $exam->examQuestions->count()),
                    'exam_sheet_id' => (int) $firstExam->id,
                    'exam_duration' => (int)$firstExam->exam_duration,
                    'price_one_month' => $firstExam->price_one_month,
                    'price_three_month' => $firstExam->price_three_month,
                    'price_six_month' => $firstExam->price_six_month,
                    'price_one_year' => $firstExam->price_one_year,
                    'on_sale_one_month' => $firstExam->on_sale_one_month,
                    'on_sale_three_month' => $firstExam->on_sale_three_month,
                    'on_sale_six_month' => $firstExam->on_sale_six_month,
                    'on_sale_one_year' => $firstExam->on_sale_one_year,
                    'is_paid' => $isPaid,
                    'subscription_status' => $subscriptionStatus,
                    'is_pending' => $subscriptionStatus === 'Pending',
                    'is_approved' => $subscriptionStatus === 'Approved',
                    'is_rejected' => $subscriptionStatus === 'Rejected',
                ];
            })
            ->values()
            ->all();
    }
}
