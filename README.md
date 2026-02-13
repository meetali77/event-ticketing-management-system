### CM2040 Database Networks and the Web ###
#### Installation requirements ####
* ExpreeJS
* Express-session (for login)

#### submission ###

1. Upon npm run start it will lead to http://localhost:3000/
2. organise is required to register before accessing organiser page
3. application is split into 2 page Attendee and Organiser


#### Final Steps ####
* To run the project Terminal (after u editted the variables stated that needed to be editted)
1. rm -rf node_modules	Clean slate (remove corrupted packages)
2. npm install	Install all required dependencies
3. npm install express	Ensure Express is installed
4. npm run build-db-win	Run DB setup script for Windows
5. npm run start
6. To access organiser page, username:jane.eyre@gmail.com, 
                             password:newpassword123
7. To access the site-setting page, please remove the ".html" at the end to access it
* Only delete package-lock.json if you're troubleshooting or doing a clean install