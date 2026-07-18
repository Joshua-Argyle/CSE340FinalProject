import { validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

/**
 * Display the contact form page.
 */
export const showContactForm = async (req, res) => {
    const roleName = req.session?.user?.roleName;
    const isStaff = roleName === 'admin' || roleName === 'employee';

    if (isStaff) {
        let contactForms = [];

        try {
            contactForms = await getAllContactForms();
        } catch (error) {
            console.error('Error retrieving contact forms:', error);
        }

        return res.render('forms/contact/responses', {
            title: 'Contact Form Submissions',
            contactForms
        });
    }

    return res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
export const handleContactSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    // Inside your validation error check
    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/contact');
    }

    // Extract validated data
    const { subject, message } = req.body;
    const sessionUser = req.session?.user;
    const contactName = sessionUser?.name || 'Guest User';
    const contactEmail = sessionUser?.email || 'guest@example.com';

    try {
        // Save to database
        await createContactForm(contactName, contactEmail, subject, message);
        // After successfully saving to the database
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        res.redirect('/contact');
    } catch (error) {
    console.error('Error saving contact form:', error);
    req.flash('error', 'Unable to submit your message. Please try again later.');
    res.redirect('/contact');
    }
};

/**
 * Display all contact form submissions.
 */
export const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Contact Form Submissions',
        contactForms
    });
};