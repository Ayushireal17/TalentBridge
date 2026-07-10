<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedJob extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ["user_id","job_id","saved_at"];
    protected function casts(): array { return ["saved_at"=>"datetime"]; }
    protected static function booted(): void { static::creating(fn($m)=>$m->saved_at??=now()); }
    public function user() { return $this->belongsTo(User::class); }
    public function job()  { return $this->belongsTo(Job::class); }
}
