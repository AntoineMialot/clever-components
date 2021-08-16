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

// TODO: On a besoin de quelles stories:
// * je sais pas encore si l'orga a le grafana disabled ou enabled => loading  OK
//   * => un cc-loader + message entre doc et screenshots  OK
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
// * error: false|"refreshing"|"loading"|"disabling"|"enabling"|"link"
// * status: null|"enabled"|"disabled"
// * waiting: null|"refreshing"|"disabling"|"enabling"
//   => disable les boutons

// Exemples
// => addon-admin
// => env-var-form
// => cc-example-component.stories.js

export const skeleton = makeStory(conf, {
  items: [{
    links: [grafanaLink],
  }],
});

export const errorWithLinkDoc = makeStory(conf, {
  items: [
    { 
      links: [grafanaLink], 
      error: "link-doc" 
    }
  ],
});


export const errorWithLinkGrafana = makeStory(conf, {
  items: [
    { 
      links: [grafanaLink], 
      status: "enabled",
      error: "link-grafana" 
    }
  ],
});

export const dataLoadedWithDisabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: "disabled",
  }],
});

export const dataLoadedWithEnabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: "enabled",
  }],
});

export const skeletonWithWaitingEnabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: "enabled",
    waiting: true,
  }],
});

export const skeletonWithWaitingDisabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: "disabled",
    waiting: true,
  }],
});

export const simulations = makeStory(conf, {
  items: [
    { 
      links: [{ type: 'grafana' }], 
      status: "enabled",
    },
    { },
  ],
  simulations: [
    storyWait(2000, ([component, componentError]) => {
      component.links = [grafanaLink];
      componentError.error = "link";
    }),
  ],
});

export const simulationsWithWaitingToEnable = makeStory(conf, {
  items: [
    { 
      links: [grafanaLink], 
      status: "disabled",
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = true;
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.status = "enabled";
    }),
  ],
});

export const simulationsWithWaitingToDisable = makeStory(conf, {
  items: [
    { 
      links: [grafanaLink], 
      status: "enabled",
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = true;
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.status = "disabled";
    }),
  ],
});

enhanceStoriesNames({
  skeleton,
  errorWithLinkDoc,
  errorWithLinkGrafana,
  dataLoadedWithDisabled,
  dataLoadedWithEnabled,
  skeletonWithWaitingEnabled,
  skeletonWithWaitingDisabled,
  simulations,
  simulationsWithWaitingToEnable,
  simulationsWithWaitingToDisable,
});
