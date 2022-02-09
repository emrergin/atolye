# Literature Workshop Website

This is the project that made me start learning web development. A webapp that records weekly challenges, stories and comments. The main aim is to incentivize writing stories and reading stories of each other. This is also the first project of mine that uses any form of backend.

## Technologies Used
- [Node.js](https://nodejs.org/en/)
    - [Express](https://expressjs.com/)
    - [EJS](https://ejs.co/)
    - [Passport.js](http://www.passportjs.org/)
    - All external libraries used can be found in [`package.json`](https://github.com/emrergin/atolye/blob/main/package.json).
- **HTML 5**
- **CSS 3**
- [MongoDB](https://www.mongodb.com/)

## To be implemented
- https://github.com/Ionaru/easy-markdown-editor
- http://annotatorjs.org
- https://quilljs.com/

## Sources
- https://codepen.io/JiveDig/pen/jbdJXR
- https://github.com/iamshaunjp/node-crash-course

## What I learned
- Back-end is hard.
- An HTML form can not have a put action. See: https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
- On default, edirecting a POST request results in a GET request, whereas, redirecting a PUT request results in a PUT request. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
- Heroku uses UTC timezone by default. This can be overridden, but this approach is usually not recommended. See: https://help.heroku.com/JZKJJ4NC/how-do-i-set-the-timezone-on-my-dyno