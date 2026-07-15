import { validationResult } from 'express-validator';
import {createReview, displayAllReviewsForCar} from '../../models/forms/review.js';

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
export const handleReviewSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    const vehicleId = req.params.vehicleId;

    // Inside your validation error check
    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/catalog/${vehicleId}`);
    }

    // Extract validated data
    const {rating, reviewText  } = req.body;
    const userId = req.session?.user?.user_id;

    if (!userId) {
        req.flash('error', 'You must be logged in to submit a review.');
        return res.redirect('/login');
    }

    try {
        // Save to database
        await createReview(userId, vehicleId, rating, reviewText);
        // After successfully saving to the database
        req.flash('success', 'Thank you for your review');
        res.redirect(`/catalog/${vehicleId}`);
    } catch (error) {
        console.error('Error saving review:', error.message);
        console.error(error.stack);
        req.flash('error', `Unable to submit your review: ${error.message}`);
        res.redirect(`/catalog/${vehicleId}`);
    }
};

export const showReviews = async (req, res) => {
    let reviews = [];
    const vehicle = res.locals.vehicle || req.vehicle || null;
    const vehicleId = vehicle?.vehicleId || req.params.vehicleId;

    try {
        reviews = await displayAllReviewsForCar(vehicleId);
    } catch (error) {
        console.error('Error retrieving service request forms:', error);
    }

    res.render('vehicles/detail', {
        title: res.locals.title || 'Vehicle Details',
        vehicle,
        reviews
    });
};