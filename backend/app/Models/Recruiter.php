<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recruiter extends Model
{
    use HasFactory;
    protected $fillable = ["user_id","company_name","company_size","industry","website","logo_path","company_description","is_verified"];
    protected function casts(): array { return ["is_verified" => "boolean"]; }
    public function getLogoUrlAttribute(): ?string { return $this->logo_path ? asset("storage/".$this->logo_path) : null; }
    public function user()       { return $this->belongsTo(User::class); }
    public function jobs()       { return $this->hasMany(Job::class); }
    public function activeJobs() { return $this->hasMany(Job::class)->where("is_active", true); }
}
