<?php
namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $jobs = $request->user()->recruiter->jobs()->withCount("applications")->latest()->paginate(15);
        return response()->json(["success"=>true,"data"=>$jobs->items(),"meta"=>["total"=>$jobs->total()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $job = $request->user()->recruiter->jobs()->create($this->validate($request));
        return response()->json(["success"=>true,"data"=>$job],201);
    }

    public function show(Request $request, Job $job): JsonResponse
    {
        $this->auth($request,$job);
        return response()->json(["success"=>true,"data"=>$job->loadCount("applications")]);
    }

    public function update(Request $request, Job $job): JsonResponse
    {
        $this->auth($request,$job);
        $job->update($this->validate($request, true));
        return response()->json(["success"=>true,"data"=>$job->fresh()]);
    }

    public function destroy(Request $request, Job $job): JsonResponse
    {
        $this->auth($request,$job);
        $job->delete();
        return response()->json(["success"=>true]);
    }

    public function toggleActive(Request $request, Job $job): JsonResponse
    {
        $this->auth($request,$job);
        $job->update(["is_active"=>!$job->is_active]);
        return response()->json(["success"=>true,"is_active"=>$job->is_active]);
    }

    private function validate(Request $request, bool $updating=false): array
    {
        $r = $updating ? "sometimes" : "required";
        return $request->validate([
            "title"=>[$r,"string","max:200"],"company"=>[$r,"string","max:150"],
            "location"=>["nullable","string","max:150"],"is_remote"=>["nullable","boolean"],
            "type"=>[$r,"in:full-time,part-time,contract,internship,freelance"],
            "experience_level"=>["nullable","in:entry,mid,senior,lead,executive"],
            "salary_min"=>["nullable","numeric","min:0"],"salary_max"=>["nullable","numeric","gte:salary_min"],
            "salary_currency"=>["nullable","string","size:3"],"salary_period"=>["nullable","in:hourly,monthly,yearly"],
            "description"=>[$r,"string","min:50"],"requirements"=>[$r,"string","min:20"],
            "required_skills"=>["nullable","array"],"preferred_skills"=>["nullable","array"],
            "benefits"=>["nullable","string"],"category"=>["nullable","string","max:100"],
            "expires_at"=>["nullable","date","after:today"],
        ]);
    }

    private function auth(Request $request, Job $job): void
    {
        if ($job->recruiter_id !== $request->user()->recruiter?->id) abort(403);
    }
}
