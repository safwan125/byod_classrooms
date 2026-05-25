<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|string|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => 'required|in:teacher,student',
        ]);

        $user = User::create([
            'name'     => $fields['name'],
            'email'    => $fields['email'],
            'password' => Hash::make($fields['password']),
            'role'     => $fields['role'],
        ]);

        // Log device
        $this->logDevice($request, $user);

        $token = $user->createToken('secureclass-token')->plainTextToken;

        return response()->json([
            'user'    => $user,
            'token'   => $token,
            'message' => 'Registration successful',
        ], 201);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password. Please check your credentials.',
            ], 401);
        }

        // Log device
        $this->logDevice($request, $user);

        $token = $user->createToken('secureclass-token')->plainTextToken;

        return response()->json([
            'user'    => $user,
            'token'   => $token,
            'message' => 'Login successful',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    private function logDevice(Request $request, User $user): void
    {
        $ua = $request->userAgent() ?? 'Unknown';
        $browser = 'Unknown';
        if (str_contains($ua, 'Chrome'))       $browser = 'Chrome';
        elseif (str_contains($ua, 'Firefox'))  $browser = 'Firefox';
        elseif (str_contains($ua, 'Safari'))   $browser = 'Safari';
        elseif (str_contains($ua, 'Edge'))     $browser = 'Edge';

        $os = 'Unknown';
        if (str_contains($ua, 'Windows'))      $os = 'Windows';
        elseif (str_contains($ua, 'Mac'))      $os = 'macOS';
        elseif (str_contains($ua, 'Linux'))    $os = 'Linux';
        elseif (str_contains($ua, 'Android'))  $os = 'Android';
        elseif (str_contains($ua, 'iPhone'))   $os = 'iOS';

        Device::updateOrCreate(
            [
                'user_id'    => $user->id,
                'ip_address' => $request->ip(),
                'browser'    => $browser,
            ],
            [
                'device_name'      => $os . ' / ' . $browser,
                'operating_system' => $os,
                'status'           => 'active',
            ]
        );
    }
}
