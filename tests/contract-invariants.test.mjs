import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parse } from 'yaml';

const contractPath = new URL('../openapi.yaml', import.meta.url);
const packageManifestPath = new URL('../package.json', import.meta.url);
const publishWorkflowPath = new URL('../.github/workflows/publish-npm.yml', import.meta.url);
const stainlessConfigPath = new URL('../stainless.yml', import.meta.url);
const source = await readFile(contractPath, 'utf8');
const packageManifestSource = await readFile(packageManifestPath, 'utf8');
const publishWorkflowSource = await readFile(publishWorkflowPath, 'utf8');
const stainlessSource = await readFile(stainlessConfigPath, 'utf8');
const contract = parse(source);
const packageManifest = JSON.parse(packageManifestSource);
const publishWorkflow = parse(publishWorkflowSource);
const stainless = parse(stainlessSource);

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

function findOperation(method, path) {
  const entry = operations.find((candidate) => candidate.method === method && candidate.path === path);
  assert.ok(entry, `${method.toUpperCase()} ${path} must exist`);
  return entry.operation;
}

function jsonSchemaRef(operation, status = '200') {
  return operation.responses?.[status]?.content?.['application/json']?.schema?.$ref;
}

const stainlessMethods = collectStainlessMethods(stainless.resources);

function collectStainlessMethods(resources, parentNames = []) {
  return Object.entries(resources ?? {}).flatMap(([resourceName, resource]) => {
    const resourceNames = [...parentNames, resourceName];
    const methods = Object.entries(resource.methods ?? {}).map(([methodName, method]) => ({
      config: method,
      name: [...resourceNames, methodName].join('.'),
    }));

    return [...methods, ...collectStainlessMethods(resource.subresources, resourceNames)];
  });
}

function parseStainlessEndpoint(method) {
  assert.equal(method.config.type, 'http', `${method.name} must be an HTTP method`);
  assert.equal(typeof method.config.endpoint, 'string', `${method.name} must map an endpoint`);

  const match = /^(delete|get|head|options|patch|post|put|trace) (\/\S+)$/.exec(
    method.config.endpoint,
  );
  assert.ok(match, `${method.name} has an invalid endpoint mapping: ${method.config.endpoint}`);

  return { method: match[1], path: match[2] };
}

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

