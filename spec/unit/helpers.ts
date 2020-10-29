import { detach } from "../../src/lib/attach";

afterEach(() => {
  jest.restoreAllMocks();
  detach();
});
