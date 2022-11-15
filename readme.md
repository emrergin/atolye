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

## Features
- Automatic weekly writing tasks that can be overridden by admin input.
- Weekly commitments to writing. Commitments are binding, the code allows auto kicking commmitters who did not write their story.
- Participants are assigned randomly as commenters to stories of others.
- So far, comments and stories are dealt externally with Google Docs.

## To be implemented
- Internal text editor
- Internal comment

## Sources
- https://codepen.io/JiveDig/pen/jbdJXR
- https://github.com/iamshaunjp/node-crash-course
- Icons made by Delapouite. Available on https://game-icons.net
    - https://game-icons.net/1x1/delapouite/pencil.html
    - https://game-icons.net/1x1/delapouite/choice.html
- https://heropatterns.com/
- (Not yet implemented) https://www.smashingmagazine.com/2021/05/building-wysiwyg-editor-javascript-slatejs/
	- https://github.com/shalabhvyas/wysiwyg-editor

## What I learned
- Back-end is hard.
- An HTML form can not have a put action. See: https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
- On default, redirecting a POST request results in a GET request, whereas, redirecting a PUT request results in a PUT request. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
- Heroku uses UTC timezone by default. This can be overridden, but this approach is usually not recommended. See: https://help.heroku.com/JZKJJ4NC/how-do-i-set-the-timezone-on-my-dyno
- Better to use `var` inside of **do-while** loops.
- The `passport.use()` method expects your POST request to have the `username` and `password` fields. But this can be circumvented with field definitions.
- Javascript Regex does not well behave with all unicode characters, and it does not have an equivalent expression to `\p{L}`.
- Modifying parts of array may not trigger any save with mongoose, so `markModified` may be needed.
- Mongoose schema middleware triggers in each save, not only the first.

