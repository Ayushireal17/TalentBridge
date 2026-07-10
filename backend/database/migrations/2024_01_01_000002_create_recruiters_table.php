<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create("recruiters", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id")->unique();
            $table->string("company_name");
            $table->string("company_size", 50)->nullable();
            $table->string("industry", 100)->nullable();
            $table->string("website")->nullable();
            $table->string("logo_path")->nullable();
            $table->text("company_description")->nullable();
            $table->boolean("is_verified")->default(false);
            $table->timestamps();
            $table->index("user_id");
        });
    }
    public function down(): void { Schema::dropIfExists("recruiters"); }
};
