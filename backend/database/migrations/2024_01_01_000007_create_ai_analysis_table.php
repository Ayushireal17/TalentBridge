<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("ai_analysis", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("resume_id")->nullable();
            $table->unsignedBigInteger("job_id")->nullable();
            $table->enum("type", ["resume_analysis","job_match","cover_letter","candidate_ranking","interview_prep","chat"]);
            $table->json("result");
            $table->string("model_used")->default("gemini-1.5-flash");
            $table->enum("status", ["done","failed"])->default("done");
            $table->timestamps();
            $table->index("user_id");
            $table->index(["user_id","type"]);
        });
    }
    public function down(): void { Schema::dropIfExists("ai_analysis"); }
};
