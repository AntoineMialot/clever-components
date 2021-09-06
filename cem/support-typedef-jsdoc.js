import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

function convertFile (ts, filename, interfaceName) {
  const sourceCode = readFileSync(filename).toString();
  const sourceAst = ts.createSourceFile(filename, sourceCode, ts.ScriptTarget.ES2015, true);
  return delint(ts, sourceAst, sourceCode, interfaceName);
}

// TODO: rename function
function delint (ts, node, code, interfaceName) {
  const st = node?.statements.find((st) => st.name.getText() === interfaceName);
  const start = st.modifiers?.find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)?.end ?? st.pos;
  const typeDeclaration = code.substring(start, st.end).trim();
  return '```ts\n'
    + typeDeclaration
    + '\n```';
}

export default function supportTypedefJsdoc () {
  const rootDir = process.cwd();
  return {
    name: 'support-typedef-jsdoc',
    analyzePhase ({ ts, node, moduleDoc }) {

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          // go through public fields in constructor
          // list all public types
          // list all imports
          // convert imports to AST
          // extract types and subtypes only once
          // for one path of file store file and AST in RAM (cache)
          // Put ## type definitions if there's types import
          node?.jsDoc?.forEach((jsDoc) => {

            jsDoc?.tags
              ?.filter((tag) => tag.tagName.getText() === 'typedef')
              ?.forEach((tag) => {
                // TODO : put this in filter
                if (tag.typeExpression.type.kind !== ts.SyntaxKind.ImportType) {
                  return;
                }

                const moduleDir = path.parse(moduleDoc.path).dir;
                // Remove leading and ending quotes
                const typeRelativePath = tag.typeExpression.type.argument?.literal.getText().slice(1, -1);
                const { dir: typeDir, name: typeName } = path.parse(typeRelativePath);

                const typeToTs = path.format({ name: typeName, ext: '.d.ts' });
                const typePath = path.resolve(rootDir, moduleDir, typeDir, typeToTs);

                const typeDefDisplay = tag.name.getText();

                const converted = convertFile(ts, typePath, typeDefDisplay);

                const declaration = moduleDoc.declarations.find((declaration) => declaration.name === node.name.getText());

                declaration.description = declaration.description + '\n\n' + converted;

              });
          });

      }
    },
  };
}
