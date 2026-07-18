import { body, param } from 'express-validator';

/**
 * Validation rules for editing user accounts
 */
const updateAccountValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
];

/**
 * Validation rules for login form
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max : 255 })
        .withMessage('Email must be less than 255 characters'),

    body('password')
        .notEmpty()
        .withMessage('Password Required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters'),
];

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * POST /contact - Handle contact form submission with validation
 */

const contactValidation = [
        body('subject')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Subject must be between 2 and 255 characters')
            .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
            .withMessage('Subject contains invalid characters'),
        body('message')
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters')
            .custom((value) => {
                // Check for spam patterns (excessive repetition)
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);
                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Message appears to be spam');
                }
                return true;
            })
    ]

/**
 * POST /contact - Handle contact form submission with validation
 */
//vin, make, model, year, serviceType, description
const serviceRequestValidation = [
        body("vin")
            .trim()
            .optional({ values: "falsy" })
            .isLength({ min: 17, max: 17 })
            .withMessage("VIN must be exactly 17 characters.")
            .matches(/^[A-HJ-NPR-Z0-9]{17}$/i)
            .withMessage(
                "VIN may contain only valid letters and numbers. I, O, and Q are not allowed."
            )
            .toUpperCase(),
        body("make")
            .trim()
            .notEmpty()
            .withMessage("Vehicle make is required.")
            .isLength({ max: 100 })
            .withMessage("Vehicle make cannot exceed 100 characters."),
        body("model")
            .trim()
            .notEmpty()
            .withMessage("Vehicle model is required.")
            .isLength({ max: 100 })
            .withMessage("Vehicle model cannot exceed 100 characters."),
        body("year")
            .notEmpty()
            .withMessage("Vehicle year is required.")
            .isInt({
                min: 1885,
                max: new Date().getFullYear() + 1
            })
            .withMessage("Enter a valid vehicle year.")
            .toInt(),
        body("serviceType")
            .trim()
            .notEmpty()
            .withMessage("Service type is required.")
            .isLength({ max: 255 })
            .withMessage("Service type cannot exceed 255 characters."),
        body("description")
            .trim()
            .notEmpty()
            .withMessage("Please describe the service your vehicle needs.")
            .isLength({ min: 10, max: 2000 })
            .withMessage(
                "Description must be between 10 and 2,000 characters."
            )
            .custom((value) => {
                // Check for spam patterns (excessive repetition)
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);
                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Message appears to be spam');
                }
                return true;
                }),
    ];

const serviceRequestUpdateValidation = [
    param('serviceRequestId')
        .isInt({ min: 1 })
        .withMessage('Service request id must be a valid positive number')
        .toInt(),
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['pending', 'in progress', 'completed', 'cancelled'])
        .withMessage('Status must be one of: pending, in progress, completed, cancelled'),
    body('employeeNotes')
        .trim()
        .optional({ values: 'falsy' })
        .isLength({ max: 2000 })
        .withMessage('Employee note cannot exceed 2000 characters')
];

const reviewValidation = [
    body('rating')
        .notEmpty()
        .withMessage('Please select a rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('reviewText')
        .trim()
        .notEmpty()
        .withMessage('Please enter your review')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Review must be between 10 and 2000 characters')
        .custom((value) => {
            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);
            if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                throw new Error('Review appears to be spam');
            }
            return true;
        })
];

const vehicleValidation = [
    body('category_id')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .notEmpty()
        .withMessage('Category is required for admin updates')
        .isInt({ min: 1 })
        .withMessage('Category must be a valid category id')
        .toInt(),
    body('make')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('Make is required for admin updates')
        .isLength({ max: 100 })
        .withMessage('Make cannot exceed 100 characters'),
    body('model')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('Model is required for admin updates')
        .isLength({ max: 100 })
        .withMessage('Model cannot exceed 100 characters'),
    body('year')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .notEmpty()
        .withMessage('Year is required for admin updates')
        .isInt({ min: 1885, max: new Date().getFullYear() + 1 })
        .withMessage('Enter a valid vehicle year')
        .toInt(),
    body('mileage')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .notEmpty()
        .withMessage('Mileage is required for admin updates')
        .isInt({ min: 0, max: 2000000 })
        .withMessage('Mileage must be a valid non-negative number')
        .toInt(),
    body('color')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('Color is required for admin updates')
        .isLength({ max: 50 })
        .withMessage('Color cannot exceed 50 characters'),
    body('transmission')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('Transmission is required for admin updates')
        .isLength({ max: 50 })
        .withMessage('Transmission cannot exceed 50 characters'),
    body('fuel_type')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('Fuel type is required for admin updates')
        .isLength({ max: 50 })
        .withMessage('Fuel type cannot exceed 50 characters'),
    body('drivetrain')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('Drivetrain is required for admin updates')
        .isLength({ max: 50 })
        .withMessage('Drivetrain cannot exceed 50 characters'),
    body('vin')
        .if((value, { req }) => req.session?.user?.roleName === 'admin')
        .trim()
        .notEmpty()
        .withMessage('VIN is required for admin updates')
        .isLength({ min: 17, max: 17 })
        .withMessage('VIN must be exactly 17 characters')
        .matches(/^[A-HJ-NPR-Z0-9]{17}$/i)
        .withMessage('VIN may contain only valid letters and numbers. I, O, and Q are not allowed')
        .toUpperCase(),
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0, max: 10000000 })
        .withMessage('Price must be a valid non-negative amount')
        .toFloat(),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Description must be between 10 and 5000 characters')
        .custom((value) => {
            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);
            if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                throw new Error('Review appears to be spam');
            }
            return true;
        }),
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['available', 'pending', 'sold'])
        .withMessage('Status must be one of: available, pending, sold, maintenance'),
    body('image_url')
        .trim()
        .notEmpty()
        .withMessage('Image URL is required')
        .matches(/^(https?:\/\/\S+|\/\S+)$/)
        .withMessage('Image URL must be an absolute web URL or a root-relative path'),
    body('image_description')
        .trim()
        .notEmpty()
        .withMessage('Image description is required')
        .isLength({ min: 3, max: 500 })
        .withMessage('Image description must be between 3 and 500 characters')
];

const categoryValidation = [
    body('category_name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Category name must be between 2 and 200 characters')
        .matches(/^[a-zA-Z0-9\s-]+$/)
        .withMessage('Category name can only contain letters, numbers, spaces, and hyphens')
        .customSanitizer((value) => value.toLowerCase())
];

const categoryDeleteValidation = [
    param('categoryId')
        .isInt({ min: 1 })
        .withMessage('Category id must be a valid positive number')
        .toInt()
];

export { 
    contactValidation, 
    registrationValidation, 
    loginValidation,
    updateAccountValidation,
    serviceRequestValidation,
    serviceRequestUpdateValidation,
    reviewValidation,
    vehicleValidation,
    categoryValidation,
    categoryDeleteValidation
};