<?php

namespace Database\Seeders;

use App\Models\Chapter;
use App\Models\Content;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Content::query()->delete();
        
        if(DB::table('contents')->count() === 0 ){
            
            $chapters = Chapter::all();
            $chapters->each(function($chapter){
                foreach(range(1, 2) as $order){
                    Content::factory()->create([
                        'chapter_id' => $chapter->id,
                        'order' => $order,
                        'name' => fake()->name,
                    ]);
                }
            });
        }
    }
}
