## Charles Anton Sibal - Todo List Web App

https://a3-charlesantonsibal-production.up.railway.app/

This is a simple web application that allows users to create, edit, and delete tasks.
The application's purpose is to allow users to keep track of the tasks they need to complete.
Some challenges I faced in this project were implementing authentication as a middleware and checking authentication status in
all the api calls. I chose to use passport.js because I didn't want to deal with possibility of users not
having emails, githubs, etc. I used bootstrap for the css framework, modifying the login page to utilize the framework.
I won't lie, I didn't realize this was a requirement until an hour before due date, so I only had time to implement it
into login. I used the following express middleware packages:

- express.static() to parse json requests
- express.urlencoded() to parse url-encoded requests
- express.static() to serve static files
- express.session() to manage sessions
- passport.js to manage authentication

## AI Note:

I utilized AI mainly to do bugfixes. For example, used it to get the syntax for querying the database
for multiple criteria in server.js:227. I also used it to quickly write a slugify function in dashboard.js:65, as I'm not the best at regex's. I also utilized Jetbrains autocomplete to quickly write error messages,
such as those in catch blocks or response status calls.

## Technical Achievements
- **Tech Achievement 1**: I used OAuth authentication passport.js. I allowed users to create dummy accounts for testing/utilization purposes. (10 points as listed by professor)
- **Tech Achievement 2**: I hosted my site on railway.com. This site was better than render because it allows for more than just static sites. (5 points as listed by professor)
- **Tech Achievement 3**: I used multiple variations of fetch calls in my client-side js logic. I did so to get experience in using
different forms of fetch calls. I believe it deserves 2 points because each variation is slightly different. in terms of implementation.
- **Tech Achievement 4**: I started this project from scratch instead of utilizing a previous assignment. I did this to get overall experience in web development.
One mistake, however, was having all my js logic in 3 files. Moving forward, I'll try to keep the file sizes smaller
and more organized. I believe this deserves 3 points because of the time it took me to implement it and how convoluted it was towards the end (haha)

I'm not including this as a tech achievement, but I maintained >90 on all 4 lighthouse scores throughout the development of the project.

Sum: 20 points

## Known Issues

The app does not display when a password is incorrect or a user already exists. Errors are logged in the console, though.