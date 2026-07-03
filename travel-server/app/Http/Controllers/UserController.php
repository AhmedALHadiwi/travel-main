<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
class UserController extends Controller
{

    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $users->toArray(),
            'message' => 'Users fetched successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validation = Validator::make($request->all(), [
            'first_name' => 'required|max:255',
            'last_name' => 'required|max:255',
            'user_name' => 'required|max:255',
            // 'email' => 'required|email|unique:users',
            'email' => [
            'required',
            'email',
            Rule::unique('users')->whereNull('deleted_at'), // تعديل هنا
                     ],
            'password' => 'required|min:6|confirmed',
            'phone' => 'required',
            'address' => 'required',
            'date_of_birth' => 'required|date',
            'bio' => 'nullable|min:10|max:100',
            'avatar_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'role_id' => 'required|integer',
            // 'salary' => 'required|string',
            // 'payment_method' => 'required|string',
                ]);

                if ($validation->fails()) {
                    return response()->json([
                        'status' => false,
                        'errors' => $validation->errors()
                    ], 422);
                }
         // تحقق من وجود الصورة
                if ($request->hasFile('avatar_url')) {
                     $file = $request->file('avatar_url');

                     // اسم فريد للملف
                     $fileName = time() . '_' . $file->getClientOriginalName();

                     // تخزين الملف في مجلد public/users
                     $file->move(public_path('uploads/users'), $fileName);

                     // حفظ اسم الصورة فقط في الداتابيز
                     $avatarPath = $fileName;
                 } else {
                     $avatarPath = null;
                 }

                $user = new User();
                $user->first_name = $request->first_name;
                $user->name = $request->name;
                $user->last_name = $request->last_name;
                $user->user_name = $request->user_name;
                $user->email = $request->email;
                $user->password = bcrypt($request->password);
                $user->phone = $request->phone;
                $user->address = $request->address;
                $user->date_of_birth = $request->date_of_birth;
                $user->avatar_url =$avatarPath;
                $user->bio = $request->bio;
                $user->status = $request->status;
                $user->role_id = $request->role_id;
                // $user->salary = $request->salary;
                // $user->payment_method = $request->payment_method;
                $user->save();

                return response()->json([
                    'status' => true,
                    'data' => [$user->toArray()],
                    'message' => 'User created successfully'
                ], 201);
    }

     public function update(Request $request, $id)
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['status' => false, 'message' => 'User not found'], 404);
    }

    $validation = Validator::make($request->all(), [
        'first_name' => 'sometimes|required|max:255',
        'last_name'  => 'sometimes|required|max:255',
        'user_name'  => 'sometimes|required|max:255',
        'email'      => [
            'sometimes', 'required', 'email',
            Rule::unique('users', 'email')->ignore($id)->whereNull('deleted_at')
        ],
        'password'   => 'nullable|min:6',
        'phone'      => 'nullable|string',
        'bio'        => 'nullable|string|min:10|max:100',
        'role_id'    => 'sometimes|required|exists:roles,id',
        'status'     => 'nullable|in:active,deactivated',
        'avatar_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    ]);

    if ($validation->fails()) {
        return response()->json(['status' => false, 'errors' => $validation->errors()], 422);
    }

    // تحديث الصورة لو موجودة
    if ($request->hasFile('avatar_url')) {
        if ($user->avatar_url && file_exists(public_path('uploads/users/' . $user->avatar_url))) {
            @unlink(public_path('uploads/users/' . $user->avatar_url));
        }
        $fileName = time() . '_' . uniqid() . '.' . $request->file('avatar_url')->getClientOriginalExtension();
        $request->file('avatar_url')->move(public_path('uploads/users'), $fileName);
        $user->avatar_url = $fileName;
    }

    // تحديث باقي الحقول
    foreach (['first_name', 'last_name', 'user_name', 'email', 'phone', 'bio', 'role_id', 'status'] as $field) {
        if ($request->filled($field)) {
            $user->$field = $request->$field;
        }
    }

    if ($request->filled('password')) {
        $user->password = bcrypt($request->password);
    }

    $user->save();

    return response()->json([
        'status' => true,
        'message' => 'User updated successfully',
        'data' => $user
    ]);
}
 public function updatePassword(Request $request ){
    $validation = Validator::make($request->all(), [
        'password' => 'required|min:6|confirmed',

    ]);

    if ($validation->fails()) {
        return response()->json(['status' => false, 'errors' => $validation->errors()], 422);
    }
        // Get current user
        $user = Auth::user();

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();
    return response()->json([
        'status' => true,
        'message' => 'User updated successfully',
        // 'data' => $user
    ]);
}

    public function show($id){
        $user = User::with('role')->find($id);
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }
        return response()->json([
            'status' => true,
            'data' => $user->toArray(),
            'message' => 'User fetched successfully'
        ]);
    }
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'status' => true,
            'data' => [],
            'message' => 'User deleted successfully'
        ]);
    }
}
