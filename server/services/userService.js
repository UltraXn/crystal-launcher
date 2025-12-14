const supabase = require('./supabaseService');

/**
 * Get all users from Supabase Auth (Requires Service Role)
 * Note: 'auth.users' is a system table. We should fetch from 'public.profiles' if synced,
 * but for roles management often we interact with auth metadata or custom profile field.
 * For this implementation, we will fetch from public.profiles and assume it has role field,
 * OR we fetch auth.users using listUsers() admin method.
 */
const getAllUsers = async (query = '') => {
    // Using Supabase Admin API to list users
    // If you have a LOT of users, you should rely on server-side pagination or search if available.
    // Standard Supabase List Users does not search by email easily. We will filter in memory for now.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    
    let filtered = users;
    if(query) {
        filtered = users.filter(u => u.email && u.email.toLowerCase().includes(query.toLowerCase()));
    }

    // Map to a friendlier format
    return filtered.map(u => ({
        id: u.id,
        email: u.email,
        role: u.user_metadata?.role || 'user', // Read from metadata
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at
    }));
};

/**
 * Update user role
 * We will store the role in user_metadata for simplicity
 */
const updateUserRole = async (userId, newRole) => {
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: newRole } }
    );

    if (error) throw error;
    return user;
};

module.exports = {
    getAllUsers,
    updateUserRole
};
