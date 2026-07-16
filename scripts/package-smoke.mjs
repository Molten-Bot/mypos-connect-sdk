import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PACKAGE_NAME = '@molten-ai/mypos-connect-sdk';
const MINIMUM_NODE_MAJOR = 22;
const REQUIRED_FILES = [
  'LICENSE',
  'README.md',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.cts',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/index.js.map',
  'package.json',
];
const ALLOWED_DIST_FILE = /(?:\.c?js(?:\.map)?|\.d\.(?:c|m)?ts(?:\.map)?)$/u;

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    timeout: 120_000,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(
      `${command} ${args.join(' ')} exited with status ${String(result.status)}` +
        (details ? `\n${details}` : ''),
    );
  }

  return result.stdout;
}

function assertSupportedNode() {
  const major = Number.parseInt(process.versions.node.split('.')[0], 10);
  assert.ok(
    major >= MINIMUM_NODE_MAJOR,
    `Package smoke tests require Node ${MINIMUM_NODE_MAJOR}+; found ${process.version}`,
  );
}

function parsePackResult(output) {
  let results;

  try {
    results = JSON.parse(output);
  } catch (error) {
    throw new Error(`Could not parse npm pack output:\n${output}`, { cause: error });
  }

  assert.ok(Array.isArray(results) && results.length === 1, 'npm pack returned one result');
  const [result] = results;
  assert.equal(result.name, PACKAGE_NAME, 'npm pack used the expected package name');
  assert.equal(typeof result.filename, 'string', 'npm pack returned a tarball filename');
  assert.ok(Array.isArray(result.files), 'npm pack returned its file manifest');

  return result;
}

function assertTarballContents(packResult) {
  const files = packResult.files.map(({ path: filePath }) => filePath).sort();

  for (const requiredFile of REQUIRED_FILES) {
    assert.ok(files.includes(requiredFile), `tarball includes ${requiredFile}`);
  }

  for (const filePath of files) {
    const isMetadata =
      filePath === 'LICENSE' || filePath === 'README.md' || filePath === 'package.json';
    const isCompiledOutput =
      filePath.startsWith('dist/') &&
      filePath.length > 'dist/'.length &&
      ALLOWED_DIST_FILE.test(filePath);

    assert.ok(
      isMetadata || isCompiledOutput,
      `tarball contains only package metadata and compiled dist output; found ${filePath}`,
    );
  }

  const forbiddenSegments = [
    '.github/',
    'scripts/',
    'src/',
    'tests/',
    'openapi.yaml',
    'sdk.md',
    'openapi-ts.config',
    'tsconfig',
    'tsup.config',
    'vitest.config',
  ];

  for (const forbidden of forbiddenSegments) {
    assert.ok(
      files.every((filePath) => !filePath.startsWith(forbidden)),
      `tarball excludes ${forbidden}`,
    );
  }
}

function assertModuleLoads(projectDirectory, mode) {
  const isEsm = mode === 'esm';
  const source = isEsm
    ? `
        import SDK, { MyPOSConnect, MyPOSConnectError } from '${PACKAGE_NAME}';
        if (SDK !== MyPOSConnect) throw new Error('default and named clients differ');
        if (typeof MyPOSConnectError !== 'function') throw new Error('missing error export');
        let request;
        const client = new SDK({
          accessToken: 'esm-token',
          fetch: async (input, init) => {
            request = new Request(input, init);
            return Response.json([]);
          },
        });
        const stores = await client.stores.list();
        if (!Array.isArray(stores)) throw new Error('ESM call did not return its body');
        if (request.headers.get('authorization') !== 'Bearer esm-token') {
          throw new Error('ESM client did not use bearer authentication');
        }
      `
    : `
        const sdk = require('${PACKAGE_NAME}');
        if (sdk.default !== sdk.MyPOSConnect) throw new Error('default and named clients differ');
        if (typeof sdk.MyPOSConnectError !== 'function') throw new Error('missing error export');
        let request;
        const client = new sdk.MyPOSConnect({
          accessToken: 'cjs-token',
          fetch: async (input, init) => {
            request = new Request(input, init);
            return Response.json([]);
          },
        });
        client.stores.list().then((stores) => {
          if (!Array.isArray(stores)) throw new Error('CommonJS call did not return its body');
          if (request.headers.get('authorization') !== 'Bearer cjs-token') {
            throw new Error('CommonJS client did not use bearer authentication');
          }
        });
      `;

  run(process.execPath, [isEsm ? '--input-type=module' : '--input-type=commonjs', '--eval', source], {
    cwd: projectDirectory,
  });
}

async function main() {
  assertSupportedNode();

  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), 'mypos-connect-sdk-package-smoke-'),
  );

  try {
    const packOutput = run('npm', [
      'pack',
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      temporaryDirectory,
    ]);
    const packResult = parsePackResult(packOutput);
    assertTarballContents(packResult);

    const tarballPath = path.join(temporaryDirectory, packResult.filename);
    const projectDirectory = path.join(temporaryDirectory, 'consumer');
    await mkdir(projectDirectory);
    await writeFile(
      path.join(projectDirectory, 'package.json'),
      `${JSON.stringify({ private: true }, null, 2)}\n`,
    );

    run(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        '--offline',
        tarballPath,
      ],
      { cwd: projectDirectory },
    );

    const installedManifest = JSON.parse(
      await readFile(
        path.join(projectDirectory, 'node_modules', ...PACKAGE_NAME.split('/'), 'package.json'),
        'utf8',
      ),
    );
    assert.equal(installedManifest.name, PACKAGE_NAME);
    assert.equal(installedManifest.version, packResult.version);
    assert.deepEqual(
      installedManifest.dependencies ?? {},
      {},
      'published package has no runtime dependencies',
    );

    assertModuleLoads(projectDirectory, 'esm');
    assertModuleLoads(projectDirectory, 'cjs');

    console.log(
      `Package smoke test passed for ${PACKAGE_NAME}@${packResult.version} on ${process.version}.`,
    );
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
}

await main();
