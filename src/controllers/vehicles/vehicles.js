import { getAllVehicles, getVehicleById, getVehicleByVin, getVehiclesByCategory } from '../../models/vehicles/vehicles.js';

// Route handler for the vehicle catalog list page
const catalogPage = async (req, res) => {
    const categoryValue = req.query.category || 'all';
    let vehicles = [];

    if (categoryValue === 'all') {
        vehicles = await getAllVehicles();
    } else {
        const categoryId = Number(categoryValue);
        vehicles = Number.isInteger(categoryId)
            ? await getVehiclesByCategory(categoryId)
            : [];
    }

    res.render('vehicles/list', {
        title: 'Vehicle Catalog',
        vehicles,
        currentCategory: categoryValue
    });
};

// Route handler for individual vehicle detail pages
const vehicleDetailPage = async (req, res, next) => {
    const vehicleIdentifier = req.params.vehicleId;
    const vehicle = Number.isInteger(Number(vehicleIdentifier))
        ? await getVehicleById(vehicleIdentifier)
        : await getVehicleByVin(vehicleIdentifier);

    // If vehicle doesn't exist, create 404 error
    if (!vehicle || Object.keys(vehicle).length === 0) {
        const err = new Error(`Vehicle ${vehicleIdentifier} not found`);
        err.status = 404;
        return next(err);
    }

    req.vehicle = vehicle;
    res.locals.vehicle = vehicle;
    res.locals.title = `${vehicle.make} ${vehicle.model}`;
    return next();
};

export { catalogPage, vehicleDetailPage };