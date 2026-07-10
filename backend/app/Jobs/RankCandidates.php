<?php
namespace App\Jobs;

use App\Models\AiAnalysis;
use App\Models\Application;
use App\Models\Job;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class RankCandidates implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries = 3;
    public int $timeout = 180;

    public function __construct(public readonly Job $job) {}

    public function handle(GeminiService $gemini): void
    {
        $applications = $this->job->applications()->with(["user","resume"])->whereNotNull("resume_id")->get();
        if ($applications->isEmpty()) return;
        $candidates = $applications->map(fn($a) => ["id"=>$a->user_id,"name"=>$a->user->name,"resume_text"=>$a->resume->raw_text??""])->toArray();
        $result = $gemini->rankCandidates($this->job->title,$this->job->description,$this->job->requirements,$candidates);
        foreach ($result["ranked_candidates"] as $r) {
            Application::where("job_id",$this->job->id)->where("user_id",$r["candidate_id"])
                ->update(["match_score"=>$r["match_score"],"matched_skills"=>$r["matched_skills"]??[],"missing_skills"=>$r["missing_skills"]??[],"ai_summary"=>$r["summary"]??""]);
        }
        AiAnalysis::create(["user_id"=>$this->job->recruiter->user_id,"job_id"=>$this->job->id,"type"=>"candidate_ranking","result"=>$result,"status"=>"done"]);
    }
}
