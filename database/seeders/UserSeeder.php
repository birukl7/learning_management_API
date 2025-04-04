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
        $user = User::create([
            'name' => 'Admin Admin',
            'email' => 'admin@admin.com',
            'password' => bcrypt('admin@admin@admin'), // Be sure to hash passwords!
            'email_verified_at' => Carbon::now(),
        ]);

        $adminRoleApi = Role::where('name', 'admin')->where('guard_name', 'api')->first();
        $adminRoleWeb = Role::where('name', 'admin')->where('guard_name', 'web')->first();

        $user->assignRole([$adminRoleApi, $adminRoleWeb]);

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
        $user->syncPermissions($permissions);
    }
}
