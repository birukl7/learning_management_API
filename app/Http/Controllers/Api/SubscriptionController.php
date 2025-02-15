<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Jobs\SendSubscriptionNotificationJob;
use App\Models\Course;
use App\Models\PaidCourse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    
     public function store(Request $request)
     {
         $attrs = Validator::make($request->all(), [
             'courses' => 'required|array|min:1',
             'exam_courses' => 'nullable|array',
             'screenshot' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
             'subscription_type' => 'required|in:oneMonth,threeMonths,sixMonths,yearly',
             'transaction_id' => 'required',
         ]);
     
         if ($attrs->fails()) {
             return response()->json([
                 'status' => false,
                 'message' => 'Validation Error',
                 'errors' => $attrs->errors()
             ], 422);
         }
     
         $validatedData = $attrs->validated();
     
         try {
             DB::beginTransaction();
     
             if ($request->hasFile('screenshot')) {
                 $file = $request->file('screenshot');
                 $fileName = time() . '_' . $file->getClientOriginalName();
                 $path = $file->storeAs('proof_of_payment', $fileName, 'public');
                 $validatedData['proof_of_payment'] = 'storage/' . $path;
             }
     
             $totalPrice = 0;
     
             foreach ($validatedData['courses'] as $courseId) {
                 $course = Course::findOrFail($courseId);
                 $priceColumn = $this->getPriceColumnBySubscriptionType($validatedData['subscription_type']);
                 if ($priceColumn) {
                     $onSaleColumn = str_replace('price_', 'on_sale_', $priceColumn);
                     $price = $course->$onSaleColumn ?? $course->$priceColumn;
                     $totalPrice += $price;
                 }
             }
     
             $subscriptionRequest = $request->user()->subscriptionRequests()->create([
                 'total_price' => $totalPrice,
                 'status' => 'Pending',
                 'proof_of_payment' => $validatedData['proof_of_payment'],
                 'transaction_id' => $validatedData['transaction_id'],
                 'subscription_type' => $validatedData['subscription_type'],
             ]);
     
             $subscriptionRequest->courses()->attach($validatedData['courses']);
     
             foreach ($validatedData['courses'] as $courseId) {
                 PaidCourse::create([
                     'user_id' => $request->user()->id,
                     'course_id' => $courseId,
                 ]);
             }
     
             $superAdmins = User::role('admin')->get();
             $workers = User::role('worker')->get();
             
             DB::commit();
     
             // Dispatch job after successful commit
             dispatch(new SendSubscriptionNotificationJob($subscriptionRequest, $superAdmins, $workers, $request->user()));
     
             return response()->json([
                 'status' => true,
                 'message' => 'Subscription request created successfully',
                 'total_price' => $totalPrice,
             ], 201);
     
         } catch (\Exception $e) {
             DB::rollBack();
             Log::error('Subscription request creation failed: ' . $e->getMessage());
     
             return response()->json([
                 'status' => false,
                 'message' => 'An error occurred while processing your request. Please try again later.',
             ], 500);
         }
     }


     private function getPriceColumnBySubscriptionType($subscriptionType)
     {
         $mapping = [
             'oneMonth' => 'price_one_month',
             'threeMonths' => 'price_three_month',
             'sixMonths' => 'price_six_month',
             'yearly' => 'price_one_year',
         ];

         return $mapping[$subscriptionType] ?? null;
     }
    
    

    /**
     * Display the specified resource.
     */
    public function show(SubscriptionRequest $subscriptionRequest)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SubscriptionRequest $subscriptionRequest)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubscriptionRequest $subscriptionRequest)
    {
        //
    }

    public function approve(Request $request, SubscriptionRequest $subscriptionRequest)
    {
        $subscriptionRequest->update([
            'status' => 'approved',
        ]);

        $subscriptionRequest->subscription->create([
            'user_id' => $subscriptionRequest->user_id,
            'course_id' => $subscriptionRequest->course_id,
            'exam_course_id' => $subscriptionRequest->exam_course_id,
            'total_price' => $subscriptionRequest->total_price,
        ]);

        return response()->json([
            'message' => 'Subscription request approved successfully',
        ]);
    }

    public function reject(Request $request, SubscriptionRequest $subscriptionRequest)
    {
        $subscriptionRequest->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Subscription request rejected successfully',
        ]);
    }
}
