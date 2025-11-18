<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categorías
        $categories = [
            ['name' => 'Camisetas', 'slug' => 'camisetas'],
            ['name' => 'Pantalones', 'slug' => 'pantalones'],
            ['name' => 'Sudaderas', 'slug' => 'sudaderas'],
            ['name' => 'Chaquetas', 'slug' => 'chaquetas'],
            ['name' => 'Accesorios', 'slug' => 'accesorios'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Obtener IDs de categorías por slug
        $camisetasId = Category::where('slug', 'camisetas')->first()->id;
        $pantalonesId = Category::where('slug', 'pantalones')->first()->id;
        $sudaderasId = Category::where('slug', 'sudaderas')->first()->id;
        $chaquetasId = Category::where('slug', 'chaquetas')->first()->id;
        $accesoriosId = Category::where('slug', 'accesorios')->first()->id;

        // Crear 20 productos
        $products = [
            [
                'name' => 'Camiseta Básica Blanca',
                'slug' => 'camiseta-basica-blanca',
                'description' => 'Camiseta de algodón 100% en color blanco',
                'price' => 19.99,
                'size' => 'M',
                'stock' => 50,
                'path' => '/images/products/camiseta-blanca.jpg',
                'active' => true,
                'category_id' => $camisetasId,
            ],
            [
                'name' => 'Camiseta Negra Premium',
                'slug' => 'camiseta-negra-premium',
                'description' => 'Camiseta de algodón premium en color negro',
                'price' => 24.99,
                'size' => 'L',
                'stock' => 45,
                'path' => '/images/products/camiseta-negra.jpg',
                'active' => true,
                'category_id' => $camisetasId,
            ],
            [
                'name' => 'Camiseta Estampada',
                'slug' => 'camiseta-estampada',
                'description' => 'Camiseta con estampado moderno',
                'price' => 29.99,
                'size' => 'S',
                'stock' => 30,
                'path' => '/images/products/camiseta-estampada.jpg',
                'active' => true,
                'category_id' => $camisetasId,
            ],
            [
                'name' => 'Jeans Azul Clásico',
                'slug' => 'jeans-azul-clasico',
                'description' => 'Pantalón vaquero azul de corte clásico',
                'price' => 59.99,
                'size' => 'M',
                'stock' => 35,
                'path' => '/images/products/jeans-azul.jpg',
                'active' => true,
                'category_id' => $pantalonesId,
            ],
            [
                'name' => 'Pantalón Cargo Negro',
                'slug' => 'pantalon-cargo-negro',
                'description' => 'Pantalón cargo con múltiples bolsillos',
                'price' => 49.99,
                'size' => 'L',
                'stock' => 25,
                'path' => '/images/products/cargo-negro.jpg',
                'active' => true,
                'category_id' => $pantalonesId,
            ],
            [
                'name' => 'Chinos Beige',
                'slug' => 'chinos-beige',
                'description' => 'Pantalón chino en color beige',
                'price' => 54.99,
                'size' => 'M',
                'stock' => 40,
                'path' => '/images/products/chinos-beige.jpg',
                'active' => true,
                'category_id' => $pantalonesId,
            ],
            [
                'name' => 'Sudadera Con Capucha Gris',
                'slug' => 'sudadera-capucha-gris',
                'description' => 'Sudadera con capucha en color gris',
                'price' => 44.99,
                'size' => 'XL',
                'stock' => 38,
                'path' => '/images/products/sudadera-gris.jpg',
                'active' => true,
                'category_id' => $sudaderasId,
            ],
            [
                'name' => 'Sudadera Básica Negra',
                'slug' => 'sudadera-basica-negra',
                'description' => 'Sudadera sin capucha en negro',
                'price' => 39.99,
                'size' => 'L',
                'stock' => 42,
                'path' => '/images/products/sudadera-negra.jpg',
                'active' => true,
                'category_id' => $sudaderasId,
            ],
            [
                'name' => 'Sudadera Universitaria',
                'slug' => 'sudadera-universitaria',
                'description' => 'Sudadera estilo universitario',
                'price' => 49.99,
                'size' => 'M',
                'stock' => 28,
                'path' => '/images/products/sudadera-universitaria.jpg',
                'active' => true,
                'category_id' => $sudaderasId,
            ],
            [
                'name' => 'Chaqueta Vaquera',
                'slug' => 'chaqueta-vaquera',
                'description' => 'Chaqueta de mezclilla azul',
                'price' => 79.99,
                'size' => 'M',
                'stock' => 20,
                'path' => '/images/products/chaqueta-vaquera.jpg',
                'active' => true,
                'category_id' => $chaquetasId,
            ],
            [
                'name' => 'Chaqueta Bomber',
                'slug' => 'chaqueta-bomber',
                'description' => 'Chaqueta bomber en negro',
                'price' => 89.99,
                'size' => 'L',
                'stock' => 18,
                'path' => '/images/products/bomber-negra.jpg',
                'active' => true,
                'category_id' => $chaquetasId,
            ],
            [
                'name' => 'Chaqueta Impermeable',
                'slug' => 'chaqueta-impermeable',
                'description' => 'Chaqueta deportiva impermeable',
                'price' => 69.99,
                'size' => 'XL',
                'stock' => 22,
                'path' => '/images/products/impermeable.jpg',
                'active' => true,
                'category_id' => $chaquetasId,
            ],
            [
                'name' => 'Gorra Béisbol Negra',
                'slug' => 'gorra-beisbol-negra',
                'description' => 'Gorra de béisbol ajustable',
                'price' => 15.99,
                'size' => 'M',
                'stock' => 60,
                'path' => '/images/products/gorra-negra.jpg',
                'active' => true,
                'category_id' => $accesoriosId,
            ],
            [
                'name' => 'Mochila Urbana',
                'slug' => 'mochila-urbana',
                'description' => 'Mochila para uso diario',
                'price' => 34.99,
                'size' => 'M',
                'stock' => 32,
                'path' => '/images/products/mochila.jpg',
                'active' => true,
                'category_id' => $accesoriosId,
            ],
            [
                'name' => 'Calcetines Pack 3',
                'slug' => 'calcetines-pack-3',
                'description' => 'Pack de 3 pares de calcetines',
                'price' => 12.99,
                'size' => 'M',
                'stock' => 80,
                'path' => '/images/products/calcetines.jpg',
                'active' => true,
                'category_id' => $accesoriosId,
            ],
            [
                'name' => 'Cinturón Cuero Marrón',
                'slug' => 'cinturon-cuero-marron',
                'description' => 'Cinturón de cuero genuino',
                'price' => 24.99,
                'size' => 'M',
                'stock' => 45,
                'path' => '/images/products/cinturon-marron.jpg',
                'active' => true,
                'category_id' => $accesoriosId,
            ],
            [
                'name' => 'Camiseta Polo Azul',
                'slug' => 'camiseta-polo-azul',
                'description' => 'Polo clásico en azul marino',
                'price' => 34.99,
                'size' => 'L',
                'stock' => 36,
                'path' => '/images/products/polo-azul.jpg',
                'active' => true,
                'category_id' => $camisetasId,
            ],
            [
                'name' => 'Shorts Deportivos',
                'slug' => 'shorts-deportivos',
                'description' => 'Shorts deportivos transpirables',
                'price' => 29.99,
                'size' => 'M',
                'stock' => 48,
                'path' => '/images/products/shorts.jpg',
                'active' => true,
                'category_id' => $pantalonesId,
            ],
            [
                'name' => 'Bufanda Lana Gris',
                'slug' => 'bufanda-lana-gris',
                'description' => 'Bufanda de lana tejida',
                'price' => 19.99,
                'size' => 'M',
                'stock' => 25,
                'path' => '/images/products/bufanda-gris.jpg',
                'active' => true,
                'category_id' => $accesoriosId,
            ],
            [
                'name' => 'Guantes Invierno',
                'slug' => 'guantes-invierno',
                'description' => 'Guantes térmicos para invierno',
                'price' => 16.99,
                'size' => 'L',
                'stock' => 30,
                'path' => '/images/products/guantes.jpg',
                'active' => true,
                'category_id' => $accesoriosId,
            ],
        ];

        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        foreach ($products as $productData) {
            $product = Product::create($productData);

            // Crear tallas para cada producto distribuyendo el stock total
            $totalStock = $productData['stock'];
            $stockPerSize = floor($totalStock / count($sizes));
            $remainder = $totalStock % count($sizes);

            foreach ($sizes as $index => $size) {
                // Distribuir el stock equitativamente, y el resto lo añadimos a la talla M
                $sizeStock = $stockPerSize;
                if ($size === 'M' && $remainder > 0) {
                    $sizeStock += $remainder;
                }

                ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $size,
                    'stock' => $sizeStock
                ]);
            }
        }

        $this->command->info('Se han creado ' . count($categories) . ' categorías y ' . count($products) . ' productos con sus tallas exitosamente.');
    }
}
