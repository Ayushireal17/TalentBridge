<?php
namespace App\Policies;
use App\Models\Application;
use App\Models\User;
class ApplicationPolicy
{
    public function view(User $user, Application $model): bool { return $user->id === $model->user_id; }
    public function delete(User $user, Application $model): bool { return $user->id === $model->user_id; }
}
