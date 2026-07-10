<?php
namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Jobs\RankCandidates;
use App\Models\Application;
use App\Models\Job;
use App\Services\MailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantController extends Controller
{
    public function __construct(private MailService $mail) {}

    public function index(Request $request, Job $job): JsonResponse
    {
        $this->auth($request,$job);
        $apps = $job->applications()
            ->with(["user","resume"])
            ->when($request->status, fn($q) => $q->byStatus($request->status))
            ->when($request->sort==="score", fn($q) => $q->ranked(), fn($q) => $q->latest("applied_at"))
            ->paginate(20);
        return response()->json(["success"=>true,"data"=>$apps->items(),"meta"=>["total"=>$apps->total()]]);
    }

    public function show(Request $request, Job $job, Application $application): JsonResponse
    {
        $this->auth($request,$job);
        $application->update(["reviewed_at"=>now()]);
        return response()->json(["success"=>true,"data"=>$application->load(["user","resume","coverLetter"])]);
    }

    public function updateStatus(Request $request, Job $job, Application $application): JsonResponse
    {
        $this->auth($request,$job);
        $request->validate(["status"=>["required","in:".implode(",",Application::STATUSES)],"recruiter_note"=>["nullable","string","max:1000"]]);
        $application->update(["status"=>$request->status,"recruiter_note"=>$request->recruiter_note]);
        // Email candidate
        try { $this->mail->sendApplicationUpdate($application->user->email,$application->user->name,$job->title,$job->company,$request->status); } catch (\Throwable) {}
        return response()->json(["success"=>true,"data"=>$application->fresh()]);
    }

    public function rankCandidates(Request $request, Job $job): JsonResponse
    {
        $this->auth($request,$job);
        $count = $job->applications()->whereNotNull("resume_id")->count();
        if (!$count) return response()->json(["success"=>false,"message"=>"No applicants with resumes."],422);
        RankCandidates::dispatch($job)->onQueue("ai");
        return response()->json(["success"=>true,"message"=>"AI ranking started for {$count} candidates."]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $recruiter = $request->user()->recruiter;
        $jobIds    = $recruiter->jobs()->pluck("id");
        $jobs      = $recruiter->jobs()->withCount(["applications","applications as new_count"=>fn($q)=>$q->where("status","submitted")])->latest()->take(5)->get();
        return response()->json(["success"=>true,"data"=>[
            "total_jobs"        => $recruiter->jobs()->count(),
            "active_jobs"       => $recruiter->activeJobs()->count(),
            "total_applications"=> Application::whereIn("job_id",$jobIds)->count(),
            "new_applications"  => Application::whereIn("job_id",$jobIds)->where("status","submitted")->count(),
            "recent_jobs"       => $jobs,
        ]]);
    }

    private function auth(Request $request, Job $job): void
    {
        if ($job->recruiter_id !== $request->user()->recruiter?->id) abort(403);
    }
}
