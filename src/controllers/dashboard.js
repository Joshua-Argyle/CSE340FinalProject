import { getAdminDashboardUsers } from '../models/dashboard.js';

const getDashboardGreeting = (user) => {
    const roleName = user?.roleName;

    if (roleName === 'admin') {
        return `Welcome admin ${user.name}`;
    }

    if (roleName === 'employee') {
        return `Welcome team member ${user.name}`;
    }

    return `Welcome ${user.name}`;
};

const showDashboard = async (req, res) => {
    const user = req.session?.user;

    if (!user) {
        req.flash('error', 'You must be logged in to view the dashboard.');
        return res.redirect('/login');
    }

    const greeting = getDashboardGreeting(user);
    const isAdmin = user.roleName === 'admin';
    let users = [];

    if (isAdmin) {
        try {
            users = await getAdminDashboardUsers();
        } catch (error) {
            console.error('Error loading dashboard users:', error.message);
            req.flash('error', 'Unable to load users for dashboard.');
        }
    }

    return res.render('dashboard', {
        title: 'Dashboard',
        greeting,
        isAdmin,
        users
    });
};

export { showDashboard };
