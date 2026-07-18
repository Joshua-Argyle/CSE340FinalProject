import { validationResult } from 'express-validator';
import {
    getAllCategories,
    createCategory,
    deleteCategoryById,
    getAllVehicles,
    getVehicleById,
    getVehicleByVin,
    getVehiclesByCategory,
    getVehicleCount,
    editVehicleInfo,
    createVehicleAdmin,
    updateVehicleById,
    deleteVehicle
} from '../../models/vehicles/vehicles.js';

// Route handler for the vehicle catalog list page
const catalogPage = async (req, res) => {
    const categoryValue = req.query.category || 'all';
    let vehicles = [];
    const categories = await getAllCategories();

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
        categories,
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

const randomVehicleGetter = async (req, res, next) => {
    const vehicles = await getAllVehicles();

    if (!vehicles || vehicles.length === 0) {
        res.locals.featuredVehicle = null;
        return next();
    }

    const randomIndex = Math.floor(Math.random() * vehicles.length);
    res.locals.featuredVehicle = vehicles[randomIndex];
    return next();
};

const showCreateVehicleForm = (req, res) => {
    const user = req.session?.user;

    if (!user) {
        req.flash('error', 'You must be logged in to create vehicles.');
        return res.redirect('/login');
    }

    if (user.roleName !== 'admin') {
        req.flash('error', 'Only admins can create vehicles.');
        return res.redirect('/inventory');
    }

    return res.render('vehicles/create', {
        title: 'Create Vehicle',
        user,
        categories: req.categories || []
    });
};

const ensureAdminAccess = (req, res) => {
    const user = req.session?.user;

    if (!user) {
        req.flash('error', 'You must be logged in to manage categories.');
        res.redirect('/login');
        return null;
    }

    if (user.roleName !== 'admin') {
        req.flash('error', 'Only admins can manage categories.');
        res.redirect('/inventory');
        return null;
    }

    return user;
};

const loadCategoriesForVehicleForm = async (req, res, next) => {
    try {
        req.categories = await getAllCategories();
    } catch (error) {
        console.error('Error loading categories for vehicle form:', error.message);
        req.flash('error', 'Unable to load categories right now.');
        return res.redirect('/inventory');
    }

    return next();
};

const handleCreateCategory = async (req, res) => {
    const errors = validationResult(req);

    if (!ensureAdminAccess(req, res)) {
        return;
    }

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/inventory');
    }

    try {
        await createCategory(req.body.category_name);
        req.flash('success', 'Category created.');
    } catch (error) {
        console.error('Error creating category:', error.message);
        req.flash('error', error.code === '23505'
            ? 'That category already exists.'
            : `Unable to create category: ${error.message}`);
    }

    return res.redirect('/inventory');
};

