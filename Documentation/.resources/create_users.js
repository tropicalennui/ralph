// Background Script: Create PDI User Accounts
// Run as: system administrator with security_admin elevation
// Navigate to: System Definition > Scripts - Background

var users = [
        {
            user_name: 'rosemary',
            first_name: 'Rosemary',
            last_name: '',
            email: 'rosemary@example.com',
            roles: ['admin', 'security_admin']
        },
        {
            user_name: 'svc.claude',
            first_name: 'Claude',
            last_name: 'Service Account',
            email: 'svc.claude@example.com',
            roles: ['admin', 'snc_readonly']
        }
    ];

users.forEach(function (def) {
    // Check if user already exists
    var existing = new GlideRecord('sys_user');
    existing.addQuery('user_name', def.user_name);
    existing.query();
    if (existing.next()) {
        gs.print('User already exists, skipping: ' + def.user_name);
        return;
    }

    // Create the user
    var user = new GlideRecord('sys_user');
    user.initialize();
    user.setValue('user_name', def.user_name);
    user.setValue('first_name', def.first_name);
    user.setValue('last_name', def.last_name);
    user.setValue('email', def.email);
    user.setValue('active', true);
    var userSysId = user.insert();

    if (!userSysId) {
        gs.print('ERROR: Failed to create user: ' + def.user_name);
        return;
    }
    gs.print('Created user: ' + def.user_name + ' (' + userSysId + ')');

    // Assign roles
    def.roles.forEach(function (roleName) {
        var role = new GlideRecord('sys_user_role');
        role.addQuery('name', roleName);
        role.query();
        if (!role.next()) {
            gs.print('WARNING: Role not found, skipping: ' + roleName);
            return;
        }

        var hasRole = new GlideRecord('sys_user_has_role');
        hasRole.initialize();
        hasRole.setValue('user', userSysId);
        hasRole.setValue('role', role.getUniqueValue());
        hasRole.setValue('inherited', false);
        hasRole.insert();
        gs.print('  Assigned role: ' + roleName);
    });
});

gs.print('Done.');
