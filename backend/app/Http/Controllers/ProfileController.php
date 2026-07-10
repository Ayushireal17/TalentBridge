<?php
namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->isRecruiter()) $user->load("recruiter");
        return response()->json(["success" => true, "data" => $user]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            "name"          => ["sometimes","string","max:100"],
            "phone"         => ["nullable","string","max:20"],
            "location"      => ["nullable","string","max:150"],
            "bio"           => ["nullable","string","max:1000"],
            "linkedin_url"  => ["nullable","url"],
            "github_url"    => ["nullable","url"],
            "portfolio_url" => ["nullable","url"],
        ]);
        $request->user()->update($request->validated());
        return response()->json(["success" => true, "data" => $request->user()->fresh()]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate(["avatar" => ["required","image","mimes:jpeg,png,jpg,webp","max:2048"]]);
        $user = $request->user();
        if ($user->avatar_path) Storage::disk("public")->delete($user->avatar_path);
        $path = $request->file("avatar")->store("avatars/{$user->id}", "public");
        $user->update(["avatar_path" => $path]);
        return response()->json(["success" => true, "avatar_url" => asset("storage/{$path}")]);
    }
}
