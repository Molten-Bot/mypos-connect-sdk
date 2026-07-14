import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import ts from 'typescript';

const repositoryRoot = new URL('../', import.meta.url);
const readmePath = new URL('README.md', repositoryRoot);
const fixturePath = new URL('tests/fixtures/mypos-connect-sdk.d.ts', repositoryRoot);
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
  const snippetFiles = snippets.map((_, index) => join(temporaryDirectory, `snippet-${index + 1}.ts`));

  await Promise.all([
    writeFile(fixtureFile, fixture),
    ...snippets.map((snippet, index) => writeFile(snippetFiles[index], snippet)),
  ]);

  const program = ts.createProgram([fixtureFile, ...snippetFiles], {
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: false,
    strict: true,
    target: ts.ScriptTarget.ES2022,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length > 0) {
    const host = {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => temporaryDirectory,
      getNewLine: () => '\n',
    };
    throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
  }

  console.log(`Type-checked ${snippets.length} README TypeScript snippets.`);
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
