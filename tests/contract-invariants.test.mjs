import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parse } from 'yaml';

const contractPath = new URL('../openapi.yaml', import.meta.url);
const source = await readFile(contractPath, 'utf8');
const contract = parse(source);

const HTTP_METHODS = new Set([
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
]);

const operations = Object.entries(contract.paths ?? {}).flatMap(([path, pathItem]) =>
  Object.entries(pathItem ?? {})
    .filter(([method]) => HTTP_METHODS.has(method))
    .map(([method, operation]) => ({ method, operation, path })),
);

const operationLabel = ({ method, path }) => `${method.toUpperCase()} ${path}`;

test('the contract exposes the reviewed set of 20 operations', () => {
  assert.equal(contract.openapi, '3.0.3');
  assert.equal(operations.length, 20);
});

test('every operation has a unique, generator-safe operationId', () => {
  const operationIds = operations.map(({ operation, ...entry }) => {
    assert.equal(
      typeof operation.operationId,
      'string',
      `${operationLabel(entry)} must define operationId`,
    );
    assert.match(
      operation.operationId,
      /^[A-Za-z][A-Za-z0-9]*$/,
      `${operationLabel(entry)} has an unsafe operationId`,
    );
    return operation.operationId;
  });

  assert.equal(new Set(operationIds).size, operationIds.length, 'operationIds must be unique');
});

test('Basic auth is isolated to token creation and all other operations use bearer auth', () => {
  const bearerSecurity = [{ bearerAuth: [] }];
  const basicSecurity = [{ basicAuth: [] }];

  assert.deepEqual(contract.security, bearerSecurity);
  assert.deepEqual(contract.components?.securitySchemes?.bearerAuth, {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });
  assert.deepEqual(contract.components?.securitySchemes?.basicAuth, {
    type: 'http',
    scheme: 'basic',
  });

  for (const entry of operations) {
    const effectiveSecurity = entry.operation.security ?? contract.security;
    const expectedSecurity =
      entry.path === '/auth/token' && entry.method === 'post' ? basicSecurity : bearerSecurity;

    assert.deepEqual(
      effectiveSecurity,
      expectedSecurity,
      `${operationLabel(entry)} has an unexpected authentication boundary`,
    );
  }
});

test('every operation shares the reviewed 4XX and 5XX error responses', () => {
  const expectedResponses = new Map([
    ['4XX', '#/components/responses/ClientError'],
    ['5XX', '#/components/responses/ServerError'],
  ]);

  for (const entry of operations) {
    for (const [status, reference] of expectedResponses) {
      assert.deepEqual(
        entry.operation.responses?.[status],
        { $ref: reference },
        `${operationLabel(entry)} must reference ${reference} for ${status}`,
      );
    }

    for (const [status, response] of Object.entries(entry.operation.responses ?? {})) {
      if (/^[45](?:\d{2}|XX)$/.test(status)) {
        assert.equal(
          typeof response?.$ref,
          'string',
          `${operationLabel(entry)} ${status} must use a shared response reference`,
        );
      }
    }
  }

  assert.equal(
    contract.components?.responses?.ClientError?.content?.['application/json']?.schema?.$ref,
    '#/components/schemas/Error',
  );
  assert.equal(
    contract.components?.responses?.ServerError?.content?.['application/json']?.schema?.$ref,
    '#/components/schemas/Error',
  );
});

test('the contract contains no embedded credentials or credential-bearing server URLs', () => {
  const secretPatterns = new Map([
    ['private key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
    ['GitHub token', /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/],
    ['npm token', /\bnpm_[A-Za-z0-9]{30,}\b/],
    ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
    ['bearer JWT', /\bBearer\s+eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/i],
  ]);

  for (const [label, pattern] of secretPatterns) {
    assert.doesNotMatch(source, pattern, `openapi.yaml contains a possible ${label}`);
  }

  for (const [index, server] of (contract.servers ?? []).entries()) {
    const url = new URL(server.url);
    assert.equal(url.protocol, 'https:', `server ${index} must use HTTPS`);
    assert.equal(url.username, '', `server ${index} must not contain a username`);
    assert.equal(url.password, '', `server ${index} must not contain a password`);

    for (const key of url.searchParams.keys()) {
      assert.doesNotMatch(
        key,
        /^(?:access_?token|api_?key|authorization|password|secret)$/i,
        `server ${index} must not carry credentials in its query string`,
      );
    }
  }
});
