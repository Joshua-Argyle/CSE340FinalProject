// Route handlers for static pages
const homePage = (req, res) => {
    res.render('home', {
        title: 'Home',
        featuredVehicle: res.locals.featuredVehicle || null
    });
};

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

export { homePage, testErrorPage };