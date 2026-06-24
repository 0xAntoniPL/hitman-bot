let mock = process.env.COVERAGE ? require("../lib-cov") : require("../lib");
let assert = require("assert");

describe("stdin", function() {
  let stdin;
  beforeEach(function() {
    stdin = mock.stdin();
  });
  afterEach(function() {
    process.stdin.restore();
    stdin = void 0;
  });

  it("process.stdin instanceof MockSTDIN", function() {
    assert(process.stdin instanceof mock.stdin.Class);
  });

  it("MockSTDIN#openStdin() should not throw", function() {
    assert.doesNotThrow(function() {
      process.openStdin();
    });
  });

  it("MockSTDIN#restore() should restore previous object", function() {
    process.stdin.restore();
    assert(!(process.stdin instanceof mock.stdin.Class));
    mock.stdin();
  });

  it("MockSTDIN#setEncoding() should not throw", function() {
    assert.doesNotThrow(function() {
      process.stdin.setEncoding("utf8");
    });
  });

  it("MockSTDIN#send(<Array>)", function() {
    let data = [
      "To whom it may concern,",
      "",
      "I am a piece of mock data.",
      "",
      "Regards,",
      "Cortana"
    ];
    let called = false;
    let received;
    let endCalled = false;
    let errors = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function(data) {
      called = true;
      received = data;
    });
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      endCalled = true;
    });
    process.stdin.resume();
    stdin.send(data);
    assert(called, "'data' event was not received.");
    assert.equal(received, data.join("\n"),
        "received data should be array joined by linefeeds.");
    assert.deepEqual(errors, [], "'error' event should not be received.");
    assert(!endCalled, "'end' event should not be received.");
  });

  it("MockSTDIN#send(<String>)", function() {
    let data = [
      "To whom it may concern,",
      "",
      "I am a piece of mock data.",
      "",
      "Regards,",
      "Cortana"
    ].join("\n");
    let received;
    let called = false;
    let errors = [];
    let endCalled = false;
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function(data) {
      called = true;
      received = data;
    });
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      endCalled = true;
    });
    process.stdin.resume();
    process.stdin.send(data);
    assert(called, "'data' event was not received.");
    assert.equal(received, data, "received data should match what was sent.");
    assert.deepEqual(errors, [], "'error' event should not be received.");
    assert(!endCalled, "'end' event should not be received.");
  });

  it("MockSTDIN#send(<Buffer>)", function () {
    let data = [
      "To whom it may concern,",
      "",
      "I am a piece of mock data.",
      "",
      "Regards,",
      "Cortana"
    ].join("\n");
    let received;
    let called = false;
    let errors = [];
    let endCalled = false;
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function(data) {
      called = true;
      received = data;
    });
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      endCalled = true;
    });
    process.stdin.resume();
    process.stdin.send(Buffer.from(data, "utf8"));
    assert(called, "'data' event was not received.");
    assert.equal(received, data, "received data should match what was sent.");
    assert.deepEqual(errors, [], "'error' event should not be received.");
    assert(!endCalled, "'end' event should not be received.");
  });

  it("MockSTDIN#send(<Null>)", function () {
    let called = false;
    let dataCalled = false;
    let errors = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      called = true;
    });
    process.stdin.on("data", function() {
      dataCalled = true;
    });
    process.stdin.resume();
    process.stdin.send(null);
    assert(!dataCalled, "'data' event should not be received.");
    assert.deepEqual(errors, [], "'error' event should not be received.");
    assert(called, "'end' event was not received.");
  });


  it("MockSTDIN#send(<Array>, <Encoding>)", function () {
    let endCalled = false;
    let data = '';
    let errors = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      endCalled = true;
    });
    process.stdin.on("data", function(text) {
      data += text;
    });
    process.stdin.resume();
    assert.throws(function() {
      process.stdin.send(["44GT44KT44Gr44Gh44Gv", "5LiW55WM"], "base64");
    }, TypeError, "should have thrown.");
  });

  it("MockSTDIN#send(<String>, <Encoding>)", function() {
    let endCalled = false;
    let data = '';
    let errors = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      endCalled = true;
    });
    process.stdin.on("data", function(text) {
      data += text;
    });
    process.stdin.resume();
    process.stdin.send("44GT44KT44Gr44Gh44Gv5LiW55WM", "base64");
    assert.equal(data, "こんにちは世界", "'data' should be decoded from base64.");
    assert.deepEqual(errors, [], "'error' event should not be received.");
    assert(!endCalled, "'end' event should not be received.");
  });

  it("MockSTDIN#end()", function(done) {
    let called = false;
    let dataCalled = false;
    let errors = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("error", function(error) {
      errors.push(error);
    });
    process.stdin.on("end", function() {
      called = true;
    });
    process.stdin.on("data", function() {
      dataCalled = true;
    });
    process.stdin.resume();
    process.stdin.end();
    assert(!dataCalled, "'data' event should not be received.");
    assert.deepEqual(errors, [], "'error' event should not be received.");
    assert(called, "'end' event was not received.");

    called = false;
    setTimeout(function() {
      assert(!called, "'end' event should not be dispatched more than once.");
      done();
    });
  });


  it("MockSTDIN#reset()", function() {
    let received = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on("data", function(data) {
      received += data;
    });
    process.stdin.end();
    assert(process.stdin._readableState.ended, "stream should be 'ended'.");
    assert(process.stdin._readableState.endEmitted, "'end' event should be dispatched.");
    process.stdin.reset();

    assert(!process.stdin._readableState.ended, "'ended' flag should be reset.");
    assert(!process.stdin._readableState.endEmitted, "'endEmitted' flag should be reset.");

    assert.doesNotThrow(function() {
      process.stdin.send("Please don't throw, little lamb!");
    }, "should not throw when sending data after end when reset() called");

    assert.equal(received, "Please don't throw, little lamb!");
  });

  it("MockSTDIN#reset(true)", function() {
    let received = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on("data", function(data) {
      received += data;
    });
    process.stdin.end();
    assert(process.stdin._readableState.ended, "stream should be 'ended'.");
    assert(process.stdin._readableState.endEmitted, "'end' event should be dispatched.");
    process.stdin.reset(true);

    process.stdin.on("data", function(data) {
      received += data;
    });

    assert(!process.stdin._readableState.ended, "'ended' flag should be reset.");
    assert(!process.stdin._readableState.endEmitted, "'endEmitted' flag should be reset.");

    assert.doesNotThrow(function() {
      process.stdin.send("Please don't throw, little lamb!");
    }, "should not throw when sending data after end when reset() called");

    assert.equal(received, "Please don't throw, little lamb!");
  });

  it("MockSTDIN#setRawMode(<String>)", function() {
    assert.throws(function() {
      process.stdin.setRawMode('');
    }, TypeError);
  });


  it("MockSTDIN#setRawMode(<Boolean>)", function() {
    assert.doesNotThrow(function() {
      process.stdin.setRawMode(true);
      process.stdin.setRawMode(false);
      process.stdin.end();
    });
  });
});
