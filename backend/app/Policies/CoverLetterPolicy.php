<?php
namespace App\Policies;
use App\Models\CoverLetter;
use App\Models\User;
class CoverLetterPolicy
{
    public function view(User $user, CoverLetter $model): bool { return $user->id === $model->user_id; }
    public function update(User $user, CoverLetter $model): bool { return $user->id === $model->user_id; }
    public function delete(User $user, CoverLetter $model): bool { return $user->id === $model->user_id; }
}
