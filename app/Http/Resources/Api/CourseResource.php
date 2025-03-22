<?php 

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        // Find the user's subscription for the current course
        $userSubscription = $this->subscriptionRequests->first()->subscriptions->first();

        // dd($userSubscription->course->subscriptionRequests);
        $subscriptionStatus = $userSubscription ? $userSubscription->status : 'inactive';

        return [
            'id' => $this->id,
            'course_name' => $this->course_name,
            
            // Modify the thumbnail logic to append the prefix only if the string starts with "/id"
            'thumbnail' => $this->thumbnail && str_starts_with($this->thumbnail, '/id')
                ? 'https://picsum.photos' . $this->thumbnail
                : $this->thumbnail,

            // Include category, department, and grade when loaded
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'department_name' => $this->department->department_name,
                ];
            }),
            'grade' => $this->whenLoaded('grade', function () {
                return [
                    'id' => $this->grade->id,
                    'grade_name' => $this->grade->grade_name,
                    'stream' => $this->grade->stream,
                ];
            }),

            // Include chapters and count the number of chapters
            'chapters' => $this->whenLoaded('chapters', function () {
                return $this->chapters->map(function ($chapter) {
                    return [
                        'id' => $chapter->id,
                        'title' => $chapter->title,
                    ];
                });
            }),
            'chapter_count' => $this->chapters ? $this->chapters->count() : 0, // Count of chapters

            'batch' => $this->whenLoaded('batch', function () {
                return [
                    'id' => $this->batch->id,
                    'batch_name' => $this->batch->batch_name,
                ];
            }),

            'price_one_month' => $this->price_one_month,
            'on_sale_month' => $this->on_sale_month,
            'price_three_month' => $this->price_three_month,
            'on_sale_three_month' => $this->on_sale_three_month,
            'price_six_month' => $this->price_six_month,
            'on_sale_six_month' => $this->on_sale_six_month,
            'price_one_year' => $this->price_one_year,
            'on_sale_one_year' => $this->on_sale_one_year,

            // Include whether the course is paid, saved, or liked by the current user
            'paid' => $user ? $this->isPaidByUser($user->id) : false,
            'saved' => $user ? $this->isSavedByUser($user->id) : false,
            'liked' => $user ? $this->isLikedByUser($user->id) : false,

            // Add likes_count and saves_count
            'likes_count' => $this->likes()->count(),
            'saves_count' => $this->saves()->count(),

            // Include the subscription status
            'subscription_status' => $subscriptionStatus,
        ];
    }

    /**
     * Check if the course is paid by a specific user.
     *
     * @param int $userId
     * @return bool
     */
    protected function isPaidByUser(int $userId): bool
    {
        return $this->paidCourses()->where('user_id', $userId)->exists();
    }

    /**
     * Check if the course is saved by a specific user.
     *
     * @param int $userId
     * @return bool
     */
    protected function isSavedByUser(int $userId): bool
    {
        return $this->saves()->where('user_id', $userId)->exists();
    }

    /**
     * Check if the course is liked by a specific user.
     *
     * @param int $userId
     * @return bool
     */
    protected function isLikedByUser(int $userId): bool
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }
}
