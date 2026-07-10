<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("applications", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("job_id");
            $table->unsignedBigInteger("resume_id");
            $table->unsignedBigInteger("cover_letter_id")->nullable();
            $table->unsignedTinyInteger("match_score")->nullable();
            $table->json("matched_skills")->nullable();
            $table->json("missing_skills")->nullable();
            $table->text("ai_summary")->nullable();
            $table->enum("status", ["submitted","reviewing","shortlisted","interview","hired","rejected","withdrawn"])->default("submitted");
            $table->text("candidate_note")->nullable();
            $table->text("recruiter_note")->nullable();
            $table->timestamp("applied_at")->useCurrent();
            $table->timestamp("reviewed_at")->nullable();
            $table->timestamps();
            $table->unique(["user_id","job_id"]);
            $table->index("user_id");
            $table->index("job_id");
            $table->index("status");
        });
    }
    public function down(): void { Schema::dropIfExists("applications"); }
};
