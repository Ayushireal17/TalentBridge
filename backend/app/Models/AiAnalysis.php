<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiAnalysis extends Model
{
    use HasFactory;
    protected $table = "ai_analysis";
    protected $fillable = ["user_id","resume_id","job_id","type","result","model_used","status"];
    protected function casts(): array { return ["result"=>"array"]; }
    public function scopeOfType($q,$t)  { return $q->where("type",$t); }
    public function scopeDone($q)       { return $q->where("status","done"); }
    public function user()   { return $this->belongsTo(User::class); }
    public function resume() { return $this->belongsTo(Resume::class); }
    public function job()    { return $this->belongsTo(Job::class); }
}
