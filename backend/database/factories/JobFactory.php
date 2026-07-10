<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    public function definition(): array {
        return [
            "title"=>$this->faker->jobTitle(),"company"=>$this->faker->company(),
            "location"=>$this->faker->city(),"is_remote"=>$this->faker->boolean(40),
            "type"=>$this->faker->randomElement(["full-time","part-time","contract"]),
            "experience_level"=>$this->faker->randomElement(["entry","mid","senior"]),
            "salary_min"=>$this->faker->numberBetween(300000,800000),
            "salary_max"=>$this->faker->numberBetween(800001,2000000),
            "salary_currency"=>"INR","salary_period"=>"yearly",
            "description"=>$this->faker->paragraphs(3,true),
            "requirements"=>$this->faker->paragraphs(2,true),
            "is_active"=>true,"is_published"=>true,"expires_at"=>now()->addDays(rand(15,60)),
        ];
    }
}
