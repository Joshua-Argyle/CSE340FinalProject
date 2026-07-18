import { getAllCategories, getAllVehicles } from '../models/vehicles/vehicles.js';

/**
 * Display protected inventory management page (requires login).
 */
const showInventoryManagement = async (req, res) => {
    const user = req.session.user;
    const roleName = user?.roleName;

    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }

    if (req.session?.user && req.session.user.password) {
        console.error('Security error: password found in session.user');
        delete req.session.user.password;
    }

    if (roleName !== 'admin' && roleName !== 'employee') {
        req.flash('error', 'Only employees and admins can access inventory management.');
        return res.redirect('/');
    }

    let vehicles = [];
    let categories = [];
    try {
        vehicles = await getAllVehicles();
        categories = await getAllCategories();
    } catch (error) {
        console.error('Error loading inventory vehicles:', error);
        req.flash('error', 'Unable to load inventory data right now.');
    }

    return res.render('inventory', {
        title: 'Inventory Management',
        user,
        vehicles,
        categories,
        isAdmin: roleName === 'admin'
    });
};

export { showInventoryManagement };