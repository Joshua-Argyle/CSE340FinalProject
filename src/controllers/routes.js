import { homePage, aboutPage, testErrorPage } from './index.js';
import { handleContactSubmission, showContactForm, showContactResponses } from './forms/contact.js';
import { processEditAccount, processRegistration } from './forms/registration.js';
import registrationRoutes from './forms/registration.js';
import { processLogin, showLoginForm } from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';
import { Router } from 'express';
import {
    contactValidation, 
    registrationValidation, 
    loginValidation,
    updateAccountValidation
} from '../middleware/validation/form.js';

// Create a new router instance
const router = Router();
// // Add catalog-specific styles to all catalog routes
// router.use('/catalog', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
//     next();
// });
// // Add faculty-specific styles to all faculty routes
// router.use('/faculty', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
//     next();
// });

// router.use('/faculty/:slugId', (req, res, next) => {
//     res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
//     next();
// });

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

router.use('/register', registrationRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
// router.get('/catalog', catalogPage);
// router.get('/catalog/:slugId', courseDetailPage);

// Faculty routes
// router.get('/faculty', facultyListPage);
// router.get('/faculty/:slugId', facultyDetailPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);

router.get('/contact', showContactForm);
router.get('/contact/responses', showContactResponses);
router.post('/contact', contactValidation, handleContactSubmission);

router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);


router.post('/register', registrationValidation, processRegistration);
router.post('/register/:id/edit', updateAccountValidation, processEditAccount, requireLogin);

export default router;