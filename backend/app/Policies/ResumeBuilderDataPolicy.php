<?php
namespace App\Policies;
use App\Models\ResumeBuilderData;
use App\Models\User;
class ResumeBuilderDataPolicy
{
    public function view(User $user, ResumeBuilderData $model): bool { return $user->id === $model->user_id; }
    public function update(User $user, ResumeBuilderData $model): bool { return $user->id === $model->user_id; }
    public function delete(User $user, ResumeBuilderData $model): bool { return $user->id === $model->user_id; }
}
