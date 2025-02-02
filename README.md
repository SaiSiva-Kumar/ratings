# Project Overview
Ratings by swadesic is a platform that allows users to create review pages for businesses or services, 
where they can submit reviews. Users can choose whether their reviews are anonymous or signed-in.

# Development Guide
-Build a production ready app with next.js 14.2
- For images, save storage path and build public urls in the backend
- Use tailwind css for styling

# Main functinalities and screens
You need to build front end and backend in the same project.

## Home screen (route: /; design_screen: /home-screens)
-Home screen user need to sign in or sign up with google account.
-Place the ratings by swadesic logo at the top center of the screen.
-Below the logo, place the title "Ratings by Swadesic" at middle center of the screen. 
-Below the title, describe how the app useful for businesses and consumers. 
-After the description, place the buttons for google sign in and sign up.

## Onboarding (route: /onboarding; design_screen: /onboarding)
-After the gAuth is done, user will be redirected to the onboarding screen.
-Place the ratings by swadesic logo at the top right right of the screen.   
-if they are new user, show create review page button. 
-if they are existing user, show review page and review created by that user. Below the create review page button.

## Create review page (route: /createReview; design_screen: /create-review-page)
-Page contains, category, name, description, image upload, submit button.
-Category can be either "product" or "service".
-Name is the name of the product or service.
-Description is the description of the product or service.
-Image upload is the image of the product or service.
-Submit button is the button to submit the review.

## Review page (route: /review/:id; design_screen: /review-page)
-Page contains, product or service name, description, image, add a review button.
-add a review button gives sign in or anonymous user option to add a review.
-if user is signed in, show sign in user name.
-if user is anonymous, show anonymous user.
-add ratings stars.
-add review text.
-add review summary.
-add review images.
-Submit button to submit the review.
-After the review is submitted, show the review page with the review details.