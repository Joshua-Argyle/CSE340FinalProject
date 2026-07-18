# CSE340FinalProject
# CSE340FinalProject

## Project Description

This site follows Option B: Build a Used Car Dealership. It functions as a site for:

- Viewing cars
- Submitting and fulfilling service requests
- Contacting the mechanics/sales team directly


## Database Schema

The Entity Relationship Diagram (ERD) for this project is shown below.

![CSE340 Final Project ERD](public/images/vehicles/ERDCSE340FinalProject%20%28Joshua%20Argyle%29.png)


## User Roles

### General User Access

Users can:

- View a catalog of vehicles for sale
- Sort vehicles by category
- View each vehicle details page
- Contact the employee team

### Customer Role (Logged In)

In addition to general access, customers can:

- Create a service request
- View past service requests and status
- Write, edit, and delete a vehicle review

### Employee Role

Employees can:

- Complete service requests
- Fulfill service requests and leave notes for customers
- Edit vehicle catalog information (price, description, status only)
- Delete any user review (for inappropriate content moderation)

### Admin Role

Admins can:

- Create new vehicles
- Delete vehicles
- Edit any and all vehicle fields
- Add, delete, and edit vehicle categories
- View all users in the database on a dashboard page

If a category is deleted and was attached to vehicles, those vehicles are reassigned to a default category named car.

## Test Users for Application

Password for each account is as described in the final project requirements.

### Customer Access

- customer123@gmail.com

### Employee Access

- employee123@gmail.com

### Admin Access

- admin123@gmail.com

## Limitations (Features Not Implemented)

- As of right now, the admin cannot delete or add users directly, nor grant an existing user a higher role. This can be done in the backend.
- Because images are static assets in the project, creating a vehicle currently supports reusing existing car images only.
- A page that shows all reviews together for admin/employee is not implemented. Reviews are currently viewed per vehicle detail page.

