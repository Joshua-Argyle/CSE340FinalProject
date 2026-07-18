import { validationResult } from 'express-validator';
import { createServiceRequest, getAllServiceRequests, getServiceRequestsByUserId, updateServiceRequestById } from '../../models/forms/service-request.js';

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
    const {vin, make, model, year, serviceType, description } = req.body;
    const userId = req.session.user.user_id;

    try {
        // Save to database
        await createServiceRequest(userId, vin, make, model, year, serviceType, description);
        // After successfully saving to the database
        req.flash('success', 'Thank you for choosing us to service your vehicle! We will respond soon.');
        res.redirect('/service-request');
    } catch (error) {
        console.error('Error saving service request form:', error.message);
        console.error(error.stack);
        req.flash('error', 'Unable to submit your service request. Please try again later.');
        res.redirect('/service-request');
    }
};

/**
 * Display all contact form submissions.
 */
export const showServiceRequestResponses = async (req, res) => {
    let serviceRequestForms = [];
    const userId = req.session?.user?.user_id;
    const roleName = req.session?.user?.roleName;
    const canManageServiceRequests = roleName === 'admin' || roleName === 'employee';
    const isCustomer = roleName === 'user';

    try {
        serviceRequestForms = canManageServiceRequests
            ? await getAllServiceRequests()
            : await getServiceRequestsByUserId(userId);
    } catch (error) {
        console.error('Error retrieving service request forms:', error);
    }

    res.render('forms/service-request/responses', {
        title: 'Service Request Form Submissions',
        serviceRequestForms,
        canManageServiceRequests,
        isCustomer
    });
};

export const handleServiceRequestUpdate = async (req, res) => {
    const errors = validationResult(req);
    const roleName = req.session?.user?.roleName;

    if (roleName !== 'admin' && roleName !== 'employee') {
        req.flash('error', 'Only employees and admins can update service requests.');
        return res.redirect('/service-request/responses');
    }

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/service-request/responses');
    }

    try {
        const serviceRequestId = Number(req.params.serviceRequestId);
        const { status, employeeNotes } = req.body;

        const updatedRequest = await updateServiceRequestById(serviceRequestId, status, employeeNotes);
        if (!updatedRequest) {
            req.flash('error', 'Service request not found.');
            return res.redirect('/service-request/responses');
        }

        req.flash('success', `Service request #${updatedRequest.service_request_id} updated.`);
        return res.redirect('/service-request/responses');
    } catch (error) {
        console.error('Error updating service request:', error.message);
        console.error(error.stack);
        req.flash('error', 'Unable to update service request. Please try again later.');
        return res.redirect('/service-request/responses');
    }
};