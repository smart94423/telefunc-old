module.exports = [
  // `getApiHttpResponse` returns null for non-wildcard HTTP requests
  doesntIntefere1,
  // Wildcard server middlewares don't intefere with non-wildcard HTTP requests
  doesntIntefere2,
  // Ensure that the Wilcard client on unpkg.com works
  unpkg,
  // Ensure that the API is as described in the docs.
  API,
  // Assert thrown error message when trying to `require("telefunc")`
  mainImportForbidden,
];

async function doesntIntefere1({ server, telefuncServer }) {
  server.getme = function () {
    return "you got me";
  };
  {
    const responseProps = await telefuncServer.getApiHttpResponse({
      method: "POST",
      url: "/_wildcard-apii",
    });
    assert(responseProps === null);
  }
  {
    const responseProps = await telefuncServer.getApiHttpResponse({
      method: "POST",
      url: "/_wildcard_api/getme",
    });
    assert(responseProps.body === `"you got me"`);
  }
}

async function doesntIntefere2({ server, browserEval }) {
  server.myEndpoint = async function () {
    return "Grüß di";
  };

  await browserEval(async () => {
    const resp1 = await window.fetch("/hey-before", {
      method: "GET",
    });
    assert(resp1.status === 200);
    const text1 = await resp1.text();
    assert(text1 === "Hello darling");

    const endpointRet = await window.server.myEndpoint();
    assert(endpointRet === "Grüß di");

    const resp2 = await window.fetch("/hey/after", {
      method: "POST",
    });
    assert(resp2.status === 200);
    const text2 = await resp2.text();
    assert(text2 === "Hello again");
  });
}

async function unpkg({ server, browserEval }) {
  let endpointCalled = false;
  server.bonj = async function () {
    endpointCalled = true;
    return "Bonjour";
  };

  await browserEval(async () => {
    assert(!window.telefunc);
    await loadScript(
      "https://unpkg.com/telefunc/client/telefunc-client.production.min.js"
    );
    assert(window.telefunc);
    const ret = await window.telefunc.server.bonj();
    assert(ret === "Bonjour");
    delete window.telefunc;

    async function loadScript(url) {
      const script = window.document.createElement("script");

      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      script.onload = resolve;
      script.onerror = reject;

      script.src = url;

      window.document.head.appendChild(script);

      return promise;
    }
  });

  assert(endpointCalled);
}

async function API() {
  const wildcard_server = require("telefunc/server");
  assert(wildcard_server.server.constructor === Object);
  assert(wildcard_server.config.constructor === Object);
  assert(
    wildcard_server.getApiHttpResponse.constructor.name === "AsyncFunction"
  );
  assert(wildcard_server.getApiHttpResponse);
  assert(Object.keys(wildcard_server).length === 3);

  const wildcard_client = require("telefunc/client");
  assert(Object.keys(wildcard_client).length === 2);
  assert(wildcard_client.server);
  assert(wildcard_client.config);
  assert(Object.keys(wildcard_client).length === 2);

  ["express", "koa", "hapi"].forEach((serverFramework) => {
    const export_ = require("telefunc/server/" + serverFramework);
    assert(export_.wildcard.name === "wildcard");
    assert(export_.wildcard.constructor.name === "Function");
    assert(Object.keys(export_).length === 1);
  });
}

async function mainImportForbidden() {
  try {
    require("telefunc");
  } catch (err) {
    assert(
      err.message ===
        '[Telefunc][Wrong Usage] You cannot `require("telefunc")`/`import * from "telefunc"`. Either `require("telefunc/client")`/`import * from "telefunc/client"` or `require("telefunc/server")`/`import * from "telefunc/server"` instead.'
    );
  }
}
