<?php
namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\CoverLetter;
use App\Models\Job;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class CoverLetterController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(["success"=>true,"data"=>$request->user()->coverLetters()->with("job")->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(["job_id"=>["required","exists:jobs,id"],"tone"=>["nullable","in:professional,friendly,confident"]]);
        $user=$request->user(); $job=Job::findOrFail($request->job_id); $resume=$user->primaryResume;
        if (!$resume||!$resume->isParsed()) return response()->json(["success"=>false,"message"=>"Upload a resume first."],422);
        $tone=$request->input("tone","professional");
        $summary="Skills: ".implode(", ",$resume->parsed_skills??[])."
".mb_substr($resume->raw_text??"",0,600);
        try {
            $result=$this->gemini->generateCoverLetter($user->name,$job->title,$job->company,$summary,$job->description,$tone);
            $letter=CoverLetter::create(["user_id"=>$user->id,"job_id"=>$job->id,"resume_id"=>$resume->id,"title"=>"Cover Letter for {$job->title}","content"=>$result["cover_letter"],"tone"=>$tone,"generation_status"=>"done"]);
            return response()->json(["success"=>true,"data"=>$letter->load("job")],201);
        } catch(Throwable) {
            return response()->json(["success"=>false,"message"=>"Generation failed."],500);
        }
    }

    public function show(Request $request, CoverLetter $cl): JsonResponse
    {
        if ($cl->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        return response()->json(["success"=>true,"data"=>$cl->load("job")]);
    }

    public function update(Request $request, CoverLetter $cl): JsonResponse
    {
        if ($cl->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $request->validate(["content"=>["required","string","min:100"]]);
        $cl->update(["content"=>$request->content,"is_edited"=>true]);
        return response()->json(["success"=>true,"data"=>$cl->fresh()->load("job")]);
    }

    public function regenerate(Request $request, CoverLetter $cl): JsonResponse
    {
        if ($cl->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $user=$request->user(); $job=$cl->job; $resume=$user->primaryResume;
        $tone=$request->input("tone",$cl->tone);
        $summary="Skills: ".implode(", ",$resume->parsed_skills??[])."
".mb_substr($resume->raw_text??"",0,600);
        try {
            $result=$this->gemini->generateCoverLetter($user->name,$job->title,$job->company,$summary,$job->description,$tone);
            $cl->update(["content"=>$result["cover_letter"],"tone"=>$tone,"is_edited"=>false]);
            return response()->json(["success"=>true,"data"=>$cl->fresh()->load("job")]);
        } catch(Throwable) {
            return response()->json(["success"=>false,"message"=>"Regeneration failed."],500);
        }
    }

    public function destroy(Request $request, CoverLetter $cl): JsonResponse
    {
        if ($cl->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $cl->delete();
        return response()->json(["success"=>true]);
    }
}
