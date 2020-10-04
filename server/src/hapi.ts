import { MiddlewareFactory } from "./MiddlewareFactory";
import HapiAdapter = require("@universal-adapter/hapi");

export const wildcard = MiddlewareFactory(HapiAdapter, {
  useOnPreResponse: true,
});

// TODO remove default export
export default wildcard;
