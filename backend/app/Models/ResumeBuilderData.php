<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResumeBuilderData extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ["user_id","title","personal_info","education","experience","skills","projects","ai_summary","template","is_published","generated_pdf_path"];
    protected function casts(): array { return ["personal_info"=>"array","education"=>"array","experience"=>"array","skills"=>"array","projects"=>"array","is_published"=>"boolean"]; }
    public function isComplete():bool { return !empty($this->personal_info["name"])&&!empty($this->experience)&&!empty($this->skills); }
    public function getPdfUrlAttribute():?string { return $this->generated_pdf_path?asset("storage/".$this->generated_pdf_path):null; }
    public function user() { return $this->belongsTo(User::class); }
}
