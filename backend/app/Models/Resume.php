<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resume extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        "user_id","original_filename","file_path","file_type","file_size","raw_text",
        "parsed_skills","parsed_education","parsed_experience","parsed_projects",
        "ats_score","strengths","weaknesses","missing_skills","improvement_suggestions",
        "parse_status","analysis_status","is_primary","label",
    ];
    protected function casts(): array {
        return [
            "parsed_skills"=>"array","parsed_education"=>"array","parsed_experience"=>"array",
            "parsed_projects"=>"array","strengths"=>"array","weaknesses"=>"array",
            "missing_skills"=>"array","improvement_suggestions"=>"array",
            "is_primary"=>"boolean","ats_score"=>"integer","file_size"=>"integer",
        ];
    }
    public function getFileUrlAttribute():string        { return asset("storage/".$this->file_path); }
    public function getFileSizeFormattedAttribute():string {
        $b=$this->file_size??0;
        if($b>=1048576) return round($b/1048576,1)." MB";
        if($b>=1024)    return round($b/1024,1)." KB";
        return $b." B";
    }
    public function isParsed():bool   { return $this->parse_status==="done"; }
    public function isAnalyzed():bool { return $this->analysis_status==="done"; }
    public function getAtsGradeAttribute():string {
        return match(true) {
            ($this->ats_score??0)>=85=>"A",($this->ats_score??0)>=70=>"B",
            ($this->ats_score??0)>=55=>"C",($this->ats_score??0)>=40=>"D",default=>"F",
        };
    }
    public function user()         { return $this->belongsTo(User::class); }
    public function applications() { return $this->hasMany(Application::class); }
    public function aiAnalyses()   { return $this->hasMany(AiAnalysis::class); }
}
