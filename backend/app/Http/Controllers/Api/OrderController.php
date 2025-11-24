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
    // Constantes de negocio
    private const TAX_RATE = 0.21; // IVA 21%
    private const SHIPPING_COST = 5.00; // Coste de envío fijo

    // Listar órdenes
    public function index()
    {
        // Cargar relación con usuario para mostrar en admin
        $orders = Order::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $orders], Response::HTTP_OK);
    }

    // Mostrar una orden
    public function show($id)
    {
        // Devolver la orden (puedes cargar items si lo deseas)
        $order = Order::findOrFail($id);
        return response()->json(['data' => $order], Response::HTTP_OK);
    }

    // Crear una orden con sus items
    public function store(Request $request)
    {
        // Validación completa
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'nullable',
            'status' => 'nullable|string',
        ]);

        // Operación en transacción para mantener consistencia
        DB::beginTransaction();
        try {
            // Calcular total con IVA incluido y validar stock
            $totalWithTax = 0;
            $itemsToInsert = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Verificar que el producto esté activo
                if (!$product->active) {
                    throw new \Exception("El producto {$product->name} no está disponible");
                }

                // Verificar stock disponible
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stock insuficiente para el producto: {$product->name}. Disponible: {$product->stock}, Solicitado: {$item['quantity']}");
                }

                $unitPrice = $product->price; // Precio YA incluye IVA
                $itemTotal = $unitPrice * $item['quantity'];
                $totalWithTax += $itemTotal;

                // Preparar fila para order_items
                $itemsToInsert[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                ];

                // REDUCIR STOCK
                $product->stock -= $item['quantity'];
                $product->save();
            }

            // Extraer IVA del total (precio ya incluye IVA)
            // Si el precio con IVA es 121€, entonces: base = 121 / 1.21 = 100€, IVA = 21€
            $subtotal = round($totalWithTax / (1 + self::TAX_RATE), 2);
            $tax = round($totalWithTax - $subtotal, 2);

            // Calcular total final: total productos (con IVA incluido) + envío
            $total = $totalWithTax + self::SHIPPING_COST;

            // Preparar shipping_address como JSON o texto
            $shippingAddress = isset($data['shipping_address'])
                ? (is_array($data['shipping_address']) ? json_encode($data['shipping_address']) : $data['shipping_address'])
                : null;

            // Crear orden con los nombres correctos de columnas
            $order = Order::create([
                'user_id' => $data['user_id'] ?? auth()->id() ?? null,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => self::SHIPPING_COST,
                'total_price' => $total,
                'status' => $data['status'] ?? 'pending',
                'shipping_address' => $shippingAddress,
            ]);

            // Insertar items relacionados en la tabla order_items
            foreach ($itemsToInsert as $it) {
                $it['order_id'] = $order->id;
                $it['created_at'] = now();
                $it['updated_at'] = now();
            }
            DB::table('order_items')->insert($itemsToInsert);

            DB::commit();

            // Cargar relación user si existe
            $order->load('user');

            return response()->json(['data' => $order], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error creando la orden',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar orden (por ejemplo, cambiar estado)
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $data = $request->validate([
            'status' => 'sometimes|required|string|in:pending,processing,shipped,delivered,cancelled',
        ]);

        // Si el estado cambia a "cancelled", restaurar el stock + 1 adicional
        if (isset($data['status']) && $data['status'] === 'cancelled' && $order->status !== 'cancelled') {
            DB::beginTransaction();
            try {
                // Cargar items de la orden con productos
                $orderItems = DB::table('order_items')
                    ->where('order_id', $order->id)
                    ->get();

                // Restaurar stock de cada producto + 1 unidad adicional por cancelación
                foreach ($orderItems as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        // Restaurar la cantidad original + 1 unidad adicional
                        $product->stock += ($item->quantity + 1);
                        $product->save();
                    }
                }

                // Actualizar estado de la orden
                $order->update($data);

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Error al cancelar la orden',
                    'message' => $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            // Si no se cancela, solo actualizar normalmente
            $order->update($data);
        }

        $order->load('user');

        return response()->json(['data' => $order], Response::HTTP_OK);
    }

    // Borrar orden
    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        DB::beginTransaction();
        try {
            // Solo restaurar stock si la orden no estaba cancelada o ya entregada
            if (!in_array($order->status, ['cancelled', 'delivered'])) {
                // Cargar items de la orden
                $orderItems = DB::table('order_items')
                    ->where('order_id', $order->id)
                    ->get();

                // Restaurar stock de cada producto
                foreach ($orderItems as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->stock += $item->quantity;
                        $product->save();
                    }
                }
            }

            // Eliminar items de la orden manualmente si no hay CASCADE
            DB::table('order_items')->where('order_id', $order->id)->delete();

            // Eliminar la orden
            $order->delete();

            DB::commit();

            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al eliminar la orden',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}