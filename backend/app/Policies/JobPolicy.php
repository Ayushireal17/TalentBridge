<?php
namespace App\Policies;
use App\Models\Job;
use App\Models\User;
class JobPolicy
{
    public function view(User $user, Job $model): bool { return $model->is_active || $user->isAdmin(); }
    public function create(User $user): bool { return $user->isRecruiter(); }
    public function update(User $user, Job $model): bool { return $user->recruiter?->id === $model->recruiter_id || $user->isAdmin(); }
    public function delete(User $user, Job $model): bool { return $user->recruiter?->id === $model->recruiter_id || $user->isAdmin(); }
}
