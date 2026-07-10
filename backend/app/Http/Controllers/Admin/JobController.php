<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $jobs = Job::with("recruiter")->withCount("applications")->latest()->paginate(20);
        return response()->json(["success"=>true,"data"=>$jobs->items(),"meta"=>["total"=>$jobs->total()]]);
    }

    public function show(Job $job): JsonResponse
    {
        return response()->json(["success"=>true,"data"=>$job->load("recruiter")->loadCount("applications")]);
    }

    public function destroy(Job $job): JsonResponse { $job->delete(); return response()->json(["success"=>true]); }

    public function toggleActive(Job $job): JsonResponse
    {
        $job->update(["is_active"=>!$job->is_active]);
        return response()->json(["success"=>true,"is_active"=>$job->is_active]);
    }
}
