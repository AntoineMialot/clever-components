import { readFileSync } from 'fs';

function convertFile (ts, filename, interfaceName) {
  const sourceFile = ts.createSourceFile(filename, readFileSync(filename).toString(), ts.ScriptTarget.ES2015, true);
  return delint(ts, sourceFile, interfaceName);
}

function delint (ts, node, interfaceName) {
  const interfaces = [];
  const st = node?.statements.find((st) => st.name.getText() === interfaceName);
  interfaces.push(`
      interface ${st?.name.getText()} {
        ${st?.members?.map((mb) => `${mb.name.getText()}: ${mb.type.getText()}`).join('\n')}
      }
    `);

  return interfaces;
}

/**
 * CEM analyzer plugin: support-cssdisplay-jsdoc
 *
 * This plugin adds support for the @cssdisplay JSDoc tag.
 * This JSDoc tag helps author to document the default display of a custom element.
 *
 * This plugin will add a custom field "cssDisplay" to the CEM.
 * This plugin will also add this info at the beginning of the description, just after the first empty line.
 */
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
                console.log(tag);

                const typeDefDisplay = tag.name.getText();

                const classDeclaration = moduleDoc.declarations.find((declaration) => declaration.name === node.name.getText());
                classDeclaration.typeDef = typeDefDisplay;

                const url = new URL(moduleDoc.path, import.meta.url);
                const typeUrl = new URL('types.d.ts', url.toString().split('/cem').join(''));
                const converted = convertFile(ts, typeUrl.pathname, typeDefDisplay);

                // const displayLine = `🎨 default typedef display: \`${typeDefDisplay}\` ${tag.typeExpression.type.argument?.literal.getText()} ${converted[2]}`;
                const displayLine = converted;
                const descriptionLines = classDeclaration.description.split('\n');
                const firstEmptyLineIndex = descriptionLines.findIndex((line) => line === '');
                if (firstEmptyLineIndex === -1) {
                  descriptionLines.push('', displayLine);
                }
                else {
                  descriptionLines.splice(firstEmptyLineIndex, 0, '', displayLine);
                }
                classDeclaration.description = descriptionLines.join('\n');
              });
          });

      }
    },
  };
}
