<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("cover_letters", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("job_id")->nullable();
            $table->unsignedBigInteger("resume_id")->nullable();
            $table->string("title");
            $table->longText("content");
            $table->string("tone")->default("professional");
            $table->boolean("is_edited")->default(false);
            $table->enum("generation_status", ["pending","done","failed"])->default("done");
            $table->timestamps();
            $table->softDeletes();
            $table->index("user_id");
        });
    }
    public function down(): void { Schema::dropIfExists("cover_letters"); }
};
