<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;
    public const STATUSES = ["submitted","reviewing","shortlisted","interview","hired","rejected","withdrawn"];
    protected $fillable = [
        "user_id","job_id","resume_id","cover_letter_id","match_score",
        "matched_skills","missing_skills","ai_summary","status",
        "candidate_note","recruiter_note","applied_at","reviewed_at",
    ];
    protected function casts(): array {
        return ["matched_skills"=>"array","missing_skills"=>"array","match_score"=>"integer","applied_at"=>"datetime","reviewed_at"=>"datetime"];
    }
    protected static function booted(): void {
        static::creating(fn($a) => $a->applied_at ??= now());
    }
    public function scopeByStatus($q,$s)  { return $q->where("status",$s); }
    public function scopeRanked($q)       { return $q->orderByDesc("match_score"); }
    public function getStatusColorAttribute():string {
        return match($this->status){ "submitted"=>"blue","reviewing"=>"yellow","shortlisted"=>"purple","interview"=>"indigo","hired"=>"green","rejected"=>"red",default=>"gray" };
    }
    public function user()        { return $this->belongsTo(User::class); }
    public function job()         { return $this->belongsTo(Job::class); }
    public function resume()      { return $this->belongsTo(Resume::class); }
    public function coverLetter() { return $this->belongsTo(CoverLetter::class); }
}
