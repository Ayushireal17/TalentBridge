<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("jobs", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("recruiter_id");
            $table->string("title");
            $table->string("company");
            $table->string("location")->nullable();
            $table->boolean("is_remote")->default(false);
            $table->enum("type", ["full-time","part-time","contract","internship","freelance"])->default("full-time");
            $table->enum("experience_level", ["entry","mid","senior","lead","executive"])->nullable();
            $table->decimal("salary_min", 10, 2)->nullable();
            $table->decimal("salary_max", 10, 2)->nullable();
            $table->string("salary_currency", 5)->default("INR");
            $table->enum("salary_period", ["hourly","monthly","yearly"])->default("yearly");
            $table->text("description");
            $table->text("requirements");
            $table->json("required_skills")->nullable();
            $table->json("preferred_skills")->nullable();
            $table->text("benefits")->nullable();
            $table->string("category")->nullable();
            $table->boolean("is_active")->default(true);
            $table->boolean("is_published")->default(true);
            $table->unsignedInteger("views_count")->default(0);
            $table->unsignedInteger("applications_count")->default(0);
            $table->timestamp("expires_at")->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index("recruiter_id");
            $table->index("is_active");
            $table->index("type");
        });
    }
    public function down(): void { Schema::dropIfExists("jobs"); }
};
