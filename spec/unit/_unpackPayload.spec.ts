"use strict";

import bus = require("../../src/lib/framebus");

const messagePrefix = "/*framebus*/";

describe("_unpackPayload", function () {
  it("should return false if unparsable", function () {
    const actual = bus._unpackPayload({ data: "}{" });

    expect(actual).toBe(false);
  });

  it("should return false if not prefixed", function () {
    const actual = bus._unpackPayload({ data: JSON.stringify({}) });

    expect(actual).toBe(false);
  });

  it("should return event and args in payload", function () {
    const event = "event name";
    const args = ["my string"];
    const actual = bus._unpackPayload({
      data: messagePrefix + JSON.stringify({ event: event, args: args }),
    });

    expect(actual.event).toBe(event);
    expect(actual.args.length).toBe(1);
    expect(actual.args).toEqual(expect.arrayContaining(["my string"]));
  });

  it("should return event and args and reply in payload", function () {
    const event = "event name";
    const reply = "123129085-4234-1231-99887877";
    const args = ["some data"];
    const actual = bus._unpackPayload({
      data:
        messagePrefix +
        JSON.stringify({ event: event, replyEvent: reply, args: args }),
    });

    expect(actual.event).toBe(event);
    expect(actual.args[1]).toBeInstanceOf(Function);
    expect(actual.args[0]).toBe("some data");
  });

  it("the source should postMessage the payload to the origin when reply is called", function () {
    const fakeSource = {
      postMessage: jest.fn(),
    };
    const reply = "123129085-4234-1231-99887877";
    const args = ["some data"];
    const actual = bus._unpackPayload({
      source: fakeSource,
      origin: "origin",
      data:
        messagePrefix +
        JSON.stringify({ event: "event name", replyEvent: reply, args: args }),
    });

    actual.reply({});

    expect(fakeSource.postMessage).toBeCalledTimes(1);
    expect(fakeSource.postMessage).toBeCalledWith(expect.any(String), "origin");
  });

  it("the source should not attempt to postMessage the payload to the origin if no source available", function () {
    const reply = "123129085-4234-1231-99887877";
    const args = ["some data"];
    const actual = bus._unpackPayload({
      origin: "origin",
      data:
        messagePrefix +
        JSON.stringify({ event: "event name", replyEvent: reply, args: args }),
    });

    expect(function () {
      actual.reply({});
    }).not.toThrowError();
  });
});
