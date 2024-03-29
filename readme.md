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
- Text editor is written with **Typescript**, **React** and [Remirror](https://remirror.io/).

## Features
- Automatic weekly writing tasks that can be overridden by admin input.
- Weekly commitments to writing. Commitments are binding, the code allows auto kicking commmitters who did not write their story.
- Participants are assigned randomly as commenters to stories of others.
- So far, comments and stories are dealt externally with Google Docs.

## To be implemented
- Internal comments.
- Story voting.
- Automatic PDF generation that includes best stories.

## Sources
- https://codepen.io/JiveDig/pen/jbdJXR
- https://github.com/iamshaunjp/node-crash-course
- Icons made by Delapouite. Available on https://game-icons.net
    - https://game-icons.net/1x1/delapouite/pencil.html
    - https://game-icons.net/1x1/delapouite/choice.html
- https://heropatterns.com/
- https://gist.github.com/ht2/ba661bf40a1fa6cb289c
- https://stackoverflow.com/questions/5210376/how-to-get-first-and-last-day-of-the-current-week-in-javascript
- https://www.w3schools.com/howto/howto_js_filter_dropdown.asp
- https://venngage.com/blog/pastel-color-palettes/

### About Comment Assignments
- [Fair Allocation of Indivisible Goods to Asymmetric Agents](https://jair.org/index.php/jair/article/view/11291/26464)
    - Not applicable, here, but still interesting.
- https://en.wikipedia.org/wiki/Round-robin_scheduling

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
- [Mongoose queries are not promises](https://mongoosejs.com/docs/promises.html#queries-are-not-promises).
- This project is the first project of mine that required `Promise.all`.
- I learned about `lean` in **Mongoose** for better query performance.
- For `justfiy-content:stretch` working, you need to assign `flex-grow` property.
- Do not fetch the localhost using https, if you don't want to get an SSL error.

