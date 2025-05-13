<?php

use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\CarouselContentController;
use App\Http\Controllers\Api\v1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\v1\Auth\NewPasswordController;
use App\Http\Controllers\Api\v1\Auth\SessionController;
use App\Http\Controllers\Api\v1\CourseController;
use App\Http\Controllers\Api\v1\HomepageCourseController;
use App\Http\Controllers\Api\v1\NotificationController;
use App\Http\Resources\Api\ChapterContentResource;
use App\Http\Resources\Api\ChapterResource;
use App\Http\Resources\Api\ContentResource;
use App\Http\Resources\Api\CourseChapterResource;
use App\Http\Resources\Api\CourseResource;
use App\Http\Resources\Api\ExamCourseTypeResource;
use App\Http\Resources\Api\QuizResource;
use App\Http\Resources\Api\ExamGradeResource;
use App\Http\Resources\Api\ExamQuestionChapterResource;
use App\Http\Resources\ExamYearResource;
use App\Jobs\SubscriptionExpiredJob;
use App\Models\Bank;
use App\Models\Batch;
use App\Models\Category;
use App\Models\Chapter;
use App\Models\Content;
use App\Models\Course;
use App\Models\Department;
use App\Models\Exam;
use App\Models\ExamChapter;
use App\Models\ExamCourse;
use App\Models\ExamGrade;
use App\Models\ExamQuestion;
use App\Models\ExamType;
use App\Models\ExamYear;
use App\Models\Grade;
use App\Models\Like;
use App\Models\PaidCourse;
use App\Models\PaidExam;
use App\Models\Quiz;
use App\Models\Save;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});



Route::get('/random-courses-paginate', function(){
     return CourseResource::collection(Course::with(['category','grade','department','batch', 'chapters','subscriptionRequests'])->paginate()); 
});

Route::get('/random-chapters/{id}', function ($id) {
    $chapter = Chapter::with('contents','subscriptionRequests')->findOrFail($id);
    return new ChapterResource($chapter);
});

Route::get('/random-chapters', function(){
   return ChapterResource::collection(
    Chapter::with('contents')->latest()->get()
   );
});


Route::get('/course-chapters/{course_id}', function ($course_id) {

    $chapters = Chapter::where('course_id', $course_id)->get();
    return CourseChapterResource::collection($chapters);
});

Route::get('/quizzes/{quiz_id}', function ($quiz_id) {
    $quiz = Quiz::with('quizQuestions')->findOrFail($quiz_id);
    return new QuizResource($quiz);
});


Route::get('/chapter-contents/{chapter_id}', function ($chapter_id) {
    // Fetch the chapter with its related contents, videos, documents, and quizzes
    $chapter = Chapter::with([
        'contents.youtubeContents',
        'contents.fileContents',
        'quizzes.quizQuestions'
    ])->findOrFail($chapter_id);

    // Return the resource
    return new ChapterContentResource($chapter);
});

Route::get('/random-contents', function(){

    return ContentResource::collection(
        Content::with(['youtubeContents', 'fileContents'])->latest()->get()
    );
 });


 Route::get('/random-contents/{id}', function($id){
    $content = Content::with(['youtubeContents', 'fileContents'])->findOrFail($id);
    return new ContentResource($content);
 });



 Route::middleware('auth:sanctum')->get('/random-courses', function () {
    $user = request()->user();

    return CourseResource::collection(
        Course::with([
            'category',
            'grade',
            'department',
            'batch',
            'chapters',
            'paidCourses',
            'saves',
            'likes',
            // Here's the trick: don't filter courses, just filter the relation
            'subscriptionRequests' => function ($query) use ($user) {
                $query->where('user_id', $user->id)->with('subscriptions');
            },
        ])
        ->latest()
        ->take(20)
        ->get()
    );
});


Route::post('/delete-user/{id}', function ($id) {
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $user->delete();
    return response()->json(['message' => 'User deleted successfully'], 200);
})->middleware('auth:sanctum');


Route::post('/admin-register', [SessionController::class, 'adminRegister']);

Route::post('/student-register', [SessionController::class, 'studentRegister']);

Route::post('/login', [SessionController::class, 'login']);

Route::post('/logout', [SessionController::class, 'logout'])->middleware('auth:sanctum');

