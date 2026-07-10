<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private int    $timeout;
    private string $baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    public function __construct()
    {
        $this->apiKey  = config("services.gemini.key", "");
        $this->model   = config("services.gemini.model", "gemini-3.5-flash");
        $this->timeout = (int) config("services.gemini.timeout", 60);
        if (empty($this->apiKey)) throw new RuntimeException("GEMINI_API_KEY not configured in .env");
        
        // Allow enough PHP execution time for API timeout + up to 3 retries with backoff (10+20+40s)
        if (function_exists('set_time_limit')) {
            @set_time_limit($this->timeout + 90);
        }
    }

    public function chat(array $messages, string $userRole = "candidate"): string
    {
        $system = "You are BridgeAI, an expert career assistant on TalentBridge platform. "
            . "You help " . ($userRole === "recruiter" ? "recruiters find and evaluate talent" : "job seekers find roles, improve resumes, and ace interviews") . ". "
            . "Be concise, friendly, and actionable. Use emojis sparingly. Format lists clearly.";

        $contents = [
            ["role" => "user",  "parts" => [["text" => $system]]],
            ["role" => "model", "parts" => [["text" => "Understood! I am BridgeAI, ready to help."]]],
        ];

        foreach ($messages as $m) {
            $contents[] = [
                "role"  => $m["role"] === "assistant" ? "model" : "user",
                "parts" => [["text" => $m["content"]]],
            ];
        }

        $res = $this->callRaw($contents, 800);
        return $res["candidates"][0]["content"]["parts"][0]["text"] ?? "Sorry, I could not process that. Please try again.";
    }

    public function analyzeResume(string $resumeText, string $targetRole = ""): array
    {
        $roleCtx = $targetRole ? "Target role: {$targetRole}." : "General analysis.";
        $prompt  = "You are an expert ATS analyst. {$roleCtx}\n\n"
            . "Analyze this resume and return ONLY valid JSON — no markdown, no explanation:\n\n"
            . mb_substr($resumeText, 0, 8000) . "\n\n"
            . '{"ats_score":<0-100>,"ats_grade":"A|B|C|D|F","strengths":["..."],"weaknesses":["..."],'
            . '"missing_skills":["..."],"improvement_suggestions":["..."],'
            . '"keyword_density":{"present_keywords":["..."],"missing_keywords":["..."]},'
            . '"summary":"2-3 sentence overall assessment"}';
        return $this->call($prompt, 3000);
    }

    public function parseResumeFromImage(string $base64Image, string $mimeType = "image/jpeg"): array
    {
        $url  = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";
        $body = [
            "contents" => [[
                "parts" => [
                    ["inline_data" => ["mime_type" => $mimeType, "data" => $base64Image]],
                    ["text" => "Extract all information from this resume image and return ONLY valid JSON:\n"
                        . '{"name":"","email":"","phone":"","location":"","title":"","experience":[{"company":"","role":"","duration":"","description":""}],'
                        . '"education":[{"institution":"","degree":"","year":""}],"skills":["..."],"summary":"","certifications":[""]}'],
                ],
            ]],
            "generationConfig" => ["temperature" => 0.1, "maxOutputTokens" => 2000],
        ];

        $response = Http::timeout($this->timeout)
            ->withoutVerifying()
            ->post($url, $body);

        if ($response->failed()) {
            throw new RuntimeException("Gemini image parse failed: " . $response->json("error.message", "Unknown"));
        }

        $raw = $response->json("candidates.0.content.parts.0.text", "{}");
        return $this->parseJson($raw);
    }

    public function matchJobToResume(string $resumeText, string $jobTitle, string $jobDesc, string $requirements): array
    {
        $prompt = "Expert recruiter job-resume match analysis. Return ONLY valid JSON.\n\n"
            . "JOB: {$jobTitle}\nDESC: " . mb_substr($jobDesc, 0, 1500) . "\nREQ: " . mb_substr($requirements, 0, 800)
            . "\nRESUME: " . mb_substr($resumeText, 0, 4000) . "\n\n"
            . '{"match_percentage":<0-100>,"match_grade":"Excellent|Good|Fair|Poor","matched_skills":["..."],'
            . '"missing_skills":["..."],"recommended_skills":["..."],'
            . '"experience_match":{"score":<0-100>,"comment":""},'
            . '"education_match":{"score":<0-100>,"comment":""},'
            . '"suitability_summary":"","key_strengths":["..."],"concerns":[""]}';
        return $this->call($prompt, 1200);
    }

    public function rankCandidates(string $jobTitle, string $jobDesc, string $requirements, array $candidates): array
    {
        $list = "";
        foreach ($candidates as $i => $c) {
            $n    = $i + 1;
            $list .= "\nCANDIDATE {$n} (ID:{$c["id"]}, {$c["name"]}):\n" . mb_substr($c["resume_text"] ?? "", 0, 1500) . "\n---";
        }
        $prompt = "Expert recruiter ranking candidates. Return ONLY valid JSON.\n\n"
            . "JOB: {$jobTitle}\n" . mb_substr($jobDesc, 0, 800) . "\nREQ: " . mb_substr($requirements, 0, 500)
            . "\n{$list}\n\n"
            . '{"ranked_candidates":[{"candidate_id":<int>,"rank":<int>,"match_score":<0-100>,'
            . '"matched_skills":["..."],"missing_skills":["..."],"recommendation":"Highly Recommended|Recommended|Consider|Not Recommended",'
            . '"summary":""}],"ranking_summary":""}';
        return $this->call($prompt, 3000);
    }

    public function generateCoverLetter(string $name, string $jobTitle, string $company, string $resumeSummary, string $jobDesc, string $tone = "professional"): array
    {
        $prompt = "Expert cover letter writer. Return ONLY valid JSON.\n\n"
            . "CANDIDATE: {$name}\nJOB: {$jobTitle}\nCOMPANY: {$company}\nTONE: {$tone}\n"
            . "BACKGROUND: " . mb_substr($resumeSummary, 0, 800) . "\nJOB DESC: " . mb_substr($jobDesc, 0, 800) . "\n\n"
            . "Write 3-paragraph cover letter. Do NOT start with 'I am writing to apply'.\n\n"
            . '{"cover_letter":"<full letter>","subject_line":"","tone_used":"' . $tone . '","word_count":<int>}';
        return $this->call($prompt, 1000);
    }

    public function generateResumeSummary(array $experience, array $skills, string $targetRole, string $years = ""): array
    {
        $expStr   = implode(", ", array_map(fn($e) => "{$e["title"]} at {$e["company"]}", array_slice($experience, 0, 5)));
        $skillStr = implode(", ", array_slice($skills["technical"] ?? $skills, 0, 12));
        $prompt   = "Professional resume writer. Return ONLY valid JSON.\n\n"
            . "ROLE: {$targetRole}\nYEARS: {$years}\nEXP: {$expStr}\nSKILLS: {$skillStr}\n\n"
            . '{"professional_summary":"3-4 ATS sentences","suggested_objective":"2 sentences","keywords_included":[""]}';
        return $this->call($prompt, 600);
    }

    public function generateInterviewQuestions(string $role, array $skills, string $jobDesc = "", string $type = "mixed", string $difficulty = "medium", int $count = 10): array
    {
        $skillStr = implode(", ", array_slice($skills, 0, 10));
        $typeNote = match($type) {
            "technical" => "ONLY technical (coding, system design)",
            "hr"        => "ONLY behavioral/HR (STAR)",
            default     => "60% technical + 40% HR",
        };
        $diffNote = match($difficulty) {
            "easy"  => "Entry-level",
            "hard"  => "Senior-level",
            default => "Mid-level 2-4 years",
        };
        $prompt = "Expert interviewer for {$role}. Return ONLY valid JSON. Generate EXACTLY {$count} questions.\n\n"
            . "SKILLS: {$skillStr}\nTYPE: {$typeNote}\nDIFFICULTY: {$diffNote}\n"
            . (empty($jobDesc) ? "" : "JOB: " . mb_substr($jobDesc, 0, 600) . "\n") . "\n"
            . '{"questions":[{"id":<int>,"question":"","type":"technical|behavioral|situational","topic":"","difficulty":"easy|medium|hard","sample_answer":"100-150 words","tip":"","follow_up":""}],'
            . '"session_tips":["..."],"focus_areas":[""]}';
        return $this->call($prompt, 4000);
    }

    public function evaluateInterviewAnswers(string $role, array $questions, array $answers): array
    {
        $qa = "";
        foreach (array_slice($questions, 0, 15) as $q) {
            $id  = $q["id"] ?? 0;
            $ans = mb_substr($answers[$id] ?? $answers[(string)$id] ?? "No answer.", 0, 400);
            $qa .= "Q{$id}: {$q["question"]}\nAnswer: {$ans}\nModel: " . mb_substr($q["sample_answer"] ?? "", 0, 150) . "\n---\n";
        }
        $prompt = "Evaluate {$role} interview. Return ONLY valid JSON.\n\n{$qa}\n\n"
            . '{"evaluations":[{"question_id":<int>,"score":<0-10>,"grade":"Excellent|Good|Fair|Poor","feedback":"","better_answer":"","missed_points":[""]}],'
            . '"readiness_score":<0-100>,"overall_feedback":"3-4 sentences","strong_areas":["..."],"weak_areas":[""]}';
        return $this->call($prompt, 2500);
    }

    public function generateProjectDescription(string $name, array $tech, string $role, string $outcomes = "", string $duration = ""): array
    {
        $techStr = implode(", ", $tech);
        $prompt  = "Write a concise, ATS-optimised project description for a resume. Return ONLY valid JSON.\n\n"
            . "PROJECT: {$name}\nTECH: {$techStr}\nROLE: {$role}\nDURATION: {$duration}\nOUTCOMES: {$outcomes}\n\n"
            . '{"description":"2-3 bullet-point sentences starting with action verbs","keywords":["..."],"impact":"quantified outcome sentence"}';
        return $this->call($prompt, 400);
    }

    private function call(string $prompt, int $maxTokens = 1000): array
    {
        $contents = [["parts" => [["text" => $prompt]]]];
        $response = $this->callRaw($contents, $maxTokens);
        $raw      = $response["candidates"][0]["content"]["parts"][0]["text"] ?? "";
        if (empty($raw)) throw new RuntimeException("Gemini returned empty response.");
        return $this->parseJson($raw);
    }

    private function callRaw(array $contents, int $maxTokens): array
    {
        $url     = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";
        $payload = [
            "contents"         => $contents,
            "generationConfig" => [
                "temperature"     => 0.3,
                "topK"            => 32,
                "topP"            => 0.95,
                "maxOutputTokens" => $maxTokens,
            ],
            "safetySettings" => [
                ["category" => "HARM_CATEGORY_HARASSMENT",        "threshold" => "BLOCK_NONE"],
                ["category" => "HARM_CATEGORY_HATE_SPEECH",       "threshold" => "BLOCK_NONE"],
                ["category" => "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold" => "BLOCK_NONE"],
                ["category" => "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold" => "BLOCK_NONE"],
            ],
        ];

        $maxRetries = 3;
        $attempt    = 0;

        while (true) {
            $attempt++;
            try {
                $response = Http::timeout($this->timeout)
                    ->withoutVerifying()
                    ->withHeaders(["Content-Type" => "application/json"])
                    ->post($url, $payload);
            } catch (\Exception $e) {
                throw new RuntimeException("Cannot connect to Gemini API: " . $e->getMessage());
            }

            if ($response->successful()) {
                return $response->json();
            }

            $status = $response->status();
            $msg    = $response->json("error.message", "Unknown");

            // Retry on 503 (high demand) with exponential backoff
            if ($status === 503 && $attempt < $maxRetries) {
                $wait = pow(2, $attempt) * 5; // 10s, 20s, 40s
                Log::warning("GeminiService 503 on attempt {$attempt}, retrying in {$wait}s...");
                sleep($wait);
                continue;
            }

            Log::error("GeminiService error", ["status" => $status, "msg" => $msg, "attempts" => $attempt]);
            if ($status === 401 || $status === 403) throw new RuntimeException("Invalid GEMINI_API_KEY.");
            if ($status === 429) throw new RuntimeException("Gemini rate limit reached. Try again shortly.");
            if ($status === 503) throw new RuntimeException("Gemini is currently overloaded. Please try again in a few minutes.");
            throw new RuntimeException("Gemini API error ({$status}): {$msg}");
        }
    }


    private function parseJson(string $raw): array
    {
        $c = trim($raw);
        // Strip markdown code fences
        $c = preg_replace("/^```(?:json)?\s*/i", "", $c);
        $c = preg_replace("/\s*```\s*$/i", "", $c);
        $c = trim($c);

        // Find the first { or [ to skip any preamble text
        if (!str_starts_with($c, "{") && !str_starts_with($c, "[")) {
            $j = strpos($c, "{");
            $a = strpos($c, "[");
            if ($j !== false && ($a === false || $j < $a)) $c = substr($c, $j);
            elseif ($a !== false) $c = substr($c, $a);
        }

        // Try parsing as-is first
        $data = json_decode($c, true);
        if (json_last_error() === JSON_ERROR_NONE && $data !== null) {
            return $data;
        }

        // Response may be truncated — attempt to repair by closing open brackets
        $repaired = $this->repairJson($c);
        $data = json_decode($repaired, true);
        if (json_last_error() === JSON_ERROR_NONE && $data !== null) {
            Log::warning("GeminiService: used repaired JSON", ["original_len" => strlen($c), "repaired_len" => strlen($repaired)]);
            return $data;
        }

        Log::error("GeminiService JSON parse fail", ["raw" => substr($raw, 0, 500), "err" => json_last_error_msg()]);
        throw new RuntimeException("Could not parse Gemini JSON response: " . json_last_error_msg());
    }

    private function repairJson(string $c): string
    {
        // Cut off at the last complete value by finding the last } or ]
        $lastCurly  = strrpos($c, "}");
        $lastSquare = strrpos($c, "]");
        $last       = max($lastCurly ?: 0, $lastSquare ?: 0);
        if ($last > 0) $c = substr($c, 0, $last + 1);

        // Count unclosed brackets and close them
        $opens  = [];
        $inStr  = false;
        $escape = false;
        for ($i = 0; $i < strlen($c); $i++) {
            $ch = $c[$i];
            if ($escape) { $escape = false; continue; }
            if ($ch === '\\' && $inStr) { $escape = true; continue; }
            if ($ch === '"') { $inStr = !$inStr; continue; }
            if ($inStr) continue;
            if ($ch === '{') $opens[] = '}';
            elseif ($ch === '[') $opens[] = ']';
            elseif (($ch === '}' || $ch === ']') && !empty($opens)) array_pop($opens);
        }

        // Close any unclosed string first
        if ($inStr) $c .= '"';
        // Close any trailing comma before closing
        $c = rtrim(rtrim($c), ',');
        // Append missing closers in reverse order
        foreach (array_reverse($opens) as $closer) {
            $c .= $closer;
        }

        return $c;
    }
}