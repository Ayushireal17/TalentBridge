<?php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Services\MailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(private MailService $mail) {}

    public function store(Request $request, Job $job): JsonResponse
    {
        $request->validate(["resume_id"=>["required","exists:resumes,id"],"cover_letter_id"=>["nullable","exists:cover_letters,id"],"candidate_note"=>["nullable","string","max:500"]]);
        if (Application::where("user_id",$request->user()->id)->where("job_id",$job->id)->exists())
            return response()->json(["success"=>false,"message"=>"Already applied."],422);
        if (!$job->is_active||$job->isExpired())
            return response()->json(["success"=>false,"message"=>"Job not accepting applications."],422);
        $app = Application::create([
            "user_id"=>$request->user()->id,"job_id"=>$job->id,
            "resume_id"=>$request->resume_id,"cover_letter_id"=>$request->cover_letter_id,
            "candidate_note"=>$request->candidate_note,"status"=>"submitted",
        ]);
        $job->increment("applications_count");
        return response()->json(["success"=>true,"message"=>"Application submitted.","data"=>$app->load("job")],201);
    }

    public function index(Request $request): JsonResponse
    {
        $apps = $request->user()->applications()
            ->with(["job.recruiter","resume"])
            ->when($request->status, fn($q) => $q->byStatus($request->status))
            ->paginate(10);
        return response()->json(["success"=>true,"data"=>$apps->items(),"meta"=>["total"=>$apps->total()]]);
    }

    public function show(Request $request, Application $app): JsonResponse
    {
        if ($app->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        return response()->json(["success"=>true,"data"=>$app->load(["job.recruiter","resume","coverLetter"])]);
    }

    public function withdraw(Request $request, Application $app): JsonResponse
    {
        if ($app->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        if (in_array($app->status,["hired","rejected"])) return response()->json(["success"=>false,"message"=>"Cannot withdraw finalized application."],422);
        $app->update(["status"=>"withdrawn"]);
        return response()->json(["success"=>true,"message"=>"Application withdrawn."]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user   = $request->user();
        $resume = $user->primaryResume;
        $counts = $user->applications()->selectRaw("status, count(*) as count")->groupBy("status")->pluck("count","status");
        $recent = $user->applications()->with(["job"])->latest("applied_at")->take(5)->get();
        return response()->json(["success"=>true,"data"=>[
            "resume_score"        => $resume?->ats_score,
            "resume_grade"        => $resume?->ats_grade,
            "total_applications"  => $user->applications()->count(),
            "status_breakdown"    => $counts,
            "recent_applications" => $recent,
            "saved_jobs_count"    => $user->savedJobs()->count(),
            "interviews_count"    => $user->interviewSessions()->completed()->count(),
            "profile_percent"     => $this->profilePercent($user),
        ]]);
    }

    private function profilePercent($user): int
    {
        $fields = [$user->name,$user->email,$user->phone,$user->location,$user->bio,$user->avatar_path,$user->linkedin_url];
        return (int) round(count(array_filter($fields)) / count($fields) * 100);
    }
}
