<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        "recruiter_id","title","company","location","is_remote","type","experience_level",
        "salary_min","salary_max","salary_currency","salary_period","description","requirements",
        "required_skills","preferred_skills","benefits","category","is_active","is_published",
        "views_count","applications_count","expires_at",
    ];
    protected function casts(): array {
        return [
            "is_remote"=>"boolean","is_active"=>"boolean","is_published"=>"boolean",
            "required_skills"=>"array","preferred_skills"=>"array",
            "expires_at"=>"datetime",
        ];
    }
    public function scopeActive($q)             { return $q->where("is_active",true)->where("is_published",true)->where(fn($q2)=>$q2->whereNull("expires_at")->orWhere("expires_at",">",now())); }
    public function scopeSearch($q, $term)      { return $q->where(fn($q2)=>$q2->where("title","like","%$term%")->orWhere("company","like","%$term%")->orWhere("description","like","%$term%")); }
    public function isExpired(): bool           { return $this->expires_at && $this->expires_at->isPast(); }
    public function getSalaryRangeAttribute(): ?string {
        if (!$this->salary_min && !$this->salary_max) return null;
        return "{$this->salary_currency} ".number_format($this->salary_min)." – ".number_format($this->salary_max)." / {$this->salary_period}";
    }
    public function incrementViews()            { $this->increment("views_count"); }
    public function recruiter()                 { return $this->belongsTo(Recruiter::class); }
    public function applications()              { return $this->hasMany(Application::class); }
    public function savedByUsers()              { return $this->hasMany(SavedJob::class); }
}
