import '../../src/saas/cc-grafana-info.js';
import { makeStory, storyWait } from '../lib/make-story.js';
import { enhanceStoriesNames } from '../lib/story-names.js';

export default {
  title: '🛠 SaaS/<cc-grafana-info>',
  component: 'cc-grafana-info',
};

const conf = {
  component: 'cc-grafana-info',
  css: `
    cc-grafana-info {
      margin-bottom: 1rem;
    }
  `,
};

const grafanaLink = { type: 'grafana', href: 'https://my-grafana.com' };

// On a besoin de quelles stories:
// * je sais pas encore si l'orga a le grafana disabled ou enabled => loading
//   * => un cc-loader + message entre doc et screenshots
// * j'ai des données (est-ce que disabled ou enabled)
//   * dataLoadedWithEnabled
//   * dataLoadedWithDisabled
// * error chargement des données
//   * => le message d'erreur entre doc et screenshots
// * je suis en train de travailler
//   * => waiting (en train de disable ou enable)
//   * => refreshing (en train de refresh)
// * => error action
//   * => error disable
//   * => error enable
//   * => error refresh
// * simus
//   * skeleton => data
//   * skeleton => error
//   * data => waiting => data
//   * data => waiting => error

// I/O du composants vv
// * error: false|"refreshing"|"loading"|"disabling"|"enabling"
// * status: null|"enabled"|"disabled"
// * waiting: null|"refreshing"|"disabling"|"enabling"
//   => disable les boutons

// Exemples
// => addon-admin
// => env-var-form
// => cc-example-component.stories.js

export const defaultStory = makeStory(conf, {
  items: [{
    links: [grafanaLink],
  }],
});

export const error = makeStory(conf, {
  items: [{ links: [grafanaLink], error: true }],
});

export const disabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    enabled: false,
  }],
});

export const enabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    enabled: true,
  }],
});

export const waiting = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    enabled: true,
    waiting: true,
  }],
});

export const simulations = makeStory(conf, {
  items: [
    { links: [{ type: 'grafana' }], enabled: true },
    { },
  ],
  simulations: [
    storyWait(2000, ([component, componentError]) => {
      component.links = [grafanaLink];
      componentError.error = true;
    }),
  ],
});

export const simulationsWithWaiting = makeStory(conf, {
  items: [
    { links: [grafanaLink], enabled: true },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = true;
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.enabled = false;
    }),
  ],
});

enhanceStoriesNames({
  defaultStory,
  disabled,
  enabled,
  simulations,
});
