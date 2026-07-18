import { homePage, testErrorPage } from './index.js';
import { catalogPage, randomVehicleGetter, vehicleDetailPage, loadCategoriesForVehicleForm, showCreateVehicleForm, handleCreateVehicle, handleDeleteVehicle, handleCreateCategory, handleDeleteCategory } from './vehicles/vehicles.js';
import { handleReviewSubmission, showReviews, handleDeleteReview } from './forms/review.js';
import { showServiceRequestForm, showServiceRequestResponses, handleServiceRequestSubmission, handleServiceRequestUpdate } from './forms/service-request.js'
import { handleContactSubmission, showContactForm, showContactResponses } from './forms/contact.js';
import { processEditAccount, processRegistration } from './forms/registration.js';
import registrationRoutes from './forms/registration.js';
import { processLogin, showLoginForm } from './forms/login.js';
import { processLogout } from './forms/login.js';
import { showInventoryManagement } from './inventory.js';
import { showDashboard } from './dashboard.js';
import { requireLogin } from '../middleware/auth.js';
import { Router } from 'express';
import {
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
} from '../middleware/validation/form.js';

// Create a new router instance
const router = Router();

// Add vehicle-specific styles to all vehicle routes
router.use('/catalog', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/vehicles/catalog.css">');
    next();
});

// Add contact-specific styles to all contact routes
router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

// Add registration-specific styles to all registration routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

router.use('/inventory', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/inventory.css">');
    next();
});

// Add service request-specific styles to all service request routes
router.use('/service-request', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/service-request.css">');
    next();
});

router.use('/register', registrationRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);
router.get('/inventory', requireLogin, showInventoryManagement);
router.get('/inventory/vehicles/new', requireLogin, loadCategoriesForVehicleForm, showCreateVehicleForm);
router.post('/inventory/vehicles/new', requireLogin, vehicleValidation, handleCreateVehicle);
router.post('/inventory/vehicles/:vehicleId/edit', requireLogin, vehicleValidation, handleCreateVehicle);
router.post('/inventory/vehicles/:vehicleId/delete', requireLogin, handleDeleteVehicle);
router.post('/inventory/categories', requireLogin, categoryValidation, handleCreateCategory);
router.post('/inventory/categories/:categoryId/delete', requireLogin, categoryDeleteValidation, handleDeleteCategory);

// Home and basic pages
router.get('/', randomVehicleGetter, homePage);

//Vehicle catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:vehicleId', vehicleDetailPage, showReviews);
router.post('/catalog/:vehicleId/reviews', requireLogin, reviewValidation, handleReviewSubmission);
router.post('/catalog/:vehicleId/reviews/:reviewId/delete', requireLogin, handleDeleteReview);

// Route to trigger a test errorS
router.get('/test-error', testErrorPage);

router.get('/contact', showContactForm);
router.get('/contact/responses', showContactResponses);
router.post('/contact', contactValidation, handleContactSubmission);

router.get('/service-request', showServiceRequestForm);
router.get('/service-request/responses', requireLogin, showServiceRequestResponses);
router.post('/service-request', requireLogin, serviceRequestValidation, handleServiceRequestSubmission);
router.post('/service-request/responses/:serviceRequestId/update', requireLogin, serviceRequestUpdateValidation, handleServiceRequestUpdate);

router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);


router.post('/register', registrationValidation, processRegistration);
router.post('/register/:id/edit', requireLogin, updateAccountValidation, processEditAccount);

export default router;