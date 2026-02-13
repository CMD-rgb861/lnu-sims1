<?php

namespace Tests\Feature;

use App\Models\UserAccount; // or User

use Illuminate\Foundation\Testing\RefreshDatabase;

use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Hash;

use Tests\TestCase;

class UserSecurityTest extends TestCase
{
    use RefreshDatabase; // Resets DB after each test

    /* AUTHENTICATION TESTS */
    public function test_user_can_login_with_correct_credentials()
    {
        $user = UserAccount::factory()->create([
            'password' => Hash::make('MySecretPass!'),
            'is_logged_in' => 0,
            'email_verified' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'MySecretPass!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['user']);
    }

    public function test_user_cannot_login_with_wrong_password()
    {
        $user = UserAccount::factory()->create([
            'is_logged_in' => 0,
            'password' => Hash::make('CorrectPass!'),
            'email_verified' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'WrongPass!',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_logout()
    {
        $user = UserAccount::factory()->create([
            'is_logged_in' => 1,
            'password' => Hash::make('CorrectPass!'),
            'email_verified' => true,
        ]);

        $response =$this->actingAs($user, 'sanctum')
                         ->withSession(['foo' => 'bar'])
                         ->postJson('/api/logout');

        $response->assertStatus(200);
    }

    /* PASSWORD RELATED TESTS */
    public function test_user_can_update_password_with_strong_credentials()
    {
        $user = UserAccount::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/user-settings/security/update', [
            'id' => $user->id, 
            'current_password' => 'OldPassword123!',
            'new_password' => 'NewStrongPass1@', // Meets mixed case/symbol/number rules
        ]);

        $response->assertStatus(200);
        $response->assertJson(['type' => 'success']);

        $user->refresh();
        $this->assertTrue(Hash::check('NewStrongPass1@', $user->password));
    }

    public function test_system_rejects_passwords_missing_requirements()
    {
        $user = UserAccount::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);

        // Fails 'symbols' and 'numbers' rule
        $response = $this->actingAs($user)->putJson('/api/user-settings/security/update', [
            'id' => $user->id,
            'current_password' => 'OldPassword123!',
            'new_password' => 'weakpassword', 
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['new_password']);
    }

    public function test_user_cannot_update_with_wrong_current_password()
    {
        $user = UserAccount::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/user-settings/security/update', [
            'id' => $user->id,
            'current_password' => 'WrongInput!!!', 
            'new_password' => 'NewStrongPass1@',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    /* ADD USER TEST */
    public function test_admin_can_add_new_user()
    {
        DB::table('user_roles')->updateOrInsert(
            ['id' => 1],
            ['description' => 'Superadmin', 'created_at' => now(), 'updated_at' => now()]
        );

        $admin = UserAccount::factory()->create();

        $admin->roles()->attach(1);

        // 2. Act: Call the admin-only add user endpoint
        $response = $this->actingAs($admin)->postJson('/api/c/user-management/add-user', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.new@example.com',
            'contact_num' => '09123456789',
            'role_id' => 1,
            'manual_password_setup' => true,
            'password' => 'InitialPass123!',
        ]);

        // 3. Assert
        $response->assertStatus(201);
        
        $this->assertDatabaseHas('user_accounts', [
            'email' => 'juan.new@example.com',
            'first_name' => 'Juan',
        ]);
    }
}