<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AiAnalysis, Application, Job, User};
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json(["success"=>true,"data"=>[
            "total_users"        => User::count(),
            "total_candidates"   => User::where("role","candidate")->count(),
            "total_recruiters"   => User::where("role","recruiter")->count(),
            "total_jobs"         => Job::count(),
            "active_jobs"        => Job::active()->count(),
            "total_applications" => Application::count(),
            "ai_calls"           => AiAnalysis::count(),
        ]]);
    }

    public function users(): JsonResponse
    {
        $byRole  = User::selectRaw("role, count(*) as count")->groupBy("role")->pluck("count","role");
        $growth  = User::selectRaw("DATE(created_at) as date, count(*) as count")->where("created_at",">=",now()->subDays(30))->groupBy("date")->pluck("count","date");
        return response()->json(["success"=>true,"data"=>["by_role"=>$byRole,"growth_30d"=>$growth]]);
    }

    public function aiUsage(): JsonResponse
    {
        $byType = AiAnalysis::selectRaw("type, count(*) as count")->groupBy("type")->pluck("count","type");
        $growth = AiAnalysis::selectRaw("DATE(created_at) as date, count(*) as count")->where("created_at",">=",now()->subDays(30))->groupBy("date")->pluck("count","date");
        return response()->json(["success"=>true,"data"=>["by_type"=>$byType,"growth_30d"=>$growth]]);
    }
}