Route::delete('/user-delete', [SessionController::class, 'destroy'])->middleware('auth:sanctum');

Route::post('/user-update', [SessionController::class, 'update'])->middleware('auth:sanctum');

Route::post('email/verification-notification', [EmailVerificationController::class, 'sendVerificationEmail'])->middleware('auth:sanctum');


Route::resource('carousel-contents-api', CarouselContentController::class);


Route::post('forgot-password', [NewPasswordController::class, 'forgotPassword']);

Route::post('reset-password', [NewPasswordController::class, 'reset']);

Route::group(['middleware' => 'auth:sanctum'], function () {

    Route::post('/update-email', function(Request $request){
        $user = $request->user();
    
        $attrs = Validator::make($request->all(), [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
        ]);
    
        if ($attrs->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $attrs->errors()
            ], 401);
        }
    
        // Reset email verification status
        $user->email = $request->email;
        $user->email_verified_at = null;
        $user->save();
    
        // Create signed verification URL
        $webVerificationUrl = URL::temporarySignedRoute(
            'verification.verify.api',
            Carbon::now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );
    
        // Send verification email
        $emailData = [
            'user' => $user,
            'webVerificationUrl' => $webVerificationUrl,
        ];
    
        Mail::send('emails.verify', $emailData, function ($message) use($user) {
            $message->to($user->email)
                    ->subject('Verify Your Email Address');
        });
    
        return response()->json([
            'status' => true,
            'message' => 'Email updated successfully. Verification email sent.',
        ]);
    });

    Route::get('/random-courses/{filterType}', function (Request $request, $filterType) {
        $categoryMap = [
            "lower_grades" => "lower_grades",
            "high_school" => "higher_grades",
            "university" => "university",
            "random_courses" => "random_courses"
        ];
    
        if (!array_key_exists($filterType, $categoryMap)) {
            return response()->json(['error' => 'Invalid filter type'], 400);
        }
    
        $dbCategoryName = $categoryMap[$filterType];
    
        $category = Category::where('name', $dbCategoryName)->first();
    
        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }
    
        $userId = $request->user()->id;
    
        $courses = Course::with(['department', 'grade', 'batch', 'category', 'chapters','subscriptionRequests'])
            ->where('category_id', $category->id)
            ->whereDoesntHave('subscriptionRequests', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->whereIn('status', ['Pending', 'Approved']);
            }) // Exclude courses with "Pending" or "Approved" subscriptions for the user
            ->get();
    
        return CourseResource::collection($courses);
    });

    Route::get('/course-search', function (Request $request) {
        
        if (!$request->has('course_name') || empty($request->query('course_name'))) {
            // Return empty collection
            return CourseResource::collection(collect());
        }
    
        $query = Course::with([
            'category',
            'department',
            'grade',
            'chapters',
            'batch',
            'subscriptionRequests' => function ($query) use ($request) {
                if ($user = $request->user()) {
                    $query->where('user_id', $user->id)->with('subscriptions');
                }
            },
        ]);
    
        $query->where('course_name', 'like', '%' . $request->query('course_name') . '%');
    
        return CourseResource::collection($query->get());
    });

    Route::get('/notifications-new', [NotificationController::class, 'index']); // Fetch all notifications
    Route::post('/notifications-new/{id}/read', [NotificationController::class, 'markAsRead']); // Mark as read
    Route::post('/notifications-new/read-all', [NotificationController::class, 'markAllAsRead']); // Mark all as read


    Route::get('/notifications/unread', function (Request $request) {
        return response()->json([
            'unread_notifications' => $request->user()->unreadNotifications
        ]);
    });

    Route::post('/notifications/{id}/read', function ($id, Request $request) {
        $notification = $request->user()->notifications()->where('id', $id)->first();
    
        if ($notification) {
            $notification->markAsRead();
            return response()->json(['message' => 'Notification marked as read']);
        }
    
        return response()->json(['error' => 'Notification not found'], 404);
    });

    Route::post('/notifications/read-all', function (Request $request) {

        $request->user()->unreadNotifications->markAsRead();
    
        return response()->json(['message' => 'All notifications marked as read']);
    });

    Route::get('/notifications', function (Request $request) {
        return response()->json([
            'notifications' => $request->user()->notifications
        ]);
    });

    Route::post('toggle-save/{course_id}', function (string $course_id, Request $request) {

        $user = $request->user();
        $course = Course::with(['category', 'department', 'grade', 'chapters', 'batch'])
                ->findOrFail($course_id);

    
        // Check if the course is already saved
        $save = Save::where('user_id', $user->id)->where('course_id', $course->id)->first();
    
        if ($save) {
            $save->delete(); // Unsave
            return response()->json(['message' => 'Course unsaved successfully.']);
        } else {
            Save::create(['user_id' => $user->id, 'course_id' => $course->id]); // Save
            return response()->json(['message' => 'Course saved successfully.']);
        }
    });
    
    Route::post('toggle-like/{course_id}', function (string $course_id, Request $request) {
        $user = $request->user();
        $course = Course::with(['category', 'department', 'grade', 'chapters', 'batch'])
                ->findOrFail($course_id);

    
        // Check if the course is already liked
        $like = Like::where('user_id', $user->id)->where('course_id', $course->id)->first();
    
        if ($like) {
            $like->delete(); // Unlike
            return response()->json(['message' => 'Course unliked successfully.']);
        } else {
            Like::create(['user_id' => $user->id, 'course_id' => $course->id]); // Like
            return response()->json(['message' => 'Course liked successfully.']);
        }
    });

    Route::get('/saved-courses', function (Request $request) {
        $user = $request->user(); // Get the authenticated user
    
        // Fetch saved courses for the user with course details
        $savedCourses = Course::with(['category', 'department', 'grade', 'chapters', 'batch','subscriptionRequests'])
        ->whereIn('id', function ($query) use ($user) {
            $query->select('course_id')->from('saves')->where('user_id', $user->id);
        })->get();

    
        return CourseResource::collection(
             $savedCourses
        );
    });

    Route::get('/paid-exams', function(Request $request){
        $user = $request->user(); // Get authenticated user

        $user->subscriptionRequests()
        ->whereHas('subscriptions', function ($query) {
            $query->where('subscription_end_date', '<', Carbon::today())
                ->where('status', 'active');
        })
        ->with([
            'subscriptions.subscriptionRequest.courses',
            'subscriptions.subscriptionRequest.exams.examCourse',
        ])
        ->get()
        ->pluck('subscriptions')
        ->flatten()
        ->each(function ($subscription) use ($user) {
            // 1. Expire the subscription
            $subscription->update(['status' => 'expired']);

            // 2. Get subscriptionRequest
            $subscriptionRequest = $subscription->subscriptionRequest;

            // 3. Get course IDs and exam IDs
            $courseIds = $subscriptionRequest->courses->pluck('id')->toArray();
            $examIds = $subscriptionRequest->exams->pluck('id')->toArray();

            // 4. Mark PaidCourse and PaidExam as expired instead of deleting
            if (!empty($courseIds)) {
                PaidCourse::where('user_id', $user->id)
                    ->whereIn('course_id', $courseIds)
                    ->update(['expired' => true]);
            }

            if (!empty($examIds)) {
                PaidExam::where('user_id', $user->id)
                    ->whereIn('exam_id', $examIds)
                    ->update(['expired' => true]);
            }

            // 5. Create human-readable message
            $courseNames = $subscriptionRequest->courses->pluck('course_name')->toArray();
            $examNames = $subscriptionRequest->exams->pluck('examCourse.course_name')->toArray();

            $subscriptionType = '';
            if (count($courseNames) > 0) {
                $subscriptionType .= "Courses: " . implode(', ', $courseNames);
            }

            if (count($examNames) > 0) {
                if ($subscriptionType) {
                    $subscriptionType .= " | ";
                }
                $subscriptionType .= "Exams: " . implode(', ', $examNames);
            }

            if (empty($subscriptionType)) {
                $subscriptionType = "your subscription";
            }

            // 6. Notify the user
            $user->APINotifications()->create([
                'type' => 'subscription',
                'message' => "Your subscription for {$subscriptionType} has expired.",
            ]);

            $superAdmins = User::role('admin')->with(['roles.permissions', 'permissions'])->get();

            $workers = User::role('worker')->with(['roles.permissions', 'permissions'])->get();

            dispatch(new SubscriptionExpiredJob(
                $subscriptionType,
                $user->name,
                $user->email,
                $user,
                $workers,
                $superAdmins,
            ));


        });

        $paidExams = PaidExam::where('user_id', $user->id)
        ->with([
            'exam.examCourse',
            'exam.examType',
            'exam.examYear',
            'exam.subscriptionRequests' => function ($query) use ($user) {
                // Filter to only get approved subscription requests
                $query->where('user_id', $user->id)
                        ->where('status', 'Approved')  // Only Approved subscriptions
                        ->with('subscriptions');
            }
        ])
        ->get()
        ->map(function ($paidExam) use ($user) {
            $exam = $paidExam->exam;

            // Get the user's approved subscription related to this exam
            $subscription = optional($exam->subscriptionRequests->first()->subscriptions->sortByDesc('created_at')->first());

            return [
                'exam_sheet_id' => $exam->id,
                'course_id' => $exam->exam_course_id,
                'course' => $exam->examCourse->course_name ,
                'exam_type' => $exam->examType->name,
                'exam_year' => $exam->examYear->year,
                'exam_year_id' => $exam->exam_year_id,
                'exam_duration' => $exam->exam_duration ?? 60,
                'subscription_status' => $subscription->status ?? 'inactive', // Correctly fetch approved status
            ];
        });
    
        return response()->json([
            'status' => 'success',
            'data' => $paidExams,
        ]);
    });


    Route::get('/paid-courses', function (Request $request) {
        $user = $request->user(); // Get authenticated user


        $user->subscriptionRequests()
        ->whereHas('subscriptions', function ($query) {
            $query->where('subscription_end_date', '<', Carbon::today())
                ->where('status', 'active');
        })
        ->with([
            'subscriptions.subscriptionRequest.courses',
            'subscriptions.subscriptionRequest.exams.examCourse',
        ])
        ->get()
        ->pluck('subscriptions')
        ->flatten()
        ->each(function ($subscription) use ($user) {
            // 1. Expire the subscription
            $subscription->update(['status' => 'expired']);

            // 2. Get subscriptionRequest
            $subscriptionRequest = $subscription->subscriptionRequest;

            // 3. Get course IDs and exam IDs
            $courseIds = $subscriptionRequest->courses->pluck('id')->toArray();
            $examIds = $subscriptionRequest->exams->pluck('id')->toArray();

            // 4. Mark PaidCourse and PaidExam as expired instead of deleting
            if (!empty($courseIds)) {
                PaidCourse::where('user_id', $user->id)
                    ->whereIn('course_id', $courseIds)
                    ->update(['expired' => true]);
            }

            if (!empty($examIds)) {
                PaidExam::where('user_id', $user->id)
                    ->whereIn('exam_id', $examIds)
                    ->update(['expired' => true]);
            }

            // 5. Create human-readable message
            $courseNames = $subscriptionRequest->courses->pluck('course_name')->toArray();
            $examNames = $subscriptionRequest->exams->pluck('examCourse.course_name')->toArray();

            $subscriptionType = '';
            if (count($courseNames) > 0) {
                $subscriptionType .= "Courses: " . implode(', ', $courseNames);
            }

            if (count($examNames) > 0) {
                if ($subscriptionType) {
                    $subscriptionType .= " | ";
                }
                $subscriptionType .= "Exams: " . implode(', ', $examNames);
            }

            if (empty($subscriptionType)) {
                $subscriptionType = "your subscription";
            }

            // 6. Notify the user
            $user->APINotifications()->create([
                'type' => 'subscription',
                'message' => "Your subscription for {$subscriptionType} has expired.",
            ]);

            $superAdmins = User::role('admin')->with(['roles.permissions', 'permissions'])->get();

            $workers = User::role('worker')->with(['roles.permissions', 'permissions'])->get();

            dispatch(new SubscriptionExpiredJob(
                $subscriptionType,
                $user->name,
                $user->email,
                $user,
                $workers,
                $superAdmins,
            ));

        });
    
    
        // Fetch paid courses for the user with course details
        $paidCourses = Course::with(['category', 'department', 'grade', 'chapters', 'batch', 'subscriptionRequests'=> function ($query) use ($user) {
            // Filter to only get approved subscription requests
            $query->where('user_id', $user->id)
                  ->where('status', 'Approved')  // Only Approved subscriptions
                  ->with('subscriptions');
        }])
        ->whereIn('id', function ($query) use ($user) {
            $query->select('course_id')
                  ->from('paid_courses')
                  ->where('user_id', $user->id);
        })
        ->get();
    
    
        return CourseResource::collection($paidCourses);
    });

    Route::get('homepage/courses', HomepageCourseController::class);
    
    Route::resource('courses', CourseController::class);

    Route::get('exams/exam-questions-chapter/{exam_grade_id}/{chapter_id}', function($exam_grade_id, $chapter_id){

        $questions = ExamQuestion::where('exam_chapter_id', $chapter_id)->where('exam_grade_id', $exam_grade_id)
        ->get();
    
        return ExamQuestionChapterResource::collection($questions);
    });


    Route::get('exams/exam-questions-year/{exam_year_id}', function($exam_year_id){
        
        $questions = ExamQuestion::where('exam_year_id', $exam_year_id)
        ->get();
    
        return ExamQuestionChapterResource::collection($questions);
    });


    Route::post('subscription-request', [SubscriptionController::class, 'store']);


    /* Checked*/
    Route::get('exams/exam-years/{examTypeName}', function($examTypeName){

        // $types = ['matric','ministry', 'ngat','exit'];
    
        $examTypeRecord = ExamType::where('name',$examTypeName)->first();
    
        if (!$examTypeRecord) {
            return response()->json(['error' => 'Invalid exam type'], 404);
        }
    
        // Fetch exam years with question counts using Eloquent
        $examYears = ExamQuestion::with('examYear')
            ->select('exam_year_id')
            ->where('exam_type_id', $examTypeRecord->id)
            ->groupBy('exam_year_id')
            ->selectRaw('exam_year_id, COUNT(id) as question_count')
            ->get();
    
        // Return the data as a resource collection
        return ExamYearResource::collection($examYears);
    
    });
    

    /**Checked */
    Route::get('exams/exam-courses-years/{examType}', function($examType) {
        $examType = ExamType::with('exams.paidExams')->where('name', $examType)->first();
    
        if (!$examType) {
            return response()->json(['message' => 'Exam type not found'], 404);
        }
    
        // Fetch distinct courses related to this exam type
        $examCourses = Exam::where('exam_type_id', $examType->id)
            ->with('examQuestions.examYear', 'examCourse','examYear')
            ->get()
            ->groupBy('examCourse.id');  // Group exams by `examCourse`
    
        return ExamCourseTypeResource::collection($examCourses);
    });
    

    /**Checked */
    Route::get('exams/exam-questions-year/{exam_course_id}/{exam_year_id}', function ($exam_course_id, $exam_year_id) {

        $questions = ExamQuestion::where('exam_year_id', $exam_year_id)->where('exam_course_id', $exam_course_id)
            ->get();

        return ExamQuestionChapterResource::collection($questions);
    });
});



