<?php
namespace App\Jobs;

use App\Models\AiAnalysis;
use App\Models\Resume;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class AnalyzeResume implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries = 3;
    public int $timeout = 120;
    public int $backoff = 30;

    public function __construct(public readonly Resume $resume, public readonly string $targetRole = "") {}

    public function handle(GeminiService $gemini): void
    {
        $this->resume->update(["analysis_status"=>"processing"]);
        try {
        if (empty($this->resume->raw_text) || str_starts_with($this->resume->raw_text, 'Unable to extract') || strlen(trim($this->resume->raw_text)) < 50) {
            throw new \RuntimeException("Could not extract readable text from the resume PDF. Please upload a text-based PDF (not a scanned image).");
        }
            $result = $gemini->analyzeResume($this->resume->raw_text, $this->targetRole);
            $this->resume->update([
                "ats_score"=>$result["ats_score"]??0,"strengths"=>$result["strengths"]??[],
                "weaknesses"=>$result["weaknesses"]??[],"missing_skills"=>$result["missing_skills"]??[],
                "improvement_suggestions"=>$result["improvement_suggestions"]??[],"analysis_status"=>"done",
            ]);
            AiAnalysis::create(["user_id"=>$this->resume->user_id,"resume_id"=>$this->resume->id,"type"=>"resume_analysis","result"=>$result,"status"=>"done"]);
        } catch (Throwable $e) {
            Log::error("AnalyzeResume failed",["id"=>$this->resume->id,"error"=>$e->getMessage()]);
            if ($this->attempts()>=$this->tries) $this->resume->update(["analysis_status"=>"failed"]);
            throw $e;
        }
    }

    public function failed(Throwable $e): void { $this->resume->update(["analysis_status"=>"failed"]); }
}
