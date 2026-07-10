<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Recruiter;
use App\Models\User;
use App\Services\MailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function __construct(private MailService $mail) {}

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            "name"                  => ["required","string","min:2","max:100"],
            "email"                 => ["required","email","unique:users,email"],
            "password"              => ["required","confirmed", Password::min(8)->letters()->numbers()],
            "role"                  => ["required","in:candidate,recruiter"],
            "company_name"          => ["required_if:role,recruiter","nullable","string","max:150"],
        ]);

        $user = User::create([
            "name"     => $request->name,
            "email"    => $request->email,
            "password" => $request->password,
            "role"     => $request->role,
        ]);

        if ($user->isRecruiter()) {
            Recruiter::create(["user_id" => $user->id, "company_name" => $request->company_name]);
            $user->load("recruiter");
        }

        $token = $user->createToken("web")->plainTextToken;

        // Send welcome email async
        try { $this->mail->sendWelcome($user->email, $user->name, $user->role); } catch (\Throwable) {}

        return response()->json(["success" => true, "message" => "Account created.", "data" => ["user" => $this->userPayload($user), "token" => $token]], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate(["email" => ["required","email"], "password" => ["required","string"], "role" => ["nullable","in:candidate,recruiter"]]);

        $user = User::where("email", $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(["email" => ["Invalid credentials."]]);
        }

        if ($user->trashed()) return response()->json(["success" => false, "message" => "Account deactivated."], 403);

        // Validate role if provided
        if ($request->role && $user->role !== $request->role) {
            return response()->json(["success" => false, "message" => "No {$request->role} account found with these credentials."], 422);
        }

        $user->tokens()->where("name", "web")->delete();
        $token = $user->createToken("web")->plainTextToken;

        if ($user->isRecruiter()) $user->load("recruiter");

        return response()->json(["success" => true, "data" => ["user" => $this->userPayload($user), "token" => $token]]);
    }

    public function adminLogin(Request $request): JsonResponse
    {
        $request->validate(["email" => ["required","email"], "password" => ["required","string"]]);
        $user = User::where("email", $request->email)->where("role", "admin")->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(["success" => false, "message" => "Invalid admin credentials."], 401);
        }
        $user->tokens()->where("name", "admin")->delete();
        $token = $user->createToken("admin")->plainTextToken;
        return response()->json(["success" => true, "data" => ["user" => $this->userPayload($user), "token" => $token]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(["success" => true, "message" => "Logged out."]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->isRecruiter()) $user->load("recruiter");
        return response()->json(["success" => true, "data" => $this->userPayload($user)]);
    }

    private function userPayload(User $user): array
    {
        return [
            "id"         => $user->id,
            "name"       => $user->name,
            "email"      => $user->email,
            "role"       => $user->role,
            "avatar_url" => $user->avatar_url,
            "recruiter"  => $user->relationLoaded("recruiter") ? ["company_name" => $user->recruiter?->company_name, "is_verified" => $user->recruiter?->is_verified] : null,
        ];
    }
}
