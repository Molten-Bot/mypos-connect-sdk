import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const repositoryRoot = new URL('../', import.meta.url);
const readmePath = new URL('README.md', repositoryRoot);
const fixturePath = new URL('tests/fixtures/mypos-connect-sdk.d.ts', repositoryRoot);
const typescriptCompilerPath = new URL('node_modules/typescript/bin/tsc', repositoryRoot);
const executeFile = promisify(execFile);
const readme = await readFile(readmePath, 'utf8');
const fixture = await readFile(fixturePath, 'utf8');

const snippets = [...readme.matchAll(/```(?:ts|typescript)\s*\n([\s\S]*?)```/g)].map(
  (match) => match[1],
);

if (snippets.length === 0) {
  throw new Error('README.md must contain at least one TypeScript code block');
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'mypos-connect-readme-'));

try {
  const fixtureFile = join(temporaryDirectory, 'mypos-connect-sdk.d.ts');
  const snippetFiles = snippets.map((_, index) => join(temporaryDirectory, `snippet-${index + 1}.mts`));
  const tsconfigFile = join(temporaryDirectory, 'tsconfig.json');

  await Promise.all([
    writeFile(fixtureFile, fixture),
    ...snippets.map((snippet, index) => writeFile(snippetFiles[index], snippet)),
    writeFile(
      tsconfigFile,
      JSON.stringify({
        compilerOptions: {
          lib: ['ES2022', 'DOM'],
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: 'ES2022',
        },
        files: [fixtureFile, ...snippetFiles],
      }),
    ),
  ]);

  await executeFile(process.execPath, [typescriptCompilerPath.pathname, '--project', tsconfigFile], {
    cwd: temporaryDirectory,
  });

  console.log(`Type-checked ${snippets.length} README TypeScript snippets.`);
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