Route::get('/bank-accounts', fn() => Bank::all());






Route::get('exams/exam-grades/{exam_course_id}/{exam_year_id}', function($exam_course_id, $exam_year_id) {

    // Fetch exam grades for the given course and year
    $examGrades = ExamGrade::whereHas('examQuestions', function($query) use ($exam_course_id, $exam_year_id) {
        $query->where('exam_course_id', $exam_course_id)
              ->where('exam_year_id', $exam_year_id);
    })
    ->with('examQuestions.examChapter.examQuestions') // eager load the necessary relations
    ->get();

    // Return the collection of resources
    return ExamGradeResource::collection($examGrades);
});


Route::get('/exam-chapters/{courseId}', fn($courseId) => ExamChapter::where('exam_course_id', $courseId)->get());


Route::get('/exam-years/{examTypeId}', function($examTypeId){
    return ExamYear::where('exam_type_id', $examTypeId)->get();
});

Route::get('/exam-courses/{examYearId}', fn($examYearId)=>ExamCourse::where('exam_type_id', $examYearId)->get());

Route::get('/exam-courses-create/{examTypeId}', fn($examTypeId)=>ExamCourse::where('exam_type_id', $examTypeId)->get());

Route::get('/exam-grades/{examCourseId}', fn($examCourseId)=>ExamGrade::where('exam_course_id', $examCourseId)->get());


