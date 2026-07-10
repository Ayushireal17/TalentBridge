<?php
namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResume;
use App\Models\Resume;
use App\Services\GeminiService;
use App\Services\ResumeParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ResumeController extends Controller
{
    public function __construct(
        private ResumeParserService $parser,
        private GeminiService $gemini
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(["success"=>true,"data"=>$request->user()->resumes()->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(["resume"=>["required","file","mimes:pdf,docx,doc","max:5120"],"label"=>["nullable","string","max:100"]]);
        $file     = $request->file("resume");
        $fileType = strtolower($file->getClientOriginalExtension());
        $path     = $file->store("resumes/{$request->user()->id}", "public");

        $resume = $request->user()->resumes()->create([
            "original_filename" => $file->getClientOriginalName(),
            "file_path"         => $path,
            "file_type"         => $fileType,
            "file_size"         => $file->getSize(),
            "label"             => $request->label,
            "parse_status"      => "processing",
            "analysis_status"   => "pending",
        ]);

        try {
            $raw      = $this->parser->extractText($path, $fileType);
            $sections = $this->parser->extractBasicSections($raw);
            $resume->update([
                "raw_text"          => $raw,
                "parsed_skills"     => $sections["skills"] ? array_filter(array_map("trim", explode(",", $sections["skills"]))) : [],
                "parsed_education"  => $sections["education"] ? [$sections["education"]] : [],
                "parsed_experience" => $sections["experience"] ? [$sections["experience"]] : [],
                "parsed_projects"   => $sections["projects"] ? [$sections["projects"]] : [],
                "parse_status"      => "done",
            ]);
        } catch (Throwable $e) {
            Log::error("Resume parse failed", ["error" => $e->getMessage()]);
            $resume->update(["raw_text" => "Parse failed: {$e->getMessage()}", "parse_status" => "failed"]);
        }

        if ($request->user()->resumes()->count() === 1) $resume->update(["is_primary" => true]);
        if ($resume->parse_status === "done") AnalyzeResume::dispatchAfterResponse($resume);

        return response()->json(["success"=>true,"message"=>"Resume uploaded. AI analysis in progress.","data"=>$resume->fresh()], 201);
    }

    // Parse PDF or image without saving as resume — returns structured JSON immediately
    public function parseOnly(Request $request): JsonResponse
    {
        $request->validate(["file"=>["required","file","mimes:pdf,png,jpg,jpeg,webp","max:5120"]]);
        $file = $request->file("file");
        $ext  = strtolower($file->getClientOriginalExtension());

        try {
            if (in_array($ext, ["png","jpg","jpeg","webp"])) {
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $mime   = $file->getMimeType();
                $result = $this->gemini->parseResumeFromImage($base64, $mime);
            } else {
                // Store temporarily, extract text with smalot, then delete
                $path    = $file->store("temp", "local");
                $absPath = storage_path("app/" . $path);

                $raw = '';
                // Try smalot/pdfparser first (pure PHP, Windows-safe)
                if (class_exists(\Smalot\PdfParser\Parser::class)) {
                    try {
                        $pdfParser = new \Smalot\PdfParser\Parser();
                        $raw       = $pdfParser->parseFile($absPath)->getText();
                    } catch (\Throwable $e) { /* fall through */ }
                }
                // Fallback: use the service (handles docx too)
                if (empty(trim($raw))) {
                    try {
                        $raw = $this->parser->extractText(
                            str_replace(storage_path("app/public/"), '', $absPath),
                            $ext
                        );
                    } catch (\Throwable $e) { /* ignore */ }
                }

                Storage::disk("local")->delete($path);

                if (empty(trim($raw)) || str_starts_with(trim($raw), 'Unable to extract')) {
                    return response()->json(["success"=>false,"message"=>"Could not extract text from this PDF. Please ensure it is a text-based (not scanned) PDF."], 422);
                }
                // Quick structured extraction via AI
                $result = $this->gemini->analyzeResume($raw);
                $result["raw_text"] = mb_substr($raw, 0, 2000);
            }
            return response()->json(["success"=>true,"data"=>$result]);
        } catch (Throwable $e) {
            return response()->json(["success"=>false,"message"=>"Parse failed: ".$e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id): JsonResponse
{
    $resume = Resume::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$resume) {
        return response()->json([
            'success' => false,
            'message' => 'Resume not found.',
        ], 404);
    }

    return response()->json(['success' => true, 'data' => $resume]);
}

    public function destroy(Request $request, $id): JsonResponse
{
    $resume = Resume::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$resume) {
        return response()->json([
            'success' => false,
            'message' => 'Resume not found or you do not have permission to delete it.',
        ], 404);
    }

    if ($resume->file_path && Storage::disk('public')->exists($resume->file_path)) {
        Storage::disk('public')->delete($resume->file_path);
    }

    $resume->delete();

    return response()->json([
        'success' => true,
        'message' => 'Resume deleted.',
    ]);
}

    public function setPrimary(Request $request, $id): JsonResponse
{
    $resume = Resume::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$resume) {
        return response()->json([
            'success' => false,
            'message' => 'Resume not found.',
        ], 404);
    }

    $request->user()->resumes()->update(['is_primary' => false]);
    $resume->update(['is_primary' => true]);

    return response()->json([
        'success' => true,
        'data'    => $resume->fresh(),
    ]);
}
}
