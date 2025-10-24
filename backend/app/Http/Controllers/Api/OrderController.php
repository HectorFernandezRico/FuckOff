<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Response;

class OrderController extends Controller
{
    // Listar órdenes
    public function index()
    {
        // Si tienes relaciones (items, user), usa with(...) para eager loading
        $orders = Order::all();
        return response()->json(['data' => $orders], Response::HTTP_OK);
    }

    // Mostrar una orden
    public function show(Order $order)
    {
        // Devolver la orden (puedes cargar items si lo deseas)
        return response()->json(['data' => $order], Response::HTTP_OK);
    }

    // Crear una orden con sus items (si tus migraciones tienen order_items)
    public function store(Request $request)
    {
        // Validación básica: espera un array 'items' con product_id y quantity
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            // 'status' => 'nullable|string',
        ]);

        // Operación en transacción para mantener consistencia
        DB::beginTransaction();
        try {
            // Calcula total simple (puedes adaptar según tu lógica: price histórico, descuentos, etc.)
            $total = 0;
            $itemsToInsert = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $price = $product->price ?? 0; // asegúrate que el modelo Product tiene 'price'
                $subtotal = $price * $item['quantity'];
                $total += $subtotal;

                // Preparar fila para order_items
                $itemsToInsert[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    // 'created_at' / 'updated_at' serán añadidos automáticamente si tu tabla lo requiere
                ];
            }

            // Crear orden
            $order = Order::create([
                'user_id' => $data['user_id'] ?? null,
                'total' => $total,
                // 'status' => $data['status'] ?? 'pending',
            ]);

            // Insertar items relacionados en la tabla order_items
            // Ajusta los nombres de columnas si difieren en tu migración
            foreach ($itemsToInsert as $it) {
                $it['order_id'] = $order->id;
                $it['created_at'] = now();
                $it['updated_at'] = now();
            }
            DB::table('order_items')->insert($itemsToInsert);

            DB::commit();

            return response()->json(['data' => $order->fresh()], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            DB::rollBack();
            // Retornar error 500 con mensaje (en producción evita mostrar $e->getMessage())
            return response()->json(['error' => 'Error creando la orden', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar orden (por ejemplo, cambiar estado)
    public function update(Request $request, Order $order)
    {
        // Validación simple — ajusta según tu esquema
        $data = $request->validate([
            // 'status' => 'sometimes|required|string',
        ]);

        $order->update($data);
        return response()->json(['data' => $order], Response::HTTP_OK);
    }

    // Borrar orden
    public function destroy(Order $order)
    {
        // Si quieres borrar también order_items, asegúrate de que tu DB tenga ON DELETE CASCADE o hazlo manualmente
        $order->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}