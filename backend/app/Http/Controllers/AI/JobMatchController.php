<?php
namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AiAnalysis;
use App\Models\Job;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class JobMatchController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function match(Request $request, Job $job): JsonResponse
    {
        $user   = $request->user();
        $resume = $user->primaryResume;
        if (!$resume || !$resume->isParsed()) return response()->json(["success"=>false,"message"=>"Upload a resume first."],422);

        $existing = AiAnalysis::where("user_id",$user->id)->where("job_id",$job->id)->ofType("job_match")->where("created_at",">=",now()->subHours(24))->latest()->first();
        if ($existing) return response()->json(["success"=>true,"cached"=>true,"data"=>$existing->result]);

        try {
            $result = $this->gemini->matchJobToResume($resume->raw_text,$job->title,$job->description,$job->requirements);
            AiAnalysis::create(["user_id"=>$user->id,"resume_id"=>$resume->id,"job_id"=>$job->id,"type"=>"job_match","result"=>$result,"status"=>"done"]);
            return response()->json(["success"=>true,"cached"=>false,"data"=>$result]);
        } catch (Throwable) {
            return response()->json(["success"=>false,"message"=>"Matching failed."],500);
        }
    }

    public function show(Request $request, Job $job): JsonResponse
    {
        $a = AiAnalysis::where("user_id",$request->user()->id)->where("job_id",$job->id)->ofType("job_match")->done()->latest()->first();
        if (!$a) return response()->json(["success"=>false,"message"=>"No match found."],404);
        return response()->json(["success"=>true,"data"=>$a->result]);
    }
}
