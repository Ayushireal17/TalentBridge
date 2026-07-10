<?php
namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Illuminate\Support\Facades\Log;

class MailService
{
    private function mailer(): PHPMailer
    {
        $m = new PHPMailer(true);
        $m->isSMTP();
        $m->Host       = env("MAIL_HOST", "smtp.gmail.com");
        $m->SMTPAuth   = true;
        $m->Username   = env("MAIL_USERNAME");
        $m->Password   = env("MAIL_PASSWORD");
        $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $m->Port       = (int) env("MAIL_PORT", 587);
        $m->setFrom(env("MAIL_FROM_ADDRESS", "noreply@talentbridge.ai"), env("MAIL_FROM_NAME", "TalentBridge"));
        $m->isHTML(true);
        return $m;
    }

    public function send(string $to, string $toName, string $subject, string $html): bool
    {
        try {
            $m = $this->mailer();
            $m->addAddress($to, $toName);
            $m->Subject = $subject;
            $m->Body    = $html;
            $m->AltBody = strip_tags($html);
            $m->send();
            return true;
        } catch (Exception $e) {
            Log::error("MailService send failed", ["to" => $to, "error" => $e->getMessage()]);
            return false;
        }
    }

    public function sendWelcome(string $to, string $name, string $role): bool
    {
        $roleLabel = $role === "recruiter" ? "Recruiter" : "Job Seeker";
        $html = $this->template("Welcome to TalentBridge! 🎉", "
            <h2>Hi {$name}!</h2>
            <p>Welcome to <strong>TalentBridge</strong> — India's AI-powered career platform.</p>
            <p>You've signed up as a <strong>{$roleLabel}</strong>.</p>
            " . ($role === "candidate" ? "
            <p>Here's what you can do:</p>
            <ul>
                <li>📄 Upload your resume for AI analysis</li>
                <li>🎯 Get matched with relevant jobs</li>
                <li>🤖 Chat with BridgeAI for career advice</li>
                <li>✉️ Generate cover letters in seconds</li>
            </ul>" : "
            <p>Here's what you can do:</p>
            <ul>
                <li>💼 Post unlimited job listings</li>
                <li>🤖 AI-rank all applicants automatically</li>
                <li>📊 Track applications with smart filters</li>
            </ul>") . "
            <a href=\"" . env("FRONTEND_URL", "http://localhost:3000") . "\" style=\"display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#6c63ff,#00d4aa);color:white;text-decoration:none;border-radius:10px;font-weight:600;\">
                Go to Dashboard
            </a>
        ");
        return $this->send($to, $name, "Welcome to TalentBridge! 🎉", $html);
    }

    public function sendPasswordReset(string $to, string $name, string $resetUrl): bool
    {
        $html = $this->template("Reset Your Password", "
            <h2>Hi {$name},</h2>
            <p>We received a request to reset your TalentBridge password.</p>
            <a href=\"{$resetUrl}\" style=\"display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#6c63ff,#00d4aa);color:white;text-decoration:none;border-radius:10px;font-weight:600;\">
                Reset Password
            </a>
            <p style=\"margin-top:16px;color:#64748b;font-size:13px;\">This link expires in 60 minutes. If you did not request this, ignore this email.</p>
        ");
        return $this->send($to, $name, "Reset Your TalentBridge Password", $html);
    }

    public function sendApplicationUpdate(string $to, string $name, string $jobTitle, string $company, string $status): bool
    {
        $statusColors = ["shortlisted"=>"#6c63ff","interview"=>"#00d4aa","hired"=>"#22c55e","rejected"=>"#ff6b6b"];
        $color = $statusColors[$status] ?? "#64748b";
        $html = $this->template("Application Update — {$jobTitle}", "
            <h2>Hi {$name},</h2>
            <p>Your application for <strong>{$jobTitle}</strong> at <strong>{$company}</strong> has been updated.</p>
            <p>Status: <span style=\"background:{$color}22;color:{$color};padding:6px 16px;border-radius:100px;font-weight:600;font-size:14px;\">
                " . ucfirst($status) . "
            </span></p>
            <a href=\"" . env("FRONTEND_URL") . "/candidate/applications\" style=\"display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#6c63ff,#00d4aa);color:white;text-decoration:none;border-radius:10px;font-weight:600;\">
                View Application
            </a>
        ");
        return $this->send($to, $name, "Application Update: {$jobTitle}", $html);
    }

    private function template(string $title, string $body): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#13131f;border-radius:20px;overflow:hidden;border:1px solid #ffffff12;">
    <div style="background:linear-gradient(135deg,#6c63ff,#00d4aa);padding:32px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:white;letter-spacing:-1px;">TalentBridge</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">AI Powered</div>
    </div>
    <div style="padding:40px;color:#e2e8f0;line-height:1.7;">
      {$body}
    </div>
    <div style="padding:24px 40px;border-top:1px solid #ffffff0a;text-align:center;">
      <p style="font-size:12px;color:#64748b;margin:0;">© 2026 TalentBridge · <a href="#" style="color:#6c63ff;text-decoration:none;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
HTML;
    }
}
