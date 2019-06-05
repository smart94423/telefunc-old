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
    <img src="https://github.com/reframejs/wildcard-api/raw/master/docs/images/logo-with-text.svg?sanitize=true" height=80 alt="Wildcard API"/>
  </a>
</p>

<p align="center">Functions as an API.</p>

<br/>

 - [What is Wildcard](#what-is-wildcard)
 - [Wildcard VS REST/GraphQL](#wildcard-vs-restgraphql)
 - Usage
   - [Getting Started](#getting-started)
   - [Authentication](#authentication)
   - [Permissions](#permissions)
   - [Error Handling](#error-handling)
   - [SSR](#ssr)
 - [More Resources](#more-resources)

<br/>

### What is Wildcard

Wildcard is a JavaScript library to create an **API** for your **Node.js** server that is consumed by the **browser**.

With Wildcard,
creating an API is as easy as creating JavaScript functions:

~~~js
// Node.js server

const {endpoints} = require('wildcard-api');

// We define a `hello` function on the server
endpoints.hello = function(name) {
  return {message: 'Welcome '+name};
};
~~~

~~~js
// Browser

import {endpoints} from 'wildcard-api/client';

(async () => {
  // Wildcard makes our `hello` function available in the browser
  const {message} = await endpoints.hello('Daenerys');
  console.log(message); // Prints `Welcome Daenerys`
})();
~~~

That's all Wildcard does:
it makes functions,
that are defined on the server,
"callable" in the browser.
Nothing more, nothing less.

How you retrieve/mutate data is up to you;
you can use any SQL/NoSQL/ORM query:

~~~js
const endpoints = require('wildcard-api');
const getLoggedUser = require('./path/to/your/auth/code');
const Todo = require('./path/to/your/data/model/Todo');

endpoints.createTodo = async function(text) {
  const user = await getLoggedUser(this.headers); // We explain `this.headers` later

  // Abort if the user is not logged in
  if( !user ) return;

  // With ORM/ODM:
  const newTodo = new Todo({text, authorId: user.id});
  await newTodo.save();
  /* Or with SQL:
  const db = require('your-favorite-sql-query-builder');
  const [newTodo] = await db.query(
    "INSERT INTO todos VALUES (:text, :authorId);",
    {text, authorId: user.id}
  ); */

  return newTodo;
};
~~~


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>



### Wildcard VS REST/GraphQL

If all you need is to retrieve/mutate data from you frontend,
then Wildcard offers a very easy way.
All you have to do is to create JavaScript functions
and all you need to know is written in this little Readme.

If you need third parties to be able to retrieve/mutate your data
then REST and GraphQL are better suited.
A RESTful/GraphQL API has a schema and a rigid structure which is a good thing for third parties that need a stable and long-term contract with your API.

But,
for quickly evolving your application,
the rigid structure of a RESTful/GraphQL API gets in a way and is a handicap.
Wildcard,
on the other hand,
is schemaless and structureless
which is a wonderful fit for rapid development, prototyping, and MVPs.


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>



### Getting Started

1. Add Wildcard to your Node.js server.

   With Express:
   ~~~js
   const express = require('express');
   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api

   const app = express();

   app.all('/wildcard/*' , async (req, res) => {
     const {body, statusCode, type} = await getApiResponse(req);
     res.status(statusCode);
     res.type(type);
     res.send(body);
   });
   ~~~

   <details>
   <summary>
   With Hapi
   </summary>

   ~~~js
   const Hapi = require('hapi');
   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api

   const server = Hapi.Server();

   server.route({
     method: '*',
     path: '/wildcard/{param*}',
     handler: async (request, h) => {
       const {body, statusCode, type} = await getApiResponse(request.raw.req);
       const resp = h.response(body);
       resp.code(statusCode);
       resp.type(type);
       return resp;
     }
   });
   ~~~
   </details>

   <details>
   <summary>
   With Koa
   </summary>

   ~~~js
   const Koa = require('koa');
   const Router = require('koa-router');
   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api

   const app = new Koa();

   const router = new Router();

   router.all('/wildcard/*', async ctx => {
     const {body, statusCode, type} = await getApiResponse(ctx);
     ctx.status = apiResponse.statusCode;
     ctx.type = type;
     ctx.body = apiResponse.body;
   });

   app.use(router.routes());
   ~~~
   </details>

   <details>
   <summary>
   With other server frameworks
   </summary>

   Wildcard can be used with any server framework.
   Just make sure to reply HTTP requests made to `/wildcard/*`
   with an HTTP response with the HTTP body and status code returned by
   `const {body, statusCode, type} = await getApiResponse({method, url, headers});`
   where `method`, `url`, and `headers` are the HTTP request method, URL, and headers.
   </details>

2. Define functions
   in Node.js on
   `require('wildcard-api').endpoints`.

   ~~~js
   // Node.js

   const {endpoints} = require('wildcard-api');
   const getLoggedUser = require('./path/to/your/auth/code');
   const getData = require('./path/to/your/data/retrieval/code');

   endpoints.myFirstEndpoint = async function () {
     // `this` is the object you pass to `getApiResponse`.
     // In the Express code above we passed `req`. Thus we can
     // access `req.headers.cookie` over `this.headers.cookie`.
     const user = await getLoggedUser(this.headers.cookie);
     const data = await getData(user);
     return data;
   };
   ~~~

3. You can now "call" your enpdoint functions in the browser
   at `require('wildcard-api/client').endpoints`.

   ~~~js
   // Browser

   import {endpoints} from 'wildcard-api/client'; // npm install wildcard-api

   (async () => {
     const data = await endpoints.myFirstEndpoint();
   })();
   ~~~

> If you want to play around with Wildcard, you can use
> [Reframe's react-sql starter](https://github.com/reframejs/reframe/tree/master/plugins/create/starters/react-sql#readme) to scaffold an app that has a Wildcard API.


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>




### Authentication

To do authentication you need the HTTP headers such as the `Authorization: Bearer AbCdEf123456` Header or a cookie holding the user's session ID.

For that you pass the request object `req` to `getApiResponse(req)`:
This request object `req` is provided by your server framework (express/koa/hapi)
and holds information about the HTTP request such as the HTTP headers.

For example with Express:

 ~~~js
 app.all('/wildcard/*' , async (req, res) => {
   // We pass `req` to getApiResponse
   const {body, statusCode, type} = await getApiResponse(req);
   res.status(statusCode);
   res.type(type);
   res.send(body);
 });
~~~

Wildcard then makes `req` available to your endpoint function as `this`.

For example:

~~~js
const {endpoints} = require('wildcard-api');
const getUserFromSessionCookie = require('./path/to/your/session/logic');

endpoints.getLoggedUserInfo = async function() {
  // Since `this===req`, `req.headers` is available as `this.headers`
  const user = await getUserFromSessionCookie(this.headers.cookie);
  return user;
};
~~~

In general, any object `anObject` you pass to `getApiResponse(anObject)`
is made available to your endpoint functions as `this`.
(I.e. `this===anObject`.)
That way,
you can make whatever you want available to your endpoint functions.


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>




### Permissions

Permissions are defined by code. For example:

~~~js
const {endpoints} = require('wildcard-api');
const getLoggedUser = require('./path/to/your/auth/code');
const db = require('./path/to/your/db/handler');

endpoints.updateTodoText = async function(todoId, newText) {
  if( !user ) {
    // Not logged in user are not authorized to change a to-do item.
    // We abort.
    return;
  }

  const todo = await db.getTodo(todoId);

  if( !todo ) {
    // `todoId` didn't match any todo.
    // We abort.
  }

  if( todo.authorId !== user.id ) {
    // Only the author of the to-do item is allowed to modify it.
    // We abort.
    return;
  }

  // The user is authorized.
  // We commit the new to-do text.
  await db.updateTodoText(todoId, newText);
};
~~~

See the [to-do list app example](/example/) for further permission examples.


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>





### Error Handling

This is what you need to know to handle errors:
- On the server, your endpoint functions should not throw errors. And if one of your endpoint function does throw an error, then it should be a bug.
- In the browser, calling an endpoint will throw an error `err` with `err.isServerError===true` if the endpoint function throws an error (in other words there is a bug), and will throw an error with `err.isNetworkError===true` if the browser couldn't connect to the server.

Upon validation error, your endpoint function should not throw an exception.
(A validation error is an expected error and not a bug.)
For example:

~~~js
const {endpoints} = require('wildcard-api');
const isStrongPassword = require('./path/to/isStrongPassword.js');

endpoints.createAccount = async function({email, password}) {
  /* Don't do the following:
  if( !isStrongPassword(password) ){
    throw new Error("Password is too weak.");
  }
  */

  // Do this instead:
  if( !isStrongPassword(password) ){
    return {validationError: "Password is too weak."};
  }

  /* ... */
};
~~~

With `isServerError` and `isNetworkError` you can handle errors as you wish.
Like that:

~~~js
const {endpoints} = require('wildcard-api/client');

async function() {
  let data;
  let err;
  try {
    data = await endpoints.getData();
  } catch(err_) {
    err = err_;
  }

  if( err.isServerError ){
    // This is when the `getData` endpoint function throws an error. (In other words there is a bug.)
    alert('Something went wrong. Sorry... Please try again.');
    return {success: false};
  }
  if( err.isNetworkError ){
    // This is when the browser couldn't connect to the server.
    alert("We couldn't connect to the server. Either the server is down or you're offline. Try again.");
    return {success: false};
  }

  return {success: true, data};
}
~~~

You can also use [Handli](https://github.com/brillout/handli) which will handle all errors for you:

~~~js
import 'handli';
/* Or:
require('handli')`;
*/

// That's it: Handli automatically installs itslef.
// All errors are now handled by Handli.
~~~


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>





### SSR

The Wildcard client is universal and works on both the browser and Node.js.

If you don't need Authentication, then SSR works out of the box.

If you need Authentication, then read [SSR & Authentication](/docs/ssr-auth.md#readme).


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
<br/>





### More Resources

This section collects further information about Wildcard.

 - [SSR & Authentication](/docs/ssr-auth.md#readme)
   <br/>
   How to use Wildcard with SSR and Authentication.

 - [How does it work](/docs/how-does-it-work.md#readme)
   <br/>
   Explains how Wildcard works.

 - [Conceptual FAQ](/docs/conceptual-faq.md#readme)
   <br/>
   High level discussion about Wildcard, RPC-like APIs, GraphQL, and REST.

 - [To-do List Example](/example#readme)
   <br/>
   An example of a to-do list app implemented with Wildcard.

 - [Custom VS Generic](/docs/custom-vs-generic.md#readme)
   <br/>
   Goes into more depth of whether you should implement a generic API (REST/GraphQL) or a custom API (Wildcard).
   (Or both.)
   In general, the rule of thumb for deciding which one to use is simple:
   if third parties need to access your data,
   then implement a generic API,
   otherwise implement a custom API.
   But in some cases it's not that easy and this document goes into more depth.


<br/>

<p align="center">

<sup>
<a href="https://github.com/reframejs/wildcard-api/issues/new">Open a ticket</a> or
<a href="https://discord.gg/kqXf65G">chat with us</a> or
if you want to ask questions, request features, or if you just want to talk to us.
</sup>

<sup>
We want to talk with you :-).
</sup>

<br/>

<sup>
<a href="#readme"><b>&#8679;</b> <b>TOP</b> <b>&#8679;</b></a>
</sup>

</p>

<br/>
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
