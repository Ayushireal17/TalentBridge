<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array {
        return ["name"=>$this->faker->name(),"email"=>$this->faker->unique()->safeEmail(),"email_verified_at"=>now(),"password"=>Hash::make("SecurePass123"),"phone"=>$this->faker->phoneNumber(),"location"=>$this->faker->city(),"bio"=>$this->faker->sentence(10),"role"=>"candidate"];
    }
    public function recruiter(): static { return $this->state(fn($a) => ["role"=>"recruiter"]); }
    public function admin(): static     { return $this->state(fn($a) => ["role"=>"admin"]); }
}
