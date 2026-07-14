import { validationResult } from 'express-validator';
import { createServiceRequest, getAllServiceRequests } from '../../models/forms/service-request.js';

/**
 * Display the service request form page.
 */
export const showServiceRequestForm = (req, res) => {
    res.render('forms/service-request/form', {
        title: 'Service Request'
    });
};

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
export const handleServiceRequestSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    // Inside your validation error check
    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/service-request');
    }

    // Extract validated data
    const { userId, vin, make, model, year, serviceType, description } = req.body;

    try {
        // Save to database
        await createServiceRequest(userId, vin, make, model, year, serviceType, description);
        // After successfully saving to the database
        req.flash('success', 'Thank you for choosing us to service your vehicle! We will respond soon.');
        res.redirect('/service-request');
    } catch (error) {
    console.error('Error saving service request form:', error);
    req.flash('error', 'Unable to submit your service request. Please try again later.');
    res.redirect('/service-request');
    }
};

/**
 * Display all contact form submissions.
 */
export const showServiceRequestResponses = async (req, res) => {
    let serviceRequestForms = [];

    try {
        serviceRequestForms = await getAllServiceRequests();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Service Request Form Submissions',
        serviceRequestForms
    });
};