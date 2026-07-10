<?php
namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class InterviewPrepController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function evaluate(Request $request, InterviewSession $session): JsonResponse
    {
        if ($session->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        if (empty($session->answers)) return response()->json(["success"=>false,"message"=>"Submit answers first."],422);
        try {
            $result=$this->gemini->evaluateInterviewAnswers($session->role_title,$session->questions,$session->answers);
            $session->update(["evaluations"=>$result["evaluations"],"readiness_score"=>$result["readiness_score"],"overall_feedback"=>$result["overall_feedback"],"status"=>"completed"]);
            return response()->json(["success"=>true,"data"=>$session->fresh()]);
        } catch(Throwable) {
            return response()->json(["success"=>false,"message"=>"Evaluation failed."],500);
        }
    }
}