Route::get('/users-web/{userId}', function($userId){
    $user = App\Models\User::find($userId);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
     return response()->json(['name' => $user->name]);
});

Route::get('/categories', function(){
    return Category::all();
});

Route::get('/grades', function(Request $request){
    // dd($request->all()) ;
    Log::info($request->all());
    return Grade::where('category_id', $request->category_id)->get();
});

Route::get('/departments', function(Request $request){
    return Department::where('category_id', $request->category_id)->get();
});

Route::get('/batches', function(Request $request){
    return Batch::where('department_id', $request->department_id)->get();
});

// Route::get('/exam-chapters/{id}', fn()=>ExamChapter::find($id));

// Route::get('/exam-courses/{id}', fn()=>ExamCourse::find($id));

Route::get('/exam-courses-chapters/{courseId}/{gradeId}', function ($courseId, $gradeId) {
    return ExamChapter::whereHas('examCourse', function ($query) use ($gradeId) {
        $query->where('exam_grade_id', $gradeId);
    })
    ->where('exam_course_id', $courseId)
    ->get();
});


Route::get('/exam-courses-chapters-questions/{courseId}/{gradeId?}', function ($courseId, $gradeId = null) {
    $query = ExamChapter::where('exam_course_id', $courseId);

    // If gradeId is provided, add it to the query
    if ($gradeId) {
        $query->where('exam_grade_id', $gradeId);
    }

    return $query->get();
});


