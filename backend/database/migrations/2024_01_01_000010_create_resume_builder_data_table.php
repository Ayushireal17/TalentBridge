<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("resume_builder_data", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->string("title")->default("My Resume");
            $table->json("personal_info")->nullable();
            $table->json("education")->nullable();
            $table->json("experience")->nullable();
            $table->json("skills")->nullable();
            $table->json("projects")->nullable();
            $table->text("ai_summary")->nullable();
            $table->string("template")->default("modern");
            $table->boolean("is_published")->default(false);
            $table->string("generated_pdf_path")->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index("user_id");
        });
    }
    public function down(): void { Schema::dropIfExists("resume_builder_data"); }
};
