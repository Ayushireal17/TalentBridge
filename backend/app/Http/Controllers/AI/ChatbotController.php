<?php
namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AiAnalysis;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ChatbotController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            "messages"   => ["required","array","max:20"],
            "messages.*.role"    => ["required","in:user,assistant"],
            "messages.*.content" => ["required","string","max:2000"],
            "role"       => ["nullable","in:candidate,recruiter"],
        ]);

        try {
            $reply = $this->gemini->chat($request->messages, $request->input("role", "candidate"));

            AiAnalysis::create([
                "user_id" => $request->user()->id,
                "type"    => "chat",
                "result"  => ["reply" => $reply, "messages_count" => count($request->messages)],
                "status"  => "done",
            ]);

            return response()->json(["success" => true, "data" => ["reply" => $reply]]);
        } catch (Throwable $e) {
            return response()->json(["success" => false, "message" => "AI unavailable. Please try again."], 500);
        }
    }
}
