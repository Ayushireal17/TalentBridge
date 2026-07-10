<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        "name","email","password","role","phone","avatar_path",
        "location","bio","linkedin_url","github_url","portfolio_url",
    ];

    protected $hidden = ["password","remember_token"];

    protected function casts(): array
    {
        return ["email_verified_at" => "datetime", "password" => "hashed"];
    }

    public function isCandidate(): bool { return $this->role === "candidate"; }
    public function isRecruiter(): bool { return $this->role === "recruiter"; }
    public function isAdmin():     bool { return $this->role === "admin"; }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path ? asset("storage/".$this->avatar_path) : null;
    }

    public function getPrimaryResumeAttribute(): ?Resume
    {
        return $this->resumes()->where("is_primary", true)->first();
    }

    public function recruiter()        { return $this->hasOne(Recruiter::class); }
    public function resumes()          { return $this->hasMany(Resume::class); }
    public function resumeBuilderData(){ return $this->hasMany(ResumeBuilderData::class); }
    public function applications()     { return $this->hasMany(Application::class); }
    public function savedJobs()        { return $this->hasMany(SavedJob::class); }
    public function coverLetters()     { return $this->hasMany(CoverLetter::class); }
    public function interviewSessions(){ return $this->hasMany(InterviewSession::class); }
    public function aiAnalyses()       { return $this->hasMany(AiAnalysis::class); }
}
