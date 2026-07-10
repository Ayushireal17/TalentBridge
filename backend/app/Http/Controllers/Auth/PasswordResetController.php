<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\MailService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function __construct(private MailService $mail) {}

    public function sendLink(Request $request): JsonResponse
    {
        $request->validate(["email" => ["required","email"]]);
        $user = User::where("email", $request->email)->first();
        if ($user) {
            $token = app("auth.password.broker")->createToken($user);
            $url   = env("FRONTEND_URL") . "/auth/reset-password?token={$token}&email=" . urlencode($user->email);
            $this->mail->sendPasswordReset($user->email, $user->name, $url);
        }
        return response()->json(["success" => true, "message" => "If an account exists, a reset link has been sent."]);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate(["token" => ["required"], "email" => ["required","email"], "password" => ["required","confirmed","min:8"]]);
        $status = Password::reset($request->only("email","password","password_confirmation","token"), function ($user, $pw) {
            $user->forceFill(["password" => Hash::make($pw), "remember_token" => Str::random(60)])->save();
            $user->tokens()->delete();
            event(new PasswordReset($user));
        });
        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(["success" => false, "message" => "Reset link invalid or expired."], 422);
        }
        return response()->json(["success" => true, "message" => "Password reset successfully."]);
    }
}
