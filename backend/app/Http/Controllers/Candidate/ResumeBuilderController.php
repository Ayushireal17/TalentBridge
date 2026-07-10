<?php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ResumeBuilderData;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ResumeBuilderController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(["success"=>true,"data"=>$request->user()->resumeBuilderData()->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->user()->resumeBuilderData()->create(["title"=>$request->input("title","My Resume"),"template"=>$request->input("template","modern")]);
        return response()->json(["success"=>true,"data"=>$data],201);
    }

    public function show(Request $request, ResumeBuilderData $resumeBuilderDatum): JsonResponse
    {
        if ($resumeBuilderDatum->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        return response()->json(["success"=>true,"data"=>$resumeBuilderDatum]);
    }

    public function update(Request $request, ResumeBuilderData $resumeBuilderDatum): JsonResponse
    {
        if ($resumeBuilderDatum->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $resumeBuilderDatum->update($request->only(["title","personal_info","education","experience","skills","projects","template","is_published","ai_summary"]));
        return response()->json(["success"=>true,"data"=>$resumeBuilderDatum->fresh()]);
    }

    public function destroy(Request $request, ResumeBuilderData $resumeBuilderDatum): JsonResponse
    {
        if ($resumeBuilderDatum->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $resumeBuilderDatum->delete();
        return response()->json(["success"=>true]);
    }

    public function generateSummary(Request $request, ResumeBuilderData $resumeBuilderDatum): JsonResponse
    {
        if ($resumeBuilderDatum->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $request->validate(["target_role"=>["required","string","max:150"]]);
        try {
            $result = $this->gemini->generateResumeSummary(
                $resumeBuilderDatum->experience ?? [],
                $resumeBuilderDatum->skills ?? [],
                $request->target_role,
                $request->input("years","")
            );
            $resumeBuilderDatum->update(["ai_summary"=>$result["professional_summary"]]);
            return response()->json(["success"=>true,"data"=>$result]);
        } catch(Throwable) {
            return response()->json(["success"=>false,"message"=>"Generation failed."],500);
        }
    }

    public function generateProjectDescription(Request $request, ResumeBuilderData $resumeBuilderDatum): JsonResponse
    {
        if ($resumeBuilderDatum->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        $request->validate(["project_name"=>["required","string"],"tech_stack"=>["required","array"],"role"=>["required","string"]]);
        try {
            $result = $this->gemini->generateProjectDescription($request->project_name,$request->tech_stack,$request->role,$request->input("outcomes",""),$request->input("duration",""));
            return response()->json(["success"=>true,"data"=>$result]);
        } catch(Throwable) {
            return response()->json(["success"=>false,"message"=>"Generation failed."],500);
        }
    }

    public function exportPdf(Request $request, ResumeBuilderData $resumeBuilderDatum): JsonResponse
    {
        if ($resumeBuilderDatum->user_id!==$request->user()->id) return response()->json(["success"=>false],403);
        // PDF export — requires barryvdh/laravel-dompdf
        try {
            $pdf = app("dompdf.wrapper");
            $html = view("resumes.template", ["data"=>$resumeBuilderDatum])->render();
            $pdf->loadHTML($html)->setPaper("A4","portrait");
            $filename = "resumes/built/{$resumeBuilderDatum->user_id}/" . \Illuminate\Support\Str::uuid() . ".pdf";
            \Illuminate\Support\Facades\Storage::disk("public")->put($filename, $pdf->output());
            $resumeBuilderDatum->update(["generated_pdf_path"=>$filename]);
            return response()->json(["success"=>true,"pdf_url"=>asset("storage/{$filename}")]);
        } catch(Throwable $e) {
            return response()->json(["success"=>false,"message"=>"PDF generation failed."],500);
        }
    }
}
