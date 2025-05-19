<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'quiz_duration' => (int)$this->exam_duration,
            'number_of_questions' => $this->quizQuestions->count(),
            'questions' => $this->quizQuestions->map(fn($question) => [
                'id' => $question->id,
                'quiz_id' => (int)$question->quiz_id,
                'question_number' => (int)$question->question_number,
                'text' => $question->text,
                'is_multiple_choice' => $question->is_multiple_choice,
                'question_image_url' => $question->question_image_url ? url($question->question_image_url) : null,
                'text_explanation' => $question->text_explanation,
                'image_explanation_url' => $question->image_explanation_url? url($question->image_explanation_url) : null,
                'video_explanation_url' => $question->video_explanation_url,
                'options' => json_decode($question->options, true),
                'answer' => json_decode($question->answer, true),
                'created_at' => $question->created_at,
                'updated_at' => $question->updated_at,
            ])->toArray(),
        ];
    }
}
