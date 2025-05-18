<?php 

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user1 = User::create([
            'name' => 'Admin',
            'email' => 'admin@exceletacademy.com',
            'password' => bcrypt('admin@admin@admin'), // Be sure to hash passwords!
            'email_verified_at' => Carbon::now(),
        ]);

        $user2 = User::create([
            'name' => 'Yohannes K',
            'email' => 'yohannesk2022@gmail.com',
            'password' => bcrypt('admin@admin@admin'), // Be sure to hash passwords!
            'email_verified_at' => Carbon::now(),
        ]);

        $adminRoleApi = Role::where('name', 'admin')->where('guard_name', 'api')->first();
        $adminRoleWeb = Role::where('name', 'admin')->where('guard_name', 'web')->first();

        $user1->assignRole([$adminRoleApi, $adminRoleWeb]);

        $user2->assignRole([$adminRoleApi, $adminRoleWeb]);

        // Get all the permissions by name
        $permissions = [
            'add courses',
            'update courses',
            'delete courses',

            'add chapters',
            'update chapters',
            'delete chapters',

            'add content',
            'update content',
            'delete content',

            'approve subscription',
            'update subscription',
            'delete subscription',

            'add quizzes',
            'update quizzes',
            'delete quizzes',

            'add quiz questions',
            'update quiz questions',
            'delete quiz questions',

            'add exam questions',
            'update exam questions',
            'delete exam questions',

            'can view contents',

            'add exam courses',
            'update exam courses',
            'delete exam courses',

            'can ban',
            'can unban',

            'add worker',
            'update worker',
            'delete worker',

            'add exams',
            'update exams',
            'delete exams',

            'can view subscription',
            'can view dashboard',
            'can view courses',
            'can view exams',
            'can view exam courses',
            'can view students management',
            'can view workers management',
        ];

        // Sync all the permissions to the user
        $user1->syncPermissions($permissions);
        $user2->syncPermissions($permissions);
    }
}
