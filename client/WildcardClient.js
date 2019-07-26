const assert = require('@brillout/reassert');

const DEFAULT_API_URL_BASE = '/wildcard/';

module.exports = WildcardClient;

function WildcardClient({
  makeHttpRequest,
  apiUrlBase=DEFAULT_API_URL_BASE,
  wildcardApi,
  stringify,
  parse,
}={}) {

  assert.usage(
    makeHttpRequest,
    "You need to provide `makeHttpRequest`: `new WildcardClient({makeHttpRequest})`.",
  );
  assert.usage(
    stringify,
    "You need to provide `stringify`: `new WildcardClient({stringify})`.",
  );
  assert.usage(
    parse,
    "You need to provide `parse`: `new WildcardClient({parse})`.",
  );

  const isCalledByProxy = Symbol();

  Object.assign(this, {
    fetchEndpoint,
    endpoints: getEndpointsProxy(),
  });

  return this;

  function fetchEndpoint(endpointName, endpointArgs, wildcardApiArgs, ...restArgs) {
    wildcardApiArgs = wildcardApiArgs || {};
    endpointArgs = endpointArgs || [];

    const {requestProps, serverRootUrl} = wildcardApiArgs;

    const wildcardApiFound = wildcardApi || typeof global !== "undefined" && global && global.__globalWildcardApi;
    const runDirectlyWithoutHTTP = !!wildcardApiFound;

    validateArgs({endpointName, endpointArgs, wildcardApiArgs, restArgs, wildcardApiFound, runDirectlyWithoutHTTP});

    if( runDirectlyWithoutHTTP ) {
      assert.internal(isNodejs());
      return callEndpointDirectly({endpointName, endpointArgs, wildcardApiFound, requestProps});
    } else {
      assert.internal(!requestProps);
      return callEndpointOverHttp({endpointName, endpointArgs, serverRootUrl});
    }
  }

  function callEndpointDirectly({endpointName, endpointArgs, wildcardApiFound, requestProps}) {
    return wildcardApiFound.__directCall({endpointName, endpointArgs, requestProps});
  }

  function callEndpointOverHttp({endpointName, endpointArgs, serverRootUrl}) {
    let url = getEndpointUrl({endpointName, endpointArgs, serverRootUrl});
    let body = undefined;

    // Add arguments
    let endpointArgsStr = serializeArgs({endpointArgs, endpointName, stringify});
    if( endpointArgsStr ){
      // https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
      if( endpointArgsStr.length >= 1000 ){
        body = endpointArgsStr;
      } else {
        url += '/'+encodeURIComponent(endpointArgsStr);
      }
    }

    return makeHttpRequest({url, parse, body});
  }

  // TODO-eventually improve error messages
  function validateArgs({endpointName, endpointArgs, wildcardApiArgs, restArgs, wildcardApiFound, runDirectlyWithoutHTTP}) {
    assert.internal(wildcardApiArgs);
    const fetchEndpoint__validArgs = (
      endpointName &&
      endpointArgs.constructor===Array,
      restArgs.length===0,
      wildcardApiArgs.constructor===Object &&
      Object.keys(wildcardApiArgs).every(arg => ['requestProps', 'serverRootUrl', isCalledByProxy].includes(arg))
    );

    if( wildcardApiArgs[isCalledByProxy] ) {
      assert.internal(fetchEndpoint__validArgs);
    } else {
      assert.usage(
        fetchEndpoint__validArgs,
        "Usage:"+
        "",
        "  `fetchEndpoint(endpointName, endpointArgs, {requestProps, serverRootUrl})`",
        "",
        "    Where:",
        "      - `endpointName` is the name of the endpoint (required string)",
        "      - `endpointArgs` is the argument list of the endpoint (optional array)",
        "      - `requestProps` is the HTTP request object (optional object)",
        "      - `serverRootUrl` is the URL root of the server (optional string)",
        "",
        "    Examples:",
        "      `fetchEndpoint('getTodos')`",
        "      `fetchEndpoint('getTodos', [{tags: ['food']}, {onlyCompleted: true}])`",
      );
    }

    const {requestProps} = wildcardApiArgs;
    if( runDirectlyWithoutHTTP ) {
      const errorIntro = [
        "You are trying to run an endpoint directly.",
        "(Instead of doing an HTTP request).",
      ].join('\n');
      assert.usage(
        isNodejs(),
        errorIntro,
        "But you are trying to do so in the browser which doesn't make sense.",
        "Running endpoints directly should be done in Node.js only.",
      );
      assert.usage(
        wildcardApiFound.__directCall,
        errorIntro,
        "You are providing the `wildcardApi` parameter to `new WildcardClient({wildcardApi})`.",
        "But `wildcardApi` doesn't seem to be a instance of `new WildcardApi()`.",
      );
    } else {
      assert.usage(
        Object.keys(requestProps||{}).length===0,
        "Wrong SSR usage.",
        "You are:",
        "  - Using the Wildcard client on the browser-side",
        "  - Providing `requestProps`",
        "But you should provide `requestProps` only while doing server-side rendering.",
        "(Providing `requestProps` doesn't make sense on browser-side.)",
      );
    }
  }

  function getEndpointUrl({endpointName, endpointArgs, serverRootUrl}) {
    serverRootUrl = serverRootUrl || '';
    if( serverRootUrl.endsWith('/') ) {
      serverRootUrl = serverRootUrl.slice(0, -1);
    }
    assert.usage(
      apiUrlBase && apiUrlBase.length>0 && apiUrlBase.startsWith,
      "Argument `apiUrlBase` in `new WildcardClient({apiUrlBase})` should be a non-empty string."
    );
    if( !apiUrlBase.endsWith('/') ) {
      apiUrlBase += '/';
    }
    if( !apiUrlBase.startsWith('/') ) {
      apiUrlBase = '/'+apiUrlBase;
    }

    assert.internal(apiUrlBase.startsWith('/') && apiUrlBase.endsWith('/'));
    assert.internal(!serverRootUrl.startsWith('/'));
    const url = serverRootUrl+apiUrlBase+endpointName;

 // assert.internal(!makeHttpRequest.isUsingBrowserBuiltIn);
    const urlRootIsMissing = !serverRootUrl && makeHttpRequest.isUsingBrowserBuiltIn && !makeHttpRequest.isUsingBrowserBuiltIn();
    if( urlRootIsMissing ) {
      assert.internal(isNodejs());
      assert.usage(
        false,
        [
          "Trying to fetch `"+url+"` from Node.js.",
          "But the URL root is missing.",
          "In Node.js URLs need to include the URL root.",
          "Use the `serverRootUrl` parameter. E.g. `fetchEndpoint('getTodos', {onlyCompleted: true}, {serverRootUrl: 'https://api.example.org'});`.",
        ].join('\n')
      );
    }

    return url;
  }

  function getEndpointsProxy() {
    assertProxySupport();

    const dummyObject = {};

    const proxy = new Proxy(dummyObject, {get, set});
    return proxy;

    function get(target, prop) {
      if( (typeof prop !== "string") || (prop in dummyObject) ) {
        return dummyObject[prop];
      }

      // TODO-enventually
      if( prop==='inspect' ) {
        return undefined;
      }

   // console.log(prop, target===dummyObject, typeof prop, new Error().stack);

      (function() {
        // Webpack: `this===undefined`
        // New webpack version: `this===global`
        // Parcel: `this===window`
        assert.internal(
          (
            this===undefined ||
            typeof window !== "undefined" && this===window ||
            typeof global !== "undefined" && this===global
          ),
          this,
        );
      })();

      return function(...endpointArgs) {
        const noBind = (
          this===proxy ||
          this===undefined ||
          typeof window !== "undefined" && this===window ||
          typeof global !== "undefined" && this===global
        );
        const requestProps = noBind ? undefined : this;
        return fetchEndpoint(prop, endpointArgs, {requestProps, [isCalledByProxy]: true});
      };
    }

    function set(){
      assert.usage(
        false,
        "You cannot add/modify endpoint functions with the client module `wildcard-api/client`.",
        "Instead, define your endpoint functions with the `wildcard-api` module:",
        "    const {endpoints} = require('wildcard-api');",
        "    endpoints.newEndpoint = function(){return 'hello'};",
        "Note that you need to load `endpoints` from `require('wildcard-api')` and not `require('wildcard-api/client')`.",
      );
    }
  }
}

function isNodejs() {
  return typeof "process" !== "undefined" && process && process.versions && process.versions.node;
}

function assertProxySupport() {
  assert.usage(
    envSupportsProxy(),
    [
      "This JavaScript environment doesn't seem to support Proxy.",
      "Use `fetchEndpoint` instead of `endpoints`.",
      "",
      "Note that all browsers support Proxy with the exception of Internet Explorer.",
      "If you want to support IE then use `fetchEndpoint` instead.",
    ].join('\n')
  );
}
function envSupportsProxy() {
  return typeof "Proxy" !== "undefined";
}

function serializeArgs({endpointArgs, endpointName, stringify}) {
  assert.internal(endpointArgs.length>=0);
  if( endpointArgs.length===0 ) {
    return undefined;
  }
  let serializedArgs;
  try {
    serializedArgs = stringify(endpointArgs);
  } catch(err_) {
    console.error(err_);
    console.log('\n');
    console.log('Endpoint arguments:');
    console.log(endpointArgs);
    console.log('\n');
    assert.usage(
      false,
      "Couldn't serialize arguments for `"+endpointName+"`.",
      "The endpoint arguments in question and the serialization error are printed above.",
    );
  }
  return serializedArgs;
}
