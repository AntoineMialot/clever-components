import { readFileSync } from 'fs';
import path from 'path';

const fileCache = new Map();
const typeCache = new Map();

function convertImports (ts, imports) {
  const asts = [];
  imports.forEach((typesSet, filename) => {
    let sourceCode;
    let sourceAst;
    const inMemory = fileCache.get(filename);
    if (!inMemory) {
      sourceCode = readFileSync(filename).toString();
      sourceAst = ts.createSourceFile(filename, sourceCode, ts.ScriptTarget.ES2015, true);
      fileCache.set(filename, { code: sourceCode, ast: sourceAst });
    }
    else {
      sourceCode = inMemory.code;
      sourceAst = inMemory.ast;
    }

    findSubtypes(ts, sourceAst, sourceCode, Array.from(typesSet)).forEach((type) => typesSet.add(type));
    typesSet.forEach((type) =>
      (typeCache.has(type))
        ? asts.push(typeCache.get(type))
        : asts.push(delint(ts, sourceAst, sourceCode, type)));
  });
  return asts.join('\n');
}

// TODO: rename function
function delint (ts, node, code, interfaceName) {
  const st = node?.statements.find((st) => st.name.getText() === interfaceName);
  const start = st?.modifiers?.find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)?.end ?? st?.pos;
  const typeDeclaration = code.substring(start, st?.end).trim();
  const typeDisplay = '```ts\n'
    + typeDeclaration
    + '\n```';
  typeCache.set(interfaceName, typeDisplay);
  return typeDisplay;
}

function findSubtypes (ts, node, code, types) {
  const formattedTypes = [];
  types?.forEach((type) => {
    const st = node?.statements.find((st) => st.name.getText() === type);
    // console.log(type);
    st.members?.forEach((member) => {
      // We need the OR for the same reason as above to catch types who are array of objects
      if (member.type.kind === ts.SyntaxKind.TypeReference || member.type?.elementType?.kind === ts.SyntaxKind.TypeReference) {
        // console.log(member.name.getText(), member.type?.typeName?.getText() || member.type?.elementType?.typeName?.getText());
        formattedTypes.push(member.type?.typeName?.getText() || member.type?.elementType?.typeName?.getText());
      }
    });
  });
  return formattedTypes;
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

          // console.log(node?.members.kind === ts.SyntaxKind.Constructor);
          const constructor = node?.members.find((mb) => mb.kind === ts.SyntaxKind.Constructor);
          const types = [];
          const imports = new Map();
          constructor?.body.statements.forEach((mb) => {
            const fieldName = mb?.expression?.left?.name.getText();
            const isFieldPrivate = fieldName?.[0] === '_';
            const fieldDoc = mb.jsDoc?.[0].tags?.[0].typeExpression;
            // We need to have an or to find types who are object arrays e.g: Plan[] for example
            const customType = fieldDoc?.type?.typeName?.getText() || fieldDoc?.type?.elementType?.typeName?.getText();
            if (!isFieldPrivate && customType) {
              types.push(customType);
            }
            // console.log(types);
          });

          node?.jsDoc?.forEach((jsDoc) => {

            jsDoc?.tags
              ?.filter((tag) => tag.tagName.getText() === 'typedef' && (tag.typeExpression.type.kind === ts.SyntaxKind.ImportType))
              ?.forEach((tag) => {

                const moduleDir = path.parse(moduleDoc.path).dir;
                // Remove leading and ending quotes
                const typeRelativePath = tag.typeExpression.type.argument?.literal.getText().slice(1, -1);
                const { dir: typeDir, name: typeName } = path.parse(typeRelativePath);

                const typeToTs = path.format({ name: typeName, ext: '.d.ts' });
                const typePath = path.resolve(rootDir, moduleDir, typeDir, typeToTs);

                const typeDefDisplay = tag.name.getText();
                const type = types.find((type) => type === typeDefDisplay);
                // console.log(typeDefDisplay);
                // console.log('ftype', type, 'typepath', typePath);
                if (type != null) {
                  if (!imports.has(typePath)) {
                    imports.set(typePath, new Set());
                  }
                  imports.get(typePath).add(type);
                }

                // console.log(imports);
              });

          });
          const convertedImports = convertImports(ts, imports);
          // console.log(convertedImports);
          const displayText = (convertedImports) ? '### Type Definitions\n\n' + convertedImports : '';
          const declaration = moduleDoc.declarations.find((declaration) => declaration.name === node.name.getText());

          declaration.description = declaration.description + '\n\n' + displayText;

      }
    },
  };
}
