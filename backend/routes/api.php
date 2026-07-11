<?php
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AI\ChatbotController;
use App\Http\Controllers\AI\ResumeAnalysisController;
use App\Http\Controllers\AI\JobMatchController;
use App\Http\Controllers\AI\CoverLetterController;
use App\Http\Controllers\AI\InterviewPrepController;
use App\Http\Controllers\Candidate\ResumeController;
use App\Http\Controllers\Candidate\JobSearchController;
use App\Http\Controllers\Candidate\ApplicationController;
use App\Http\Controllers\Candidate\SavedJobController;
use App\Http\Controllers\Candidate\InterviewController;
use App\Http\Controllers\Candidate\ResumeBuilderController;
use App\Http\Controllers\Recruiter\JobController;
use App\Http\Controllers\Recruiter\ApplicantController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\JobController as AdminJobController;
use App\Http\Controllers\Admin\AnalyticsController;
use Illuminate\Support\Facades\Route;

Route::prefix("v1")->group(function () {

    // ── Public ───────────────────────────────────────────────────────────────
    Route::prefix("auth")->group(function () {
        Route::post("register",       [AuthController::class, "register"]);
        Route::post("login",          [AuthController::class, "login"]);
        Route::post("admin-login",    [AuthController::class, "adminLogin"]);
        Route::post("forgot-password",[PasswordResetController::class, "sendLink"]);
        Route::post("reset-password", [PasswordResetController::class, "reset"]);
    });

    Route::get("jobs",       [JobSearchController::class, "index"]);
    Route::get("jobs/{job}", [JobSearchController::class, "show"]);

    // ── Authenticated ─────────────────────────────────────────────────────────
    Route::middleware("auth:sanctum")->group(function () {
        Route::post("auth/logout", [AuthController::class, "logout"]);
        Route::get("auth/me",      [AuthController::class, "me"]);

        Route::get("profile",           [ProfileController::class, "show"]);
        Route::put("profile",           [ProfileController::class, "update"]);
        Route::post("profile/avatar",   [ProfileController::class, "updateAvatar"]);

        // ── AI Chatbot (all authenticated users) ─────────────────────────────
        Route::post("ai/chat",          [ChatbotController::class, "chat"]);

        // ── Candidate ─────────────────────────────────────────────────────────
        Route::middleware("role:candidate")->prefix("candidate")->group(function () {
            Route::get("dashboard",     [ApplicationController::class, "dashboard"]);
            Route::get("jobs/recommended", [JobSearchController::class, "recommended"]);

            // Resumes
            Route::get("resumes",             [ResumeController::class, "index"]);
            Route::post("resumes",            [ResumeController::class, "store"]);
            Route::post("resumes/parse",      [ResumeController::class, "parseOnly"]);
            Route::get("resumes/{resume}",         [ResumeController::class, "show"]);
            Route::delete("resumes/{resume}",      [ResumeController::class, "destroy"]);
            Route::post("resumes/{resume}/set-primary", [ResumeController::class, "setPrimary"]);
            Route::post("resumes/{resume}/analyze",     [ResumeAnalysisController::class, "analyze"]);
            Route::get("resumes/{resume}/analysis",     [ResumeAnalysisController::class, "show"]);

            // Jobs & applications
            Route::post("jobs/{job}/apply",   [ApplicationController::class, "store"]);
            Route::get("applications",        [ApplicationController::class, "index"]);
            Route::get("applications/{app}",   [ApplicationController::class, "show"]);
            Route::delete("applications/{app}",[ApplicationController::class, "withdraw"]);
            Route::post("jobs/{job}/match",   [JobMatchController::class, "match"]);
            Route::get("jobs/{job}/match",    [JobMatchController::class, "show"]);
            Route::get("saved-jobs",          [SavedJobController::class, "index"]);
            Route::post("jobs/{job}/save",    [SavedJobController::class, "store"]);
            Route::delete("jobs/{job}/save",  [SavedJobController::class, "destroy"]);

            // Cover letters
            Route::get("cover-letters",                       [CoverLetterController::class, "index"]);
            Route::post("cover-letters",                      [CoverLetterController::class, "store"]);
            Route::get("cover-letters/{cl}",                  [CoverLetterController::class, "show"]);
            Route::put("cover-letters/{cl}",                  [CoverLetterController::class, "update"]);
            Route::post("cover-letters/{cl}/regenerate",      [CoverLetterController::class, "regenerate"]);
            Route::delete("cover-letters/{cl}",               [CoverLetterController::class, "destroy"]);

            // Interview prep
            Route::get("interview-sessions",                          [InterviewController::class, "index"]);
            Route::post("interview-sessions",                         [InterviewController::class, "store"]);
            Route::get("interview-sessions/{session}",                      [InterviewController::class, "show"]);
            Route::post("interview-sessions/{session}/submit-answers",      [InterviewController::class, "submitAnswers"]);
            Route::post("interview-sessions/{session}/evaluate",            [InterviewPrepController::class, "evaluate"]);
            Route::delete("interview-sessions/{session}",                   [InterviewController::class, "destroy"]);

            // Resume builder
            Route::apiResource("resume-builder", ResumeBuilderController::class);
            Route::post("resume-builder/{d}/generate-summary",            [ResumeBuilderController::class, "generateSummary"]);
            Route::post("resume-builder/{d}/generate-project-description",[ResumeBuilderController::class, "generateProjectDescription"]);
            Route::post("resume-builder/{d}/export-pdf",                  [ResumeBuilderController::class, "exportPdf"]);
        });

        // ── Recruiter ─────────────────────────────────────────────────────────
        Route::middleware("role:recruiter")->prefix("recruiter")->group(function () {
            Route::get("dashboard",      [ApplicantController::class, "dashboard"]);
            Route::get("analytics",      [ApplicantController::class, "analytics"]);
            Route::apiResource("jobs",   JobController::class);
            Route::post("jobs/{job}/toggle-active",    [JobController::class, "toggleActive"]);
            Route::get("jobs/{job}/applicants",        [ApplicantController::class, "index"]);
            Route::get("jobs/{job}/applicants/{application}",  [ApplicantController::class, "show"]);
            Route::put("jobs/{job}/applicants/{application}/status", [ApplicantController::class, "updateStatus"]);
            Route::post("jobs/{job}/rank-candidates",  [ApplicantController::class, "rankCandidates"]);
        });

        // ── Admin ─────────────────────────────────────────────────────────────
        Route::middleware("role:admin")->prefix("admin")->group(function () {
            Route::get("analytics/overview",     [AnalyticsController::class, "overview"]);
            Route::get("analytics/users",        [AnalyticsController::class, "users"]);
            Route::get("analytics/ai-usage",     [AnalyticsController::class, "aiUsage"]);
            Route::apiResource("users",          AdminUserController::class);
            Route::post("users/{user}/toggle-active", [AdminUserController::class, "toggleActive"]);
            Route::post("users/{user}/change-role",   [AdminUserController::class, "changeRole"]);
            Route::apiResource("jobs",           AdminJobController::class)->only(["index","show","destroy"]);
            Route::post("jobs/{job}/toggle-active",   [AdminJobController::class, "toggleActive"]);
        });
    });
});
