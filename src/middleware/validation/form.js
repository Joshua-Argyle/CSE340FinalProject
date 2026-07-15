import { body } from 'express-validator';

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
            .notEmpty()
            .withMessage("VIN is required.")
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

    export { 
    contactValidation, 
    registrationValidation, 
    loginValidation,
    updateAccountValidation,
    serviceRequestValidation
};