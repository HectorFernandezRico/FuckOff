<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Listar usuarios
    public function index()
    {
        $users = User::all();
        return response()->json(['data' => $users], Response::HTTP_OK);
    }

    // Mostrar usuario
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json(['data' => $user], Response::HTTP_OK);
    }

    // Crear usuario (registro rápido)
    public function store(Request $request)
    {
        // Validación: ajusta según tu migración (nombre, email, password, etc.)
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        // Encriptar contraseña
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json(['data' => $user], Response::HTTP_CREATED);
    }

    // Actualizar usuario
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['data' => $user], Response::HTTP_OK);
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}