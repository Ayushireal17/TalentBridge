<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("resumes", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->string("original_filename");
            $table->string("file_path");
            $table->string("file_type", 10)->default("pdf");
            $table->unsignedBigInteger("file_size")->nullable();
            $table->longText("raw_text")->nullable();
            $table->json("parsed_skills")->nullable();
            $table->json("parsed_education")->nullable();
            $table->json("parsed_experience")->nullable();
            $table->json("parsed_projects")->nullable();
            $table->unsignedTinyInteger("ats_score")->nullable();
            $table->json("strengths")->nullable();
            $table->json("weaknesses")->nullable();
            $table->json("missing_skills")->nullable();
            $table->json("improvement_suggestions")->nullable();
            $table->enum("parse_status", ["pending","processing","done","failed"])->default("pending");
            $table->enum("analysis_status", ["pending","processing","done","failed"])->default("pending");
            $table->boolean("is_primary")->default(false);
            $table->string("label")->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index("user_id");
        });
    }
    public function down(): void { Schema::dropIfExists("resumes"); }
};
