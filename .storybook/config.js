import { addDecorator, addParameters, configure } from '@storybook/html';
import { create } from '@storybook/theming';
import { i18nKnob } from '../stories/lib/i18n-knob';
import { withKnobs } from '@storybook/addon-knobs';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);

addDecorator(withKnobs);

// Add global language selector knob on each story
addDecorator((storyFn) => {
  i18nKnob();
  return storyFn();
});

const cleverTheme = create({
  brandTitle: 'Clever Cloud components',
  brandUrl: 'https://www.clever-cloud.com',
  brandImage: 'https://www.clever-cloud.com/images/brand-assets/logos/v2/logo_on_white.svg',
});

addParameters({
  options: {
    enableShortcuts: true,
    theme: cleverTheme,
  },
});

function loadStories () {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
