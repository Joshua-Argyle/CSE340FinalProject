import db from '../db.js';

const mapVehicleRow = (vehicle) => ({
    vehicleId: vehicle.vehicle_id,
    categoryId: vehicle.category_id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    color: vehicle.color,
    transmission: vehicle.transmission,
    fuelType: vehicle.fuel_type,
    drivetrain: vehicle.drivetrain,
    vin: vehicle.vin,
    description: vehicle.description,
    status: vehicle.status,
    categoryName: vehicle.category_name,
    imageUrl: vehicle.image_url,
    imageDescription: vehicle.image_description
});

const mapCategoryRow = (category) => ({
    categoryId: category.category_id,
    name: category.name,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
    vehicleCount: Number(category.vehicle_count || 0)
});

const ensureDefaultCarCategory = async () => {
    const existingCategoryResult = await db.query(
        `
        SELECT category_id
        FROM categories
        WHERE LOWER(name) = 'car'
        LIMIT 1
        `
    );

    if (existingCategoryResult.rowCount > 0) {
        return existingCategoryResult.rows[0].category_id;
    }
// If car default category doesn't exist, do this:
    const insertResult = await db.query(
        `
        INSERT INTO categories (category_id, name)
        SELECT COALESCE(MAX(category_id), 0) + 1, 'car'
        FROM categories
        RETURNING category_id
        `
    );

    return insertResult.rows[0].category_id;
};

const getAllCategories = async () => {
    await ensureDefaultCarCategory();

    const query = `
        SELECT c.category_id, c.name, c.created_at, c.updated_at, COUNT(v.vehicle_id) AS vehicle_count
        FROM categories c
        LEFT JOIN vehicles v ON c.category_id = v.category_id
        GROUP BY c.category_id, c.name, c.created_at, c.updated_at
        ORDER BY LOWER(c.name), c.category_id
    `;

    const result = await db.query(query);
    return result.rows.map(mapCategoryRow);
};

