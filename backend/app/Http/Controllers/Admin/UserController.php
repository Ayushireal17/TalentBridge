<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::withTrashed()
            ->when($request->role,   fn($q) => $q->where("role",$request->role))
            ->when($request->search, fn($q) => $q->where("name","like","%{$request->search}%")->orWhere("email","like","%{$request->search}%"))
            ->latest()->paginate(20);
        return response()->json(["success"=>true,"data"=>$users->items(),"meta"=>["total"=>$users->total()]]);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(["success"=>true,"data"=>$user->load("recruiter")]);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->trashed() ? $user->restore() : $user->delete();
        return response()->json(["success"=>true,"message"=>$user->trashed()?"Deactivated":"Activated"]);
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        $request->validate(["role"=>["required","in:candidate,recruiter,admin"]]);
        $user->update(["role"=>$request->role]);
        return response()->json(["success"=>true,"data"=>$user->fresh()]);
    }
}
