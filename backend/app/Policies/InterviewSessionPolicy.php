<?php
namespace App\Policies;
use App\Models\InterviewSession;
use App\Models\User;
class InterviewSessionPolicy
{
    public function view(User $user, InterviewSession $model): bool { return $user->id === $model->user_id; }
    public function update(User $user, InterviewSession $model): bool { return $user->id === $model->user_id; }
    public function delete(User $user, InterviewSession $model): bool { return $user->id === $model->user_id; }
}
