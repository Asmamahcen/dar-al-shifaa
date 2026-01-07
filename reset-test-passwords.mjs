
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testAccounts = [
  'admin@daralshifaa.dz',
  'patient@test.com',
  'pharmacy@test.com',
  'doctor@test.com',
  'cnas@daralshifaa.dz'
];

async function resetPasswords() {
  console.log('Resetting passwords for test accounts...');
  
  const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
  
  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }

  for (const email of testAccounts) {
    const user = users.find(u => u.email === email);
    
    if (user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: 'Password123!' }
      );

      if (updateError) {
        console.error(`Error updating password for ${email}:`, updateError);
      } else {
        console.log(`Successfully reset password for ${email}`);
      }
    } else {
      console.log(`User not found: ${email}`);
    }
  }
}

resetPasswords();