const getCategoryById = async (categoryId) => {
    const query = `
        SELECT category_id, name, created_at, updated_at
        FROM categories
        WHERE category_id = $1
        LIMIT 1
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
};

const createCategory = async (name) => {
    const query = `
        INSERT INTO categories (category_id, name)
        SELECT COALESCE(MAX(category_id), 0) + 1, $1
        FROM categories
        RETURNING category_id, name, created_at, updated_at
    `;

    const result = await db.query(query, [name]);
    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
};

const deleteCategoryById = async (categoryId) => {
    try {
        await db.query('BEGIN');

        const categoryIdToDelete = Number(categoryId);
        const carCategoryId = await ensureDefaultCarCategory();

        if (categoryIdToDelete === Number(carCategoryId)) {
            throw new Error('The default car category cannot be deleted.');
        }

        // Move all vehicles from the category being deleted into the car category.
        await db.query(
            `
            UPDATE vehicles
            SET category_id = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE category_id = $1
            `,
            [categoryIdToDelete, carCategoryId]
        );

        const deleteResult = await db.query(
            `
            DELETE FROM categories
            WHERE category_id = $1
            RETURNING category_id, name, created_at, updated_at
            `,
            [categoryIdToDelete]
        );

        if (!deleteResult.rows[0]) {
            await db.query('ROLLBACK');
            return null;
        }

        await db.query('COMMIT');
        return mapCategoryRow(deleteResult.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

/**
 * Get all vehicles from the database.
 *
 * @returns {Promise<Array>} Array of vehicle objects with category information
 */
const getAllVehicles = async () => {
    const query = `
        SELECT v.vehicle_id, v.category_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status,
               c.name as category_name, i.image_url, i.image_description
        FROM vehicles v
        JOIN categories c ON v.category_id = c.category_id
        JOIN vehicle_images i ON v.vehicle_id = i.vehicle_id
        ORDER BY c.name, v.make, v.model
    `;
    
    const result = await db.query(query);

    return result.rows.map(mapVehicleRow);
};

/**
 * Get a single vehicle by ID or VIN.
 * 
 * @param {string|number} identifier - Vehicle ID or VIN
 * @param {string} identifierType - 'id' or 'vin' (default: 'id')
 * @returns {Promise<Object>} Vehicle object with category info, or empty object if not found
 */
const getVehicle = async (identifier, identifierType = 'id') => {
    const whereClause = identifierType === 'vin' ? 'v.vin = $1' : 'v.vehicle_id = $1';
    
    const query = `
        SELECT v.vehicle_id, v.category_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status,
               c.name as category_name, i.image_url, i.image_description
        FROM vehicles v
        JOIN categories c ON v.category_id = c.category_id
        JOIN vehicle_images i ON v.vehicle_id = i.vehicle_id
        WHERE ${whereClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Return empty object if vehicle not found - this is a common pattern.
     * The calling code can check if the object is empty with Object.keys(result).length
     */
    if (result.rows.length === 0) return {};
    
    return mapVehicleRow(result.rows[0]);
};

/**
 * Get all vehicles in a specific category.
 *
 * @param {number} categoryId - The ID of the category
 * @returns {Promise<Array>} Array of vehicle objects in the specified category
 */
const getVehiclesByCategory = async (categoryId) => {
    const query = `
        SELECT v.vehicle_id, v.category_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status,
               c.name as category_name, i.image_url, i.image_description
        FROM vehicles v
        JOIN categories c ON v.category_id = c.category_id
        JOIN vehicle_images i ON v.vehicle_id = i.vehicle_id
        WHERE v.category_id = $1
        ORDER BY c.name, v.make, v.model
    `;
    
    const result = await db.query(query, [categoryId]);

    return result.rows.map(mapVehicleRow);
};

/**
 * Get total number of vehicles in the database.
 *
 * @returns {Promise<number>} Total count of vehicle records
 */
const getVehicleCount = async () => {
    const query = `
        SELECT COUNT(vehicle_id) AS vehicle_count
        FROM vehicles
    `;

    const result = await db.query(query);
    return Number(result.rows[0].vehicle_count);
};

//Below are functions used by employees and admins.

const editVehicleInfoEmployee = async (vehicleId) => {

    const query = `
        SELECT v.price, v.description, v.status, i.image_url, i.image_description
        FROM vehicles v
        JOIN vehicle_images i ON v.vehicle_id = i.vehicle_id
        WHERE vehicle_id = $1
    
    `;

    const result = await db.query(query, [vehicleId]);
    return result.rows[0];

};

const editVehicleInfo = async (vehicleId) => {

    const query = `
        SELECT v.category_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status, i.image_url, i.image_description
        FROM vehicles v
        JOIN vehicle_images i ON v.vehicle_id = i.vehicle_id
        WHERE v.vehicle_id = $1
    
    `;

    const result = await db.query(query, [vehicleId]);
    return result.rows[0];

};

const createVehicleAdmin = async (
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
) => {
    try {
        await db.query('BEGIN');

        const vehicleResult = await db.query(
            `
            INSERT INTO vehicles (category_id, make, model, year, price, mileage, color, transmission, fuel_type, drivetrain, vin, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
            `,
            [category_id, make, model, year, price, mileage, color, transmission, fuel_type, drivetrain, vin, description, status]
        );

        await db.query(
            `
            INSERT INTO vehicle_images (vehicle_id, image_url, image_description)
            VALUES ($1, $2, $3)
            `,
            [vehicleResult.rows[0].vehicle_id, image_url, image_description]
        );

        await db.query('COMMIT');
        return vehicleResult.rows[0];
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

const updateVehicleById = async (
    vehicleId,
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
) => {
    try {
        await db.query('BEGIN');

        const vehicleResult = await db.query(
            `
            UPDATE vehicles
            SET category_id = $2,
                make = $3,
                model = $4,
                year = $5,
                price = $6,
                mileage = $7,
                color = $8,
                transmission = $9,
                fuel_type = $10,
                drivetrain = $11,
                vin = $12,
                description = $13,
                status = $14,
                updated_at = CURRENT_TIMESTAMP
            WHERE vehicle_id = $1
            RETURNING *;
            `,
            [
                vehicleId,
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
                status
            ]
        );

        if (!vehicleResult.rows[0]) {
            await db.query('ROLLBACK');
            return null;
        }

        const imageUpdateResult = await db.query(
            `
            UPDATE vehicle_images
            SET image_url = $2,
                image_description = $3
            WHERE vehicle_id = $1
            `,
            [vehicleId, image_url, image_description]
        );

        if (imageUpdateResult.rowCount === 0) {
            await db.query(
                `
                INSERT INTO vehicle_images (vehicle_id, image_url, image_description)
                VALUES ($1, $2, $3)
                `,
                [vehicleId, image_url, image_description]
            );
        }

        await db.query('COMMIT');
        return vehicleResult.rows[0];
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

const deleteVehicle = async (vehicleId) => {
    const query = `
        DELETE FROM vehicles
        WHERE vehicle_id = $1
        RETURNING *;
    `;
    const result = await db.query(query, [vehicleId]);
    return result.rows[0] || null;
};

/**
 * Wrapper functions for backward compatibility and cleaner API.
 * Arrow functions work great for simple wrappers like this.
 */
const getVehicleById = (vehicleId) => getVehicle(vehicleId, 'id');
const getVehicleByVin = (vin) => getVehicle(vin, 'vin');

export {
    getAllCategories,
    getCategoryById,
    createCategory,
    deleteCategoryById,
    getAllVehicles,
    getVehicleById,
    getVehicleByVin,
    getVehiclesByCategory,
    getVehicleCount,
    editVehicleInfoEmployee,
    editVehicleInfo,
    createVehicleAdmin,
    updateVehicleById,
    deleteVehicle
};