Route::get('exam-courses/{exam_course_id}/grades', function ($exam_course_id) {
    $examCourse = ExamCourse::with('examGrades')->findOrFail($exam_course_id);
    // dd($examCourse->grades);
    return $examCourse->examGrades;
});

Route::get('exam-courses/{exam_course_id}/grades/{exam_grade_id}/chapters', function ($exam_course_id, $exam_grade_id) {
    $examChapters = ExamChapter::where('exam_grade_id', $exam_grade_id)->where('exam_course_id', $exam_course_id)->get();
    return $examChapters;
});

Route::get('exam-courses/{exam_course_id}/chapters', function ($exam_course_id) {
    $examChapters = ExamChapter::where('exam_course_id', $exam_course_id)->get();
    return $examChapters;
});


Route::get('/exam-grades', function(){
    return ExamGrade::all();
});




Route::put('/exam-chapters/{exam_chapter_id}', function($exam_chapter_id, Request $request){
    $examChapter = ExamChapter::findOrFail($exam_chapter_id);
    $examChapter->update([
        'title' => $request->input('title'),
        'sequence_order' => $request->input('sequence_order'),
    ]);
    return response()->json(['message' => 'Exam chapter updated successfully']);
});


Route::put('/exam-courses/{exam_course_id}/grades', function($exam_course_id, Request $request) {
    $examCourse = ExamCourse::findOrFail($exam_course_id);

    // Get array of exam_grade_ids from request
    $gradeIds = $request->input('exam_grade_ids', []);

    // Sync the many-to-many relationship
    $examCourse->examGrades()->sync($gradeIds);

    return response()->json(['message' => 'Exam course grades updated successfully']);
});


Route::put('/exam-courses/{exam_course_id}', function($exam_course_id) {
    $examCourse = ExamCourse::findOrFail($exam_course_id);
    $examCourse->update([
        'course_name' => request('course_name'),
    ]);
    return response()->json(['message' => 'Exam course updated successfully']);
});



Route::post('/exam-chapters', function(Request $request){

    // dd($request->all());
    $examChapter = ExamChapter::create([
        'title' => $request->input('title'),
        'sequence_order' => $request->input('sequence_order'),
        'exam_course_id' => $request->input('exam_course_id'),
        'exam_grade_id' => $request->input('exam_grade_id'),
    ]);
    return response()->json(['message' => 'Exam chapter created successfully']);
});


Route::delete('/exam-chapters/{exam_chapter_id}', function($exam_chapter_id){
    $examChapter = ExamChapter::findOrFail($exam_chapter_id);
    $examChapter->delete();
    return response()->json(['message' => 'Exam chapter deleted successfully']);
});