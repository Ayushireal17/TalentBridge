<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterviewSession extends Model
{
    use HasFactory;
    protected $fillable = ["user_id","job_id","role_title","session_type","difficulty","questions_count","questions","answers","evaluations","readiness_score","overall_feedback","status"];
    protected $appends = ["readiness_grade","progress_percent"];
    protected function casts(): array { return ["questions"=>"array","answers"=>"array","evaluations"=>"array","readiness_score"=>"integer"]; }
    public function scopeCompleted($q) { return $q->where("status","completed"); }
    public function getReadinessGradeAttribute():string {
        return match(true){
            ($this->readiness_score??0)>=85=>"Excellent",($this->readiness_score??0)>=70=>"Good",
            ($this->readiness_score??0)>=55=>"Fair",($this->readiness_score??0)>=40=>"Needs Work",default=>"Poor"
        };
    }
    public function getProgressPercentAttribute():int {
        if(!$this->questions||!$this->answers) return 0;
        $total=count($this->questions); if(!$total) return 0;
        return (int)round(count(array_filter($this->answers))/$total*100);
    }
    public function user() { return $this->belongsTo(User::class); }
    public function job()  { return $this->belongsTo(Job::class); }
}
