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

export const defaultStory = makeStory(conf, {
  items: [{
    links: [grafanaLink],
  }],
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

enhanceStoriesNames({
  defaultStory,
  disabled,
  enabled,
  simulations,
});
