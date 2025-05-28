<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\SubscriptionRequestResource;
use App\Http\Resources\Web\SubscriptionResource;
use App\Jobs\SendSubscriptionApproveJob;
use App\Jobs\SubscriptionRejectionJob;
use App\Models\PaidCourse;
use App\Models\PaidExam;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = SubscriptionRequest::with(['user', 'courses','exams.examType','exams.examCourse','exams.examYear']);

        if ($request->filled('status')){
            $query->where('status', $request->input('status'));
        }

        $subscriptionRequests = $query->latest()->paginate(16);
   

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => SubscriptionResource::collection(Subscription::with([
                'subscriptionRequest',
                'subscriptionRequest.user',
                'subscriptionRequest.courses',
                'subscriptionRequest.exams',
                'subscriptionRequest.exams.examCourse',
                'subscriptionRequest.exams.examYear'
                
            ])->get()),
            'subscriptionRequests' => SubscriptionRequestResource::collection($subscriptionRequests),
            'filters' => $request->only(['status']),
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
    public function show(SubscriptionRequest $subscription)
    {

        return Inertia::render('Subscriptions/Show', [
            'subscription' => new SubscriptionRequestResource($subscription->load(['user', 'courses','exams.examType','exams.examCourse','exams.examYear'])),
            'canApprove' => Auth::user()->hasDirectPermission('approve subscription'),
            'canReject' => Auth::user()->hasDirectPermission('update subscription')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Subscription $subscription)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subscription $subscription)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request)
    {
        $subscriptionRequest = SubscriptionRequest::findOrFail($id);

        if (!auth()->user()->hasRole('admin')) {
            abort(403, 'Unauthorized action.');
        }

        // Validate the password
        $request->validate([
            'password' => 'required',
        ]);


    
        // Check if the password is correct
        if (!Hash::check($request->password, auth()->user()->password)) {

           throw ValidationException::withMessages([
               'password' => 'Incorrect password.',
           ]);
        }
    
        // If password is correct, proceed with deletion
        $subscriptionRequest->delete();
        
        return redirect()->route('subscriptions.index')->with('success', 'Subscription request is deleted.');
    }
    

    public function approve(string $id, Request $request)
    {
        DB::beginTransaction();
    
        try {
            $subscriptionRequest = SubscriptionRequest::findOrFail($id);
    
            // Prevent duplicate approvals
            if ($subscriptionRequest->status === 'Approved') {
                return redirect()->route('subscriptions.index')->with('error', 'This subscription has already been approved.');
            }
    
            $subscription_start_date = Carbon::now();
    
            $durations = [
                'oneMonth' => 1,
                'threeMonths' => 3,
                'sixMonths' => 6,
                'yearly' => 12,
            ];
    
            $duration = $durations[$subscriptionRequest->subscription_type] ?? 1;
    
            $subscription_end_date = $subscription_start_date->copy()->addMonths($duration);
    
            $subscription = $subscriptionRequest->subscriptions()->create([
                'subscription_start_date' => $subscription_start_date,
                'subscription_end_date' => $subscription_end_date,
            ]);
    
            // Create PaidCourse for approved courses
// Create or update PaidCourse for approved courses
            $subscriptionType = $subscriptionRequest->subscription_type;
            $normalizedTypes = [
                'oneMonth' => 'one_month',
                'threeMonths' => 'three_month',
                'sixMonths' => 'six_month',
                'yearly' => 'one_year',
            ];

            $normalizedType = $normalizedTypes[$subscriptionType] ?? 'one_month';

            if ($subscriptionRequest->courses->isNotEmpty()) {
                foreach ($subscriptionRequest->courses as $course) {
                    
                    $saleField = 'on_sale_' . $normalizedType;
                    $regularField = 'price_' . $normalizedType;

                    $coursePrice = $course->$saleField !== null
                        ? $course->$saleField
                        : $course->$regularField;

                    $existingPaidCourse = PaidCourse::where('user_id', $subscriptionRequest->user_id)
                        ->where('course_id', $course->id)
                        ->first();

                    if ($existingPaidCourse) {
                        if ($existingPaidCourse->expired) {
                            $existingPaidCourse->update([
                                'expired' => false,
                                'course_price' => $coursePrice,
                            ]);
                        }
                    } else {
                        PaidCourse::create([
                            'user_id' => $subscriptionRequest->user_id,
                            'course_id' => $course->id,
                            'course_price' => $coursePrice,
                        ]);
                    }
                }
            }

            // Create or update PaidExam for approved exams
            if ($subscriptionRequest->exams->isNotEmpty()) {
                foreach ($subscriptionRequest->exams as $exam) {
                    $saleField = 'on_sale_' . $normalizedType;
                    $regularField = 'price_' . $normalizedType;
            
                    $examPrice = $exam->$saleField !== null
                        ? $exam->$saleField
                        : $exam->$regularField;
            
                    $existingPaidExam = PaidExam::where('user_id', $subscriptionRequest->user_id)
                        ->where('exam_id', $exam->id)
                        ->first();
            
                    if ($existingPaidExam) {
                        if ($existingPaidExam->expired) {
                            $existingPaidExam->update([
                                'expired' => false,
                                'exam_price' => $examPrice,
                            ]);
                        }
                    } else {
                        PaidExam::create([
                            'user_id' => $subscriptionRequest->user_id,
                            'exam_id' => $exam->id,
                            'exam_price' => $examPrice,
                        ]);
                    }
                }
            }
            

    
            $subscriptionRequest->update(['status' => "Approved"]);
    
            $superAdmins = User::role('admin')->with(['roles.permissions', 'permissions'])->get();
            $workers = User::role('worker')->with(['roles.permissions', 'permissions'])->get();
            $associatedUser = User::with(['roles.permissions', 'permissions'])->findOrFail($subscriptionRequest->user_id);
            

            $associatedUser->APINotifications()->create([
                'type' => 'subscription',
                'message' => 'Your subscription request has been approved.',
            ]);
    
            dispatch(new SendSubscriptionApproveJob($subscriptionRequest, $subscription, $superAdmins, $workers, $associatedUser));
    
            DB::commit();
    
            return redirect()->route('subscriptions.index')->with('success', 'Subscription is approved.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Subscription approval failed: ' . $e->getMessage());
            return redirect()->route('subscriptions.index')->with('error', 'Subscription approval failed. Please try again.');
        }
    }

    public function rejection(string $id, Request $request)
    {
        DB::beginTransaction();
    
        try {
            $subscriptionRequest = SubscriptionRequest::findOrFail($id);
    
            // Prevent duplicate rejections
            if ($subscriptionRequest->status === 'Rejected') {
                return redirect()->route('subscriptions.index')->with('error', 'This subscription has already been rejected.');
            }
    
            $subscriptionRequest->update(['status' => "Rejected"]);
    
            $superAdmins = User::role('admin')->with(['roles.permissions', 'permissions'])->get();

            $workers = User::role('worker')->with(['roles.permissions', 'permissions'])->get();
            
            $associatedUser = User::with(['roles.permissions', 'permissions'])->findOrFail($subscriptionRequest->user_id);
            

            $associatedUser->APINotifications()->create([
                'type' => 'subscription',
                'message' => 'Your subscription request has been rejected for the '.$request->input('message').' reason.',
            ]);
    
            dispatch(new SubscriptionRejectionJob($subscriptionRequest, $superAdmins, $workers, $associatedUser, $request->input('message')));
    
            DB::commit();
    
            return redirect()->route('subscriptions.index')->with('success', 'Subscription is rejected.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Subscription rejection failed: ' . $e->getMessage());
            return redirect()->route('subscriptions.index')->with('error', 'Subscription rejection failed. Please try again.');
        }
    }
}
