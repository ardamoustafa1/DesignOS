#!/usr/bin/env node
'use strict';
const assert = require('assert');
const { signature, safeEqual, MAX_BYTES } = require('../runtime/gate/artifact-worker');
const body = JSON.stringify({ artifact: '<main></main>' });
const signed = signature('test-secret', '1700000000000', body);
assert.equal(safeEqual(signed, signature('test-secret', '1700000000000', body)), true);
assert.equal(safeEqual(signed, signature('wrong-secret', '1700000000000', body)), false);
assert.ok(MAX_BYTES >= Buffer.byteLength(body));
console.log('artifact-worker-protocol: HMAC integrity, constant-time equality and payload bound pass');
