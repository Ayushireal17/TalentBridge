<?php
namespace App\Jobs;

use App\Models\InterviewSession;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateInterviewQuestions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(public readonly InterviewSession $session) {}

    public function handle(GeminiService $gemini): void
    {
        try {
            $resume = $this->session->user->primaryResume;
            $skills = $resume ? ($resume->parsed_skills ?? []) : [];
            $result = $gemini->generateInterviewQuestions(
                $this->session->role_title, $skills,
                $this->session->job?->description ?? "",
                $this->session->session_type, $this->session->difficulty,
                $this->session->questions_count,
            );
            $this->session->update(["questions"=>$result["questions"],"status"=>"questions_generated"]);
        } catch (Throwable $e) {
            $this->session->update(["status"=>"generating"]);
            throw $e;
        }
    }
}
