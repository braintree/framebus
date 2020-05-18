import { detach } from "../../src/lib/attach";

afterEach(function () {
  jest.restoreAllMocks();
  detach();
});
