## Greetings hopefully this helps some people get started with MERN stack or just to speed up the startup process of building an app

## Make sure to make an .env file and setup a DB on mongoDB atlas with something like this in .env

### NODE_ENV = development

### PORT = 5000

### MONGO_URI = `THESTRING NAME OF YOUR DB FROM YOUR MONGO DB CLUSTER`

#### This application uses concurently to run both frontend/backend server with npm run dev in root folder.

#### This also is setup so you can es6 modules instead of commonjs so make sure to use imports like this `import axios from 'axios' instead of const axios = require('axios')
