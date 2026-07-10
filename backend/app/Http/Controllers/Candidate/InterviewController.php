<?php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateInterviewQuestions;
use App\Models\InterviewSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sessions = $request->user()->interviewSessions()->with("job")->paginate(10);
        return response()->json(["success"=>true,"data"=>$sessions->items(),"meta"=>["total"=>$sessions->total()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            "role_title"      => ["required","string","max:150"],
            "job_id"          => ["nullable","exists:jobs,id"],
            "session_type"    => ["nullable","in:technical,hr,mixed"],
            "difficulty"      => ["nullable","in:easy,medium,hard"],
            "questions_count" => ["nullable","integer","min:5","max:20"],
        ]);
        $session = $request->user()->interviewSessions()->create([
            "role_title"      => $request->role_title,
            "job_id"          => $request->job_id,
            "session_type"    => $request->input("session_type","mixed"),
            "difficulty"      => $request->input("difficulty","medium"),
            "questions_count" => $request->input("questions_count",10),
            "status"          => "generating",
        ]);
        GenerateInterviewQuestions::dispatch($session)->onQueue("ai");
        return response()->json(["success"=>true,"message"=>"Session created. Questions generating…","data"=>$session],201);
    }

    public function show(Request $request, InterviewSession $session): JsonResponse
    {
        if ($session->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        return response()->json(["success"=>true,"data"=>$session->load("job")]);
    }

    public function submitAnswers(Request $request, InterviewSession $session): JsonResponse
    {
        if ($session->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $request->validate(["answers"=>["required","array"],"answers.*"=>["nullable","string","max:2000"]]);
        if (!$session->questions) return response()->json(["success"=>false,"message"=>"Questions not ready yet."],422);
        $session->update(["answers"=>$request->answers,"status"=>"in_progress"]);
        return response()->json(["success"=>true,"message"=>"Answers saved.","data"=>$session->fresh()]);
    }

    public function destroy(Request $request, InterviewSession $session): JsonResponse
    {
        if ($session->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $session->delete();
        return response()->json(["success"=>true]);
    }
}
