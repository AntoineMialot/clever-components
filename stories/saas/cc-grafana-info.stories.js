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
const grafanaOrg = new URL('../assets/organization.png', import.meta.url);
const grafanaApplication = new URL('../assets/application.png', import.meta.url);
const grafanaAddon = new URL('../assets/addon.png', import.meta.url);

export const defaultStory = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    dashboards: [{ title: 'Organization', url: grafanaOrg }, { title: 'Application runtime', url: grafanaApplication }, { title: 'Application addon', url: grafanaAddon }],
  }],
});

export const disabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    dashboards: [{ title: 'Organization', url: grafanaOrg }, { title: 'Application runtime', url: grafanaApplication }, { title: 'Application addon', url: grafanaAddon }],
    enabled: false,
  }],
});

export const enabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    dashboards: [{ title: 'Organization', url: grafanaOrg }, { title: 'Application runtime', url: grafanaApplication }, { title: 'Application addon', url: grafanaAddon }],
    enabled: true,
  }],
});

export const simulations = makeStory(conf, {
  items: [
    { links: [{ type: 'grafana' }], images: [grafanaOrg, grafanaApplication, grafanaAddon], enabled: true },
    { dashboards: [{ title: 'Organization', url: grafanaOrg }, { title: 'Application runtime', url: grafanaApplication }, { title: 'Application addon', url: grafanaAddon }] },
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
