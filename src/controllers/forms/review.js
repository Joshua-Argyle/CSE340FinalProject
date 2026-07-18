import { validationResult } from 'express-validator';
import { createReview, displayAllReviewsForCar, deleteReviews, getReviewForEdit } from '../../models/forms/review.js';

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
export const handleReviewSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    const vehicleId = req.params.vehicleId;
    const editReviewId = req.body.editReviewId;

    // Inside your validation error check
    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        const editQuery = editReviewId ? `?editReviewId=${editReviewId}` : '';
        return res.redirect(`/catalog/${vehicleId}${editQuery}`);
    }

    // Extract validated data
    const { rating, reviewText } = req.body;
    const userId = req.session?.user?.user_id;

    if (!userId) {
        req.flash('error', 'You must be logged in to submit a review.');
        return res.redirect('/login');
    }

    try {
        // Create the replacement review first, then remove the old one for edit mode.
        await createReview(userId, vehicleId, rating, reviewText);
        if (editReviewId) {
            await deleteReviews(editReviewId, userId);
            req.flash('success', 'Your review was updated.');
        } else {
            req.flash('success', 'Thank you for your review');
        }
        res.redirect(`/catalog/${vehicleId}`);
    } catch (error) {
        console.error('Error saving review:', error.message);
        console.error(error.stack);
        req.flash('error', `Unable to submit your review: ${error.message}`);
        const editQuery = editReviewId ? `?editReviewId=${editReviewId}` : '';
        res.redirect(`/catalog/${vehicleId}${editQuery}`);
    }
};

export const showReviews = async (req, res, next) => {
    let reviews = [];
    let reviewToEdit = null;
    const vehicle = res.locals.vehicle || req.vehicle || null;
    const vehicleId = vehicle?.vehicleId || req.params.vehicleId;
    const editReviewId = req.query.editReviewId;
    const currentUserId = req.session?.user?.user_id || null;
    const currentUserRoleName = req.session?.user?.roleName || null;

    try {
        reviews = await displayAllReviewsForCar(vehicleId);
        if (editReviewId && currentUserId) {
            reviewToEdit = await getReviewForEdit(editReviewId, currentUserId);
        }
    } catch (error) {
        console.error('Error retrieving reviews:', error);
    }

    res.render('vehicles/detail', {
        title: res.locals.title || 'Vehicle Details',
        vehicle,
        reviews,
        reviewToEdit,
        currentUserId,
        canModerateReviews: currentUserRoleName === 'admin' || currentUserRoleName === 'employee'
    });
};

export const handleDeleteReview = async (req, res) => {
    const vehicleId = req.params.vehicleId;
    const reviewId = req.params.reviewId;
    const userId = req.session?.user?.user_id;
    const roleName = req.session?.user?.roleName;

    if (!userId) {
        return res.redirect('/login');
    }

    try {
        const deletedReview = roleName === 'admin' || roleName === 'employee'
            ? await deleteReviews(reviewId)
            : await deleteReviews(reviewId, userId);

        if (!deletedReview) {
            req.flash('error', 'Review not found or you do not have permission to delete it.');
            return res.redirect(`/catalog/${vehicleId}`);
        }

        req.flash('success', 'Review deleted');
        res.redirect(`/catalog/${vehicleId}`);
    } catch (error) {
        console.error('Error deleting review:', error.message);
        console.error(error.stack);
        req.flash('error', `Unable to delete review: ${error.message}`);
        res.redirect(`/catalog/${vehicleId}`);
    }
};
