<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.






-->
<p align="center">
  <a href="/../../#readme">
    <img src="https://github.com/brillout/wildcard-api/raw/master/docs/images/logo-with-text.svg?sanitize=true" height=90 alt="Wildcard API"/>
  </a>
</p>
<p align='center'><a href="/../../#readme"><b>Intro</b></a> &nbsp; | &nbsp; <a href="/docs/usage-manual.md#readme">Usage Manual</a> &nbsp; | &nbsp; <a href="/example/#readme">Example</a></p>

Goals:
 1. JavaScript library to make the **creation of a custom API super easy**.
 2. Debunk the **common misconception that a generic API is a silver bullet**.
    A generic API, such as REST or GraphQL, is great for third party clients and large applications
    but is an **unecessary burden for prototypes and medium-sized applications**.

With Wildcard,
**creating an API endpoint is as easy as creating a JavaScript function**:

~~~js
// Node.js Server

const {endpoints} = require('wildcard-api');

// We define a `hello` function on the server
endpoints.hello = function(name) {
  return {message: 'Hi '+name};
};
~~~

~~~js
// Browser

import {endpoints} from 'wildcard-api/client';

(async () => {
  // Wildcard makes our `hello` function available in the browser
  const {message} = await endpoints.hello('Alice');
  console.log(message); // Prints `Hi Alice`
})();
~~~

That's the only thing Wildcard does:
It makes functions defined on the server "callable" in the browser.
That's it.
Wildcard takes care of HTTP requests and serialization.
How you retrieve/mutate data is up to you.
You can use SQL, ORM, NoSQL, etc.

#### Contents

 - [Why Wildcard](#why-wildcard)
 - [Example](#example)
 - [Wildcard vs GraphQL/RESTful](#wildcard-vs-graphqlrestful)
 - [Quick Start](#quick-start)


<br/>

### Why Wildcard

With Wildcard you
**retrieve/mutate data from the frontend in a seamless way**
:
No schema,
no permission rules,
just create functions on `endpoints`.

These endpoint functions effectively act as fine-grained "permission holes".
This is a simple alternative to permission rules.

Wildcard's simplicity is **ideal to quickly deliver a protoype**:
Write the couple of SQL/ORM/NoSQL queries your prototype's frontend needs,
wrap them in endpoint functions,
and you're good to go.

The **structureless nature of a custom API is a good fit for rapid prototyping**
whereas the rigid structure of a generic API's schema
gets in the way of evolving your prototype.

That said, a custom API (and thus Wildcard) is not suitable for:
 - Third party clients. (A generic API is inherently required.)
 - Large applications with a frontend development decoupled from API development.

To make the developing experience further seamless,
Wildcard provides:
 - **Zero setup**.
   <br/>
   Couple of lines are enough to set up a Wildcard API with Express, Koa, Hapi, etc.
 - **Error handling**.
   <br/>
   Using [Handli](https://github.com/brillout/handli) to automatically handle network corner cases,
   such as when the user looses his internet connection.
   (You can also provide your own error handling.)
 - **Extended serialization**.
   <br/>
   Using [JSON-S](https://github.com/brillout/json-s) to support further JavaScript types.
   (Such as `Date` which JSON doesn't support.)
 - **Universal/Isomorphic/SSR support**.
   <br/>
   The Wildcard client works in the browser as well as on Node.js.
   With seamless support for
   server-side rendering.

<b><sub><a href="#contents">&#8679; TOP  &#8679;</a></sub></b>

<br/>



## Example

View endpoints of a simple todo app:

~~~js
const {endpoints} = require('wildcard-api');
const db = require('../db');
const {getLoggedUser} = require('../auth');

// Our view endpoints are tailored to the frontend. For example, the endpoint
// `getLandingPageData` returns exactly and only the data needed by the landing page

endpoints.getLandingPageData = async function () {
  // `this` holds contextual information such as HTTP headers
  const user = await getLoggedUser(this.headers.cookie);
  if( ! user ) return {userIsNotLoggedIn: true};

  const todos = await db.query(
    `SELECT * FROM todos WHERE authorId = :authorId AND completed = false;`,
    {authorId: user.id}
  );

  // We return `user` as the landing page displays user information.
  return {user, todos};
};

endpoints.getCompletedPageData = async function () {
  const user = await getLoggedUser(this.headers.cookie);
  if( ! user ) return {userIsNotLoggedIn: true};

  const todos = await db.query(
    `SELECT * FROM todos WHERE authorId = :authorId AND completed = true;`,
    {authorId: user.id}
  );

  // We don't return `user` as the page doesn't need it
  return {todos};
};
~~~

Wildcard can be used with any server framework such as Express, Hapi, Koa, etc.
In our example we use Express:

~~~js
const express = require('express');
const {getApiResponse} = require('wildcard-api');
require('./api/endpoints');

startServer();

async function startServer() {
  const app = express();

  app.all('/wildcard/*' , async(req, res, next) => {
    // Our `context` object is made available to endpoint functions over `this`.
    // E.g. `endpoints.getUser = function() { return getLoggedUser(this.headers) }`.
    const {method, url, headers} = req;
    const context = {method, url, headers};
    const apiResponse = await getApiResponse(context);

    if( apiResponse ) {
      res.status(apiResponse.statusCode);
      res.send(apiResponse.body);
    }

    next();
  });

  // Serve our frontend
  app.use(express.static('client/dist', {extensions: ['html']}));

  app.listen(3000);
}
~~~

At [Example](/example/#readme)
we further showcase our toto app,
including mutation endpoints,
and a React frontend.


<b><sub><a href="#contents">&#8679; TOP  &#8679;</a></sub></b>

<br/>






## Wildcard vs GraphQL/RESTful

Comparing Wildcard with REST and GraphQL mostly boilds down to comparing a custom API with a generic API.

With "custom API" we denote an API that is designed to fulfill only the data requirements of your clients.
E.g.:
<br/> &nbsp; &nbsp; &bull; Wildcard API
<br/> &nbsp; &nbsp; &bull; API with [REST level 0](https://martinfowler.com/articles/richardsonMaturityModel.html#level0)

With "generic API" we denote an API that is designed to support a maximum number of data requirements.
E.g.:
<br/> &nbsp; &nbsp; &bull; GraphQL API
<br/> &nbsp; &nbsp; &bull; API with [REST level >=1](https://martinfowler.com/articles/richardsonMaturityModel.html#level1)

We explore use cases for custom APIs and for generic APIs at
[Usage Manual - Custom API vs Generic API](/docs/usage-manual.md#custom-api-vs-generic-api)
.

<b><sub><a href="#contents">&#8679; TOP  &#8679;</a></sub></b>

<br/>









## Quick Start

Work-in-progress.

<b><sub><a href="#contents">&#8679; TOP  &#8679;</a></sub></b>

<br/>





<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/intro.template.md` instead.






-->
