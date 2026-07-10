<?php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\SavedJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedJobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $saved = $request->user()->savedJobs()->with("job")->latest("saved_at")->paginate(10);
        return response()->json(["success"=>true,"data"=>$saved->items()]);
    }

    public function store(Request $request, Job $job): JsonResponse
    {
        if (SavedJob::where("user_id",$request->user()->id)->where("job_id",$job->id)->exists())
            return response()->json(["success"=>false,"message"=>"Already saved."],422);
        SavedJob::create(["user_id"=>$request->user()->id,"job_id"=>$job->id]);
        return response()->json(["success"=>true,"message"=>"Job saved."],201);
    }

    public function destroy(Request $request, Job $job): JsonResponse
    {
        SavedJob::where("user_id",$request->user()->id)->where("job_id",$job->id)->delete();
        return response()->json(["success"=>true,"message"=>"Removed from saved."]);
    }
}
