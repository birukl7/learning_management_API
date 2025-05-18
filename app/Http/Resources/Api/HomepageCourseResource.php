<?php

namespace App\Http\Resources\Api;


use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class HomepageCourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user(); // Get the current user

        $subscriptionStatus = null;

        // dd($user);

        if ($user && $this->relationLoaded('subscriptionRequests')) {

            // Get the first subscription request linked to this course (if any)
            $userId = $user->id;

            $userSubscriptionRequest = $this->subscriptionRequests
            ->filter(function ($sr) use ($userId) {
                return $sr->user_id === $userId;
            })
            ->first();

            // dd($userSubscriptionRequest);

            
            if ($userSubscriptionRequest && $userSubscriptionRequest->relationLoaded('subscriptions')) {
                $userSubscription = $userSubscriptionRequest->subscriptions->first();
                $subscriptionStatus = $userSubscription ? $userSubscription->status : null;
            }
        }

        return [
            'id' => $this->id,
            'course_name' => $this->course_name,
            'thumbnail' => $this->getThumbnailUrl(),
            'price_one_month' => $this->price_one_month,
            'on_sale_one_month' => $this->on_sale_one_month,
            'price_three_month' => $this->price_three_month,
            'on_sale_three_month' => $this->on_sale_three_month,
            'price_six_month' => $this->price_six_month,
            'on_sale_six_month' => $this->on_sale_six_month,
            'price_one_year' => $this->price_one_year,
            'on_sale_one_year' => $this->on_sale_one_year,
            'likes_count' => (int) $this->likes_count,
            'saves_count' => (int)$this->saves_count,
            'chapter_count' => (int)$this->chapters->count(),
            'stream' => $this->stream ? $this->stream : null,
            'batch' => $this->batch ? [
                'id' => $this->batch->id,
                'batch_name' => $this->batch->batch_name,
            ] : null,
            'grade' => $this->grade ? [
                'id' => $this->grade->id,
                'grade_name' => $this->grade->grade_name,
            ] : null,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ] : null,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ] : null,
            'is_liked' => $user ? $this->isLikedByUser($user->id) : false,
            'is_saved' => $user ? $this->isSavedByUser($user->id) : false,
            'is_paid' => $user ? $this->isPaidByUser($user->id) : false,

            // 'subscription_status' => $user ? $subscriptionStatus : null,
        ];
    }

    /**
     * Get the complete thumbnail URL.
     *
     * @return string
     */
    protected function getThumbnailUrl(): string
    {
        // Check if the thumbnail starts with "/id", append the base URL if true
        return $this->thumbnail && strpos($this->thumbnail, '/id') === 0
            ? 'https://picsum.photos' . $this->thumbnail
            : url(Storage::url($this->thumbnail));
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
     * Check if the course is paid by a specific user.
     *
     * @param int $userId
     * @return bool
     */

    protected function isPaidByUser(int $userId): bool
    {
        return $this->paidCourses()->where('user_id', $userId)->where('expired', false)->exists();
    }
}
