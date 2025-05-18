<?php 

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
        $subscriptionStatus = null;

        // dd(vars: $user->subscriptionRequests);

        if ($user && $this->relationLoaded('subscriptionRequests')) {

            // Get the first subscription request linked to this course (if any)

            $userId = $user->id;

            $userSubscriptionRequest = $this->subscriptionRequests
            ->filter(function ($sr) use ($userId) {
                return $sr->user_id === $userId;
            })
            ->sortByDesc('created_at')->first();

            // dd($userSubscriptionRequest);

            
            if ($userSubscriptionRequest && $userSubscriptionRequest->relationLoaded('subscriptions')) {
                $userSubscription = $userSubscriptionRequest->subscriptions->first();
                $subscriptionStatus = $userSubscription ? $userSubscription->status : null;
            }
        }

        return [
            'id' => (int) $this->id,
            'course_name' => $this->course_name,
            'thumbnail' => $this->thumbnail && str_starts_with($this->thumbnail, '/id')
                ? 'https://picsum.photos' . $this->thumbnail
                : url(Storage::url($this->thumbnail)),
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
            'chapter_count' => $this->relationLoaded('chapters') ? (int)$this->chapters->count() : 0,

            'batch' => $this->whenLoaded('batch', function () {
                return [
                    'id' => $this->batch->id,
                    'batch_name' => $this->batch->batch_name,
                ];
            }),
            'stream' => $this->stream ? $this->stream : null,
            'price_one_month' => $this->price_one_month,
            'on_sale_month' => $this->on_sale_month,
            'price_three_month' => $this->price_three_month,
            'on_sale_three_month' => $this->on_sale_three_month,
            'price_six_month' => $this->price_six_month,
            'on_sale_six_month' => $this->on_sale_six_month,
            'price_one_year' => $this->price_one_year,
            'on_sale_one_year' => $this->on_sale_one_year,

            // Include whether the course is paid, saved, or liked by the current user
            'is_paid' => $user ? $this->isPaidByUser($user->id) : false,
            'is_saved' => $user ? $this->isSavedByUser($user->id) : false,
            'is_liked' => $user ? $this->isLikedByUser($user->id) : false,

            // Add likes_count and saves_count
            'likes_count' => (int) $this->likes()->count(),
            'saves_count' => (int) $this->saves()->count(),

            // Include the subscription status only if a user is authenticated
            'subscription_status' => $user ? $subscriptionStatus : null,
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
        return $this->paidCourses()->where('user_id', $userId)->where('expired', false)->exists();
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