test('publishable metadata and documented tags cover every operation', () => {
  assert.equal(contract.info?.license?.name, 'MIT');
  assert.match(contract.info?.license?.url ?? '', /^https:\/\//);

  const tagNames = (contract.tags ?? []).map((tag) => {
    assert.match(tag.name ?? '', /\S/);
    assert.match(tag.description ?? '', /\S/);
    return tag.name;
  });
  assert.equal(new Set(tagNames).size, tagNames.length, 'tag names must be unique');

  for (const entry of operations) {
    assert.match(entry.operation.summary ?? '', /\S/, `${operationLabel(entry)} needs a summary`);
    assert.ok(entry.operation.tags?.length, `${operationLabel(entry)} needs at least one tag`);
    for (const tag of entry.operation.tags) {
      assert.ok(tagNames.includes(tag), `${operationLabel(entry)} references unknown tag ${tag}`);
    }
    assert.match(
      jsonSchemaRef(entry.operation) ?? '',
      /^#\/components\/schemas\//,
      `${operationLabel(entry)} must expose a shared JSON success schema`,
    );
  }
});

test('sample-backed request wrappers and deliberately unknown responses cannot regress', () => {
  assert.equal(findOperation('post', '/auth/token').requestBody, undefined);

  const requestSchemas = new Map([
    ['post /naCustomers', '#/components/schemas/CustomerCreateRequest'],
    ['put /naCustomers/{CustomerCode}', '#/components/schemas/CustomerUpdateRequest'],
    ['put /globalcustomers/{EmailAddress}', '#/components/schemas/GlobalCustomerUpdateRequest'],
    ['post /CommitQty', '#/components/schemas/CommitQuantityRequest'],
    ['post /CommitPts', '#/components/schemas/CommitPointsRequest'],
    ['post /Sale', '#/components/schemas/SaleRequest'],
  ]);

  for (const [endpoint, reference] of requestSchemas) {
    const [method, path] = endpoint.split(' ');
    assert.equal(
      findOperation(method, path).requestBody?.content?.['application/json']?.schema?.$ref,
      reference,
      `${endpoint} must retain its sample-backed request wrapper`,
    );
  }

  const unknownSuccesses = [
    ['post', '/auth/token'],
    ['post', '/naCustomers'],
    ['put', '/naCustomers/{CustomerCode}'],
    ['put', '/globalcustomers/{EmailAddress}'],
    ['post', '/CommitQty'],
    ['get', '/CommitQty/{OrderNumber}'],
    ['post', '/CommitPts'],
    ['post', '/Sale'],
  ];
  for (const [method, path] of unknownSuccesses) {
    assert.equal(
      jsonSchemaRef(findOperation(method, path)),
      '#/components/schemas/UnverifiedJSONResponse',
      `${method.toUpperCase()} ${path} must remain unconstrained until a fixture is reviewed`,
    );
  }
});

test('sample-backed list, casing, decimal, and sale structures are preserved', () => {
  const listSchemas = new Map([
    ['ProductListResponse', 'Product'],
    ['StoreProductListResponse', 'StoreProduct'],
    ['StoreProductWithOnOrderListResponse', 'StoreProductWithOnOrder'],
    ['SerialNumberStatusResponse', 'SerialNumberStatus'],
    ['GlobalCustomerListResponse', 'GlobalCustomerResponseEnvelope'],
    ['StoreListResponse', 'StoreResponseEnvelope'],
  ]);

  for (const [schemaName, itemName] of listSchemas) {
    const schema = contract.components?.schemas?.[schemaName];
    assert.equal(schema?.type, 'array', `${schemaName} must remain a direct array`);
    assert.equal(schema?.items?.$ref, `#/components/schemas/${itemName}`);
  }

  assert.equal(contract.components?.schemas?.DecimalString?.type, 'string');
  assert.ok(contract.components?.schemas?.Product?.properties?.buttonText);
  assert.ok(contract.components?.schemas?.Product?.properties?.buttontext);
  assert.ok(contract.components?.schemas?.StoreProduct?.properties?.storeCode);
  assert.equal(contract.components?.schemas?.StoreProduct?.properties?.StoreCode, undefined);
  assert.ok(contract.components?.schemas?.Sale?.properties?.Discount);
  assert.equal(contract.components?.schemas?.Sale?.properties?.Discounts, undefined);
  assert.equal(contract.components?.schemas?.SaleRequest?.properties?.Sales?.writeOnly, true);
});

test('Stainless maps every OpenAPI operation exactly once, including nested resources', () => {
  const openapiEndpoints = operations.map(({ method, path }) => `${method} ${path}`).sort();
  const stainlessEndpoints = stainlessMethods
    .map((method) => {
      const endpoint = parseStainlessEndpoint(method);
      return `${endpoint.method} ${endpoint.path}`;
    })
    .sort();

  assert.equal(stainlessEndpoints.length, 20);
  assert.equal(
    new Set(stainlessEndpoints).size,
    stainlessEndpoints.length,
    'Stainless endpoint mappings must not be duplicated',
  );
  assert.deepEqual(
    stainlessEndpoints,
    openapiEndpoints,
    'Stainless endpoint mappings must exactly match the OpenAPI operations',
  );
});

test('Stainless retries reads and never retries mutations by default', () => {
  assert.equal(stainless.client_settings?.default_retries?.max_retries, 0);

  for (const method of stainlessMethods) {
    const endpoint = parseStainlessEndpoint(method);
    const expectedRetries = endpoint.method === 'get' ? 2 : 0;

    assert.ok(
      ['get', 'post', 'put'].includes(endpoint.method),
      `${method.name} must receive an explicit retry-policy review for ${endpoint.method.toUpperCase()}`,
    );
    assert.equal(
      method.config.default_request_options?.max_retries,
      expectedRetries,
      `${method.name} must set max_retries=${expectedRetries}`,
    );
  }
});

test('Stainless generation and package settings preserve the approved release boundaries', () => {
  assert.equal(stainless.edition, '2026-05-06');
  assert.equal(stainless.organization?.github_org, 'Molten-Bot');
  assert.equal(stainless.organization?.upload_spec, true);
  assert.equal(stainless.settings?.per_endpoint_security, true);
  assert.equal(stainless.client_settings?.default_env_prefix, 'MYPOS_CONNECT');
  assert.equal(stainless.environments?.production, 'https://api.myposconnect.com/api/v2');

  const target = stainless.targets?.typescript;
  assert.equal(target?.edition, 'typescript.2025-10-10');
  assert.equal(target?.package_name, '@molten-ai/mypos-connect-sdk');
  assert.equal(target?.package_name, packageManifest.name);
  assert.equal(target?.production_repo, 'Molten-Bot/mypos-connect-typescript');
  assert.deepEqual(target?.publish?.npm, {
    auth_method: 'oidc',
    release_environment: 'npm-release',
  });
  assert.equal(target?.options?.package_manager, 'pnpm');
  assert.equal(target?.options?.enable_treeshaking, true);
  assert.equal(target?.options?.browser?.state, 'disallow');
  assert.ok(target?.options?.browser?.message?.includes('credentials are confidential'));

  const mcp = target?.options?.mcp_server;
  assert.equal(mcp?.package_name, '@molten-ai/mypos-connect-mcp');
  assert.equal(mcp?.enable_code_tool, false);
  assert.equal(mcp?.enable_docs_tool, true);
  assert.equal(mcp?.generate_cloudflare_worker, false);
  assert.match(mcp?.instructions ?? '', /documentation-only/i);
  assert.match(mcp?.instructions ?? '', /cannot execute API requests/i);
});

test('the npm release workflow preserves the trusted publishing boundary', () => {
  assert.equal(packageManifest.private, undefined);
  assert.equal(packageManifest.publishConfig?.access, 'public');
  assert.deepEqual(publishWorkflow.on?.release?.types, ['published']);
  assert.equal(publishWorkflow.permissions?.contents, 'read');
  assert.equal(publishWorkflow.permissions?.['id-token'], 'write');

  const publishJob = publishWorkflow.jobs?.publish;
  assert.equal(publishJob?.['runs-on'], 'ubuntu-24.04');
  assert.equal(publishJob?.environment, 'npm-release');

  const setupNode = publishJob?.steps?.find((step) => step.name === 'Set up Node.js and npm registry');
  assert.equal(setupNode?.with?.['node-version'], 24);
  assert.equal(setupNode?.with?.['registry-url'], 'https://registry.npmjs.org');
  assert.equal(setupNode?.with?.['package-manager-cache'], false);

  const publishStep = publishJob?.steps?.find((step) => step.name === 'Publish package');
  assert.equal(publishStep?.run, 'npm publish --access public --provenance');
});

test('Stainless reads every credential from the approved downstream environment variable', () => {
  const options = stainless.client_settings?.opts;

  for (const optionName of ['access_token', 'username', 'password']) {
    assert.equal(
      Object.hasOwn(options?.[optionName] ?? {}, 'default'),
      false,
      `${optionName} must not have an embedded default`,
    );
  }

  assert.deepEqual(
    {
      read_env: options?.access_token?.read_env,
      security_scheme: options?.access_token?.auth?.security_scheme,
    },
    {
      read_env: 'MYPOS_CONNECT_ACCESS_TOKEN',
      security_scheme: 'bearerAuth',
    },
  );
  assert.deepEqual(
    {
      read_env: options?.username?.read_env,
      role: options?.username?.auth?.role,
      security_scheme: options?.username?.auth?.security_scheme,
    },
    {
      read_env: 'MYPOS_CONNECT_USERNAME',
      role: 'username',
      security_scheme: 'basicAuth',
    },
  );
  assert.deepEqual(
    {
      read_env: options?.password?.read_env,
      role: options?.password?.auth?.role,
      security_scheme: options?.password?.auth?.security_scheme,
    },
    {
      read_env: 'MYPOS_CONNECT_PASSWORD',
      role: 'password',
      security_scheme: 'basicAuth',
    },
  );
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

  const sensitiveKeys = new Set([
    'accesstoken',
    'apikey',
    'authorization',
    'clientsecret',
    'password',
    'secret',
    'token',
  ]);
  const pending = [{ path: [], value: contract }];

  while (pending.length > 0) {
    const current = pending.pop();
    if (Array.isArray(current.value)) {
      current.value.forEach((value, index) =>
        pending.push({ path: [...current.path, String(index)], value }),
      );
      continue;
    }
    if (current.value === null || typeof current.value !== 'object') {
      continue;
    }

    for (const [key, value] of Object.entries(current.value)) {
      const path = [...current.path, key];
      const normalizedKey = key.replaceAll(/[-_]/g, '').toLowerCase();

      if (sensitiveKeys.has(normalizedKey) && ['string', 'number'].includes(typeof value)) {
        assert.fail(`${path.join('.')} must not contain a literal credential`);
      }
      pending.push({ path, value });
    }
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
