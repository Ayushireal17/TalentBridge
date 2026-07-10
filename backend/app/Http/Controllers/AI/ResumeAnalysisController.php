<?php
namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResume;
use App\Models\AiAnalysis;
use App\Models\Resume;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResumeAnalysisController extends Controller
{
    public function analyze(Request $request, Resume $resume): JsonResponse
    {
        if ($resume->user_id !== $request->user()->id) return response()->json(["success"=>false,"message"=>"Forbidden."],403);
        if (empty($resume->raw_text)) return response()->json(["success"=>false,"message"=>"Resume has no parsed text."],422);
        $resume->update(["analysis_status" => "pending"]);
        AnalyzeResume::dispatch($resume, $request->input("target_role",""))->onQueue("ai");
        return response()->json(["success"=>true,"message"=>"Analysis started."]);
    }

    public function show(Request $request, Resume $resume): JsonResponse
    {
        if ($resume->user_id !== $request->user()->id) return response()->json(["success"=>false,"message"=>"Forbidden."],403);
        if ($resume->analysis_status !== "done") {
            return response()->json(["success"=>true,"data"=>["status"=>$resume->analysis_status,"message"=>"Analysis is {$resume->analysis_status}"]]);
        }
        $analysis = AiAnalysis::where("resume_id",$resume->id)->ofType("resume_analysis")->done()->latest()->first();
        return response()->json(["success"=>true,"data"=>[
            "status"=>"done","ats_score"=>$resume->ats_score,"ats_grade"=>$resume->ats_grade,
            "strengths"=>$resume->strengths,"weaknesses"=>$resume->weaknesses,
            "missing_skills"=>$resume->missing_skills,"improvement_suggestions"=>$resume->improvement_suggestions,
            "detailed_result"=>$analysis?->result,"analyzed_at"=>$analysis?->created_at?->toDateTimeString(),
        ]]);
    }
}
