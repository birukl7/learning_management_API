<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\CourseResource;
use App\Models\Batch;
use App\Models\Category;
use App\Models\Course;
use App\Models\Department;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::with([
            'category:id,name',
            'grade:id,grade_name',
            'department:id,department_name',
            'batch:id,batch_name',
            'createdBy:id,name',
            'updatedBy:id,name',
            'saves',
            'likes',
            'paidCourses',
            'chapters:id,course_id'
        ]);
    
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }
    
        if ($request->filled('search')) {
            $query->where('course_name', 'like', '%' . $request->search . '%');
        }
    
        // Handle alphabetical sorting
        if ($request->filled('sort')) {
            if ($request->sort === 'asc') {
                $query->orderBy('course_name', 'asc');
            } elseif ($request->sort === 'desc') {
                $query->orderBy('course_name', 'desc');
            }
        } else {
            $query->latest(); // Default sorting by creation date
        }
    
        $courses = $query->paginate(16);
    
        return Inertia::render('courses/Index', [
            'categories' => Category::all(),
            'grades' => Grade::all(),
            'departments' => Department::orderBy('department_name', 'asc')->get(),
            'batches' => Batch::all(),
            'courses' => CourseResource::collection($courses),
            'filters' => $request->only(['category', 'search', 'sort']), // Include sort in filters
            'canAdd' => Auth::user()->hasDirectPermission('add courses'),
            'session' => session('success'),
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

        $attrs = $request->validate([
            'course_name' => 'required|max:100',
            'category_id' => 'required',
            'grade_id' => 'nullable',
            'department_id' => 'nullable',
            'batch_id' => 'nullable',
            'stream' => 'nullable|in:natural,social,common',
            'price_one_month' => 'required|numeric|min:0|max:100000',
            'on_sale_one_month' => 'nullable|numeric|min:0|max:100000',
            'price_three_month' => 'required|numeric|min:0|max:100000',
            'on_sale_three_month' => 'nullable|numeric|min:0|max:100000',
            'price_six_month' => 'required|numeric|min:0|max:100000',
            'on_sale_six_month' => 'nullable|numeric|min:0|max:100000',
            'price_one_year' => 'required|numeric|min:0|max:100000',
            'on_sale_one_year' => 'nullable|numeric|min:0|max:100000',
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnail', 'public'); // Store in "storage/app/public/thumbnail"
            $attrs['thumbnail'] = $path; // Add the path to attributes to save in the database
        }

        $attrs['created_by'] = Auth::user()->id;
        $attrs['updated_by'] = Auth::user()->id;

        $course = Course::create($attrs);

        return redirect()->route('courses.index')->with('success', 'Course created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load('updatedBy', 'createdBy');

        $thumbnail = Storage::url($course->thumbnail);

        $category_name = Category::findOrFail($course->category_id)->name;

        $department_name = '';
        $batch_name = '';

        if($course->department_id && $course->batch_id){
            $department_name = Department::findOrFail($course->department_id)->department_name;

            $batch_name = Batch::findOrFail($course->batch_id)->batch_name;
        }

        $chapters = $course->chapters()->withCount('contents')->get();

        $paidCourses = $course->paidCourses()->with('user')->get();

        $paidCoursesWithSubscriptions = $paidCourses->map(function ($paidCourse) use ($course) {
            $subscriptionRequest = $paidCourse->user
                ->subscriptionRequests()
                ->whereHas('courses', fn($q) => $q->where('courses.id', $course->id))
                ->with('subscriptions')
                ->latest()
                ->first(); // or ->first() if only one expected
        
            return [
                'id' => $paidCourse->id,
                'expired' => $paidCourse->expired,
                'user' => $paidCourse->user,
                'subscriptionRequest' => $subscriptionRequest,
            ];
        });


        return Inertia::render('courses/Show', [
            'course' => $course,
            'thumbnail' => $thumbnail,
            'category_name' => $category_name,
            'department_name' => $department_name,
            'batch_name' => $batch_name,
            'chapters' => $chapters,
            'categories' => Category::all(),
            'grades' => Grade::all(),
            'departments' => Department::all(),
            'batches' => Batch::all(),
            'chaptersCount' => $course->chapters->count(),
            'enrolledStudents' => $course->paidCourses->count(),
            'paidCourses'=> $paidCoursesWithSubscriptions,
            'canUpdate' => Auth::user()->hasDirectPermission('update courses'),
            'canDelete' => Auth::user()->hasDirectPermission('delete courses'),
            'canAddChapters' => Auth::user()->hasDirectPermission('add chapters'),
            'canUpdateChapters' => Auth::user()->hasDirectPermission('update chapters'),
            'canDeleteChapters' => Auth::user()->hasDirectPermission('delete chapters'),
            'session' => session('success'),
        ]);
    }

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
    public function update(Request $request, Course $course)
    {
        $messages = [
            'thumbnail.max' => 'The thumbnail must not be larger than 5MB.',
        ];

        // dd($request->all());

        $attrs = $request->validate([
            'course_name' => 'required|max:100',
            'category_id' => 'required',
            'grade_id' => 'nullable',
            'department_id' => 'nullable',
            'batch_id' => 'nullable',
            'stream' => 'nullable|in:natural,social,common',
            'price_one_month' => 'required|numeric|max:100000',
            'on_sale_one_month' => 'nullable|numeric|max:100000',
            'price_three_month' => 'required|numeric|max:100000',
            'on_sale_three_month' => 'nullable|numeric|max:100000',
            'price_six_month' => 'required|numeric|max:100000',
            'on_sale_six_month' => 'nullable|numeric|max:100000',
            'price_one_year' => 'required|numeric|max:100000',
            'on_sale_one_year' => 'nullable|numeric|max:100000',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ], $messages);

        // Thumbnail is only updated if a new file is uploaded
        // Otherwise, the existing thumbnail is kept
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnail', 'public');
            $attrs['thumbnail'] = $path;

            // Delete the old thumbnail if it exists
            if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
                Storage::disk('public')->delete($course->thumbnail);
            }
        } else {
            // If no new thumbnail is uploaded, keep the existing one
            unset($attrs['thumbnail']);
        }

        // Remove existing_thumbnail from $attrs
        unset($attrs['existing_thumbnail']);

        $attrs['updated_by'] = Auth::user()->id;

        // Handle on-sale fields
        foreach (['one_month', 'three_month', 'six_month', 'one_year'] as $duration) {
            $onSaleKey = "on_sale_$duration";
            if (!isset($attrs[$onSaleKey]) || $attrs[$onSaleKey] === '') {
                $attrs[$onSaleKey] = null;
            }
        }

        $course->update($attrs);

        return redirect()->route('courses.show', $course->id)->with('success', 'Course updated successfully');
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(String $id, Request $request)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'password' => 'required',
        ]);
    
        // Check if the password is correct
        if (!Hash::check($request->password, auth()->user()->password)) {

           throw ValidationException::withMessages([
               'password' => 'Incorrect password.',
           ]);
        }

        // Delete the thumbnail if it exists
        if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        // Delete the course

        $course_name = $course->course_name;
        $course->delete();
        return redirect()->route('courses.index')->with('success', 'Course ' . $course_name . ' deleted successfully');
    }
}
