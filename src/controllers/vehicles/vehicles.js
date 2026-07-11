import { getAllVehicles, getVehicleById, getVehicleByVin } from '../../models/vehicles/vehicles.js';

// Route handler for the vehicle catalog list page
const catalogPage = async (req, res) => {
    const sortBy = req.query.sort || 'category';
    const vehicles = await getAllVehicles(sortBy);

    res.render('vehicles/list', {
        title: 'Vehicle Catalog',
        vehicles,
        currentSort: sortBy
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

    res.render('vehicles/detail', {
        title: `${vehicle.make} ${vehicle.model}`,
        vehicle,
    });
};

export { catalogPage, vehicleDetailPage };