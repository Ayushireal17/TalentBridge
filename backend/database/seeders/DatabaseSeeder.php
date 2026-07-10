<?php
namespace Database\Seeders;
use App\Models\{Job, Recruiter, User};
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create(["name"=>"Admin TalentBridge","email"=>"admin@talentbridge.ai"]);
        User::factory(5)->create(["role"=>"candidate"]);
        $recruiters = User::factory(3)->recruiter()->create();
        foreach ($recruiters as $user) {
            $r = Recruiter::create(["user_id"=>$user->id,"company_name"=>$user->name." Corp","industry"=>"Technology","is_verified"=>true]);
            Job::factory(4)->create(["recruiter_id"=>$r->id]);
        }
        $this->command->info("✅ Seeded! Admin: admin@talentbridge.ai / SecurePass123");
    }
}
