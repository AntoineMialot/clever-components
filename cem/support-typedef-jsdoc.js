import { readFileSync } from 'fs';

function convertFile (ts, filename, interfaceName) {
  const sourceFile = ts.createSourceFile(filename, readFileSync(filename).toString(), ts.ScriptTarget.ES2015, true);
  return delint(ts, sourceFile, interfaceName);
}

function delint (ts, node, interfaceName) {
  const st = node?.statements.find((st) => st.name.getText() === interfaceName);
  if (st?.type?.types) {
    return '```js\n'
      + 'type ' + st.name.getText() + ': '
      + (st?.type?.types.map((type) => `'${type.literal.text}'`).join(' | ') ?? '')
      + '\n```';
  }
  return '```js\n'
    + 'interface ' + st?.name.getText() + ' { \n'
    + st?.members?.map((mb) => `${mb?.name.getText()}: ${mb?.type.getText()},`).join('\n')
    + '\n}\n ```';

}

export default function supportTypedefJsdoc () {
  return {
    name: 'support-typedef-jsdoc',
    analyzePhase ({ ts, node, moduleDoc }) {

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:

          node?.jsDoc?.forEach((jsDoc) => {

            jsDoc?.tags
              ?.filter((tag) => tag.tagName.getText() === 'typedef')
              ?.forEach((tag) => {

                const typeDefDisplay = tag.name.getText();

                const url = new URL(moduleDoc.path, import.meta.url);
                const path = tag.typeExpression.type.argument?.literal.getText().split('\'')[1] + '';
                const convertedPath = path.substring(0, path.lastIndexOf('.'));
                const typeUrl = new URL(convertedPath ? convertedPath + '.d.ts' : 'types.d.ts', url.toString().split('/cem').join(''));
                const converted = convertFile(ts, typeUrl.pathname, typeDefDisplay);

                const declaration = moduleDoc.declarations.find((declaration) => declaration.name === node.name.getText());

                declaration.description = declaration.description + '\n\n' + converted;

              });
          });

      }
    },
  };
}
