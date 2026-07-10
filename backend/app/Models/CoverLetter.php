<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoverLetter extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ["user_id","job_id","resume_id","title","content","tone","is_edited","generation_status"];
    protected function casts(): array { return ["is_edited"=>"boolean"]; }
    public function getExcerptAttribute():string { return mb_substr(strip_tags($this->content??''),0,150)."..."; }
    public function user() { return $this->belongsTo(User::class); }
    public function job()  { return $this->belongsTo(Job::class); }
}