const handleDeleteCategory = async (req, res) => {
    const errors = validationResult(req);

    if (!ensureAdminAccess(req, res)) {
        return;
    }

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/inventory');
    }

    try {
        const deletedCategory = await deleteCategoryById(Number(req.params.categoryId));
        if (!deletedCategory) {
            req.flash('error', 'Category not found.');
            return res.redirect('/inventory');
        }

        req.flash('success', `Category "${deletedCategory.name}" deleted. Vehicles were moved to car if needed.`);
    } catch (error) {
        console.error('Error deleting category:', error.message);
        req.flash('error', `Unable to delete category: ${error.message}`);
    }

    return res.redirect('/inventory');
};

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
const handleCreateVehicle = async (req, res) => {
    const errors = validationResult(req);
    const vehicleId = req.params.vehicleId;
    const editVehicleId = req.body.editVehicleId;
    const sourceVehicleId = editVehicleId || vehicleId;
    const isCreateRequest = !sourceVehicleId;
    const failureRedirect = isCreateRequest ? '/inventory/vehicles/new' : '/inventory';
    const user = req.session?.user;
    const userId = user?.user_id || user?.id;
    const roleName = user?.roleName;

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(failureRedirect);
    }

    if (!userId) {
        req.flash('error', 'You must be logged in as employee or admin to see this page.');
        return res.redirect('/login');
    }

    if (roleName !== 'admin' && roleName !== 'employee') {
        req.flash('error', 'Only employees and admins can edit vehicles.');
        return res.redirect(failureRedirect);
    }

    try {
        if (roleName === 'admin') {
            let baseVehicle = null;

            if (sourceVehicleId) {
                baseVehicle = await editVehicleInfo(sourceVehicleId);
                if (!baseVehicle) {
                    req.flash('error', 'Vehicle not found.');
                    return res.redirect('/catalog');
                }
            }

            const category_id = req.body.category_id ?? baseVehicle?.category_id;
            const make = req.body.make ?? baseVehicle?.make;
            const model = req.body.model ?? baseVehicle?.model;
            const year = req.body.year ?? baseVehicle?.year;
            const price = req.body.price ?? baseVehicle?.price;
            const mileage = req.body.mileage ?? baseVehicle?.mileage;
            const color = req.body.color ?? baseVehicle?.color;
            const transmission = req.body.transmission ?? baseVehicle?.transmission;
            const fuel_type = req.body.fuel_type ?? baseVehicle?.fuel_type;
            const drivetrain = req.body.drivetrain ?? baseVehicle?.drivetrain;
            const vin = req.body.vin ?? baseVehicle?.vin;
            const description = req.body.description ?? baseVehicle?.description;
            const status = req.body.status ?? baseVehicle?.status;
            const image_url = req.body.image_url ?? baseVehicle?.image_url;
            const image_description = req.body.image_description ?? baseVehicle?.image_description;

            if (sourceVehicleId) {
                await updateVehicleById(
                    sourceVehicleId,
                    category_id,
                    make,
                    model,
                    year,
                    price,
                    mileage,
                    color,
                    transmission,
                    fuel_type,
                    drivetrain,
                    vin,
                    description,
                    status,
                    image_url,
                    image_description
                );
            } else {
                await createVehicleAdmin(
                    category_id,
                    make,
                    model,
                    year,
                    price,
                    mileage,
                    color,
                    transmission,
                    fuel_type,
                    drivetrain,
                    vin,
                    description,
                    status,
                    image_url,
                    image_description
                );
            }
        } else {
            if (!sourceVehicleId) {
                req.flash('error', 'Employee update requires a vehicle to edit.');
                return res.redirect('/catalog');
            }

            const baseVehicle = await editVehicleInfo(sourceVehicleId);
            if (!baseVehicle) {
                req.flash('error', 'Vehicle not found.');
                return res.redirect('/catalog');
            }

            const image_url = req.body.image_url ?? baseVehicle.image_url;
            const image_description = req.body.image_description ?? baseVehicle.image_description;
            const { price, description, status } = req.body;

            await updateVehicleById(
                sourceVehicleId,
                baseVehicle.category_id,
                baseVehicle.make,
                baseVehicle.model,
                baseVehicle.year,
                price,
                baseVehicle.mileage,
                baseVehicle.color,
                baseVehicle.transmission,
                baseVehicle.fuel_type,
                baseVehicle.drivetrain,
                baseVehicle.vin,
                description,
                status,
                image_url,
                image_description
            );
        }

        req.flash('success', isCreateRequest ? 'Vehicle created.' : 'Vehicle updated.');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Error saving vehicle:', error.message);
        console.error(error.stack);
        req.flash('error', `Unable to create/edit vehicle: ${error.message}`);
        res.redirect(failureRedirect);
    }
};

const handleDeleteVehicle = async (req, res) => {
    const vehicleId = req.params.vehicleId;
    const user = req.session?.user;
    const userId = user?.user_id || user?.id;
    const roleName = user?.roleName;

    if (!userId) {
        req.flash('error', 'You must be logged in to delete vehicles.');
        return res.redirect('/login');
    }

    if (roleName !== 'admin') {
        req.flash('error', 'Only admins can delete vehicles.');
        return res.redirect('/inventory');
    }

    try {
        const deletedVehicle = await deleteVehicle(vehicleId);
        if (!deletedVehicle) {
            req.flash('error', 'Vehicle not found.');
            return res.redirect('/inventory');
        }

        req.flash('success', 'Vehicle deleted successfully.');
        return res.redirect('/inventory');
    } catch (error) {
        console.error('Error deleting vehicle:', error.message);
        console.error(error.stack);
        req.flash('error', `Unable to delete vehicle: ${error.message}`);
        return res.redirect('/inventory');
    }
};

export {
    catalogPage,
    vehicleDetailPage,
    randomVehicleGetter,
    loadCategoriesForVehicleForm,
    showCreateVehicleForm,
    handleCreateVehicle,
    handleDeleteVehicle,
    handleCreateCategory,
    handleDeleteCategory
};