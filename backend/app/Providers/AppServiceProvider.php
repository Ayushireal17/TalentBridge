<?php
namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\App\Services\GeminiService::class,       fn() => new \App\Services\GeminiService());
        $this->app->singleton(\App\Services\ResumeParserService::class,  fn() => new \App\Services\ResumeParserService());
        $this->app->singleton(\App\Services\MailService::class,          fn() => new \App\Services\MailService());
    }

    public function boot(): void
    {
        Gate::policy(\App\Models\Resume::class,            \App\Policies\ResumePolicy::class);
        Gate::policy(\App\Models\Job::class,               \App\Policies\JobPolicy::class);
        Gate::policy(\App\Models\Application::class,       \App\Policies\ApplicationPolicy::class);
        Gate::policy(\App\Models\CoverLetter::class,       \App\Policies\CoverLetterPolicy::class);
        Gate::policy(\App\Models\InterviewSession::class,  \App\Policies\InterviewSessionPolicy::class);
        Gate::policy(\App\Models\ResumeBuilderData::class, \App\Policies\ResumeBuilderPolicy::class);
    }
}
