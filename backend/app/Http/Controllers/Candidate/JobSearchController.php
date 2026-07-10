<?php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $jobs = Job::active()
            ->when($request->search,           fn($q) => $q->search($request->search))
            ->when($request->type,             fn($q) => $q->where("type",$request->type))
            ->when($request->experience_level, fn($q) => $q->where("experience_level",$request->experience_level))
            ->when($request->location,         fn($q) => $q->where("location","like","%{$request->location}%"))
            ->when($request->is_remote,        fn($q) => $q->where("is_remote",true))
            ->withCount("applications")
            ->latest()
            ->paginate(15);

        $user = $request->user();
        if ($user) {
            $savedIds = $user->savedJobs()->pluck("job_id")->toArray();
            $jobs->getCollection()->transform(function ($job) use ($savedIds) {
                $job->is_saved = in_array($job->id, $savedIds);
                return $job;
            });
        }

        return response()->json(["success"=>true,"data"=>$jobs->items(),"meta"=>["total"=>$jobs->total(),"last_page"=>$jobs->lastPage()]]);
    }

    public function show(Request $request, Job $job): JsonResponse
    {
        if (!$job->is_active) return response()->json(["success"=>false,"message"=>"Not found."],404);
        $job->incrementViews();
        $applied = $request->user() && $job->applications()->where("user_id",$request->user()->id)->exists();
        $saved = $request->user() && $job->savedByUsers()->where("user_id",$request->user()->id)->exists();
        return response()->json(["success"=>true,"data"=>$job->load("recruiter"),"applied"=>$applied,"saved"=>$saved]);
    }

    public function recommended(Request $request): JsonResponse
    {
        $skills = $request->user()->primaryResume?->parsed_skills ?? [];
        $jobs = Job::active()
            ->when(!empty($skills), function($q) use ($skills) {
                $q->where(function($q2) use ($skills) {
                    foreach ($skills as $s) $q2->orWhereJsonContains("required_skills",$s);
                });
            })
            ->withCount("applications")->latest()->take(10)->get();
        return response()->json(["success"=>true,"data"=>$jobs]);
    }
}
