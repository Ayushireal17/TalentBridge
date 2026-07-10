<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("interview_sessions", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("job_id")->nullable();
            $table->string("role_title");
            $table->enum("session_type", ["technical","hr","mixed"])->default("mixed");
            $table->enum("difficulty", ["easy","medium","hard"])->default("medium");
            $table->unsignedTinyInteger("questions_count")->default(10);
            $table->json("questions")->nullable();
            $table->json("answers")->nullable();
            $table->json("evaluations")->nullable();
            $table->unsignedTinyInteger("readiness_score")->nullable();
            $table->text("overall_feedback")->nullable();
            $table->enum("status", ["generating","questions_generated","in_progress","completed"])->default("generating");
            $table->timestamps();
            $table->index("user_id");
        });
    }
    public function down(): void { Schema::dropIfExists("interview_sessions"); }
};
