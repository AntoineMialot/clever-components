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

export const skeleton = makeStory(conf, {
  items: [{
    links: [grafanaLink],
  }],
});

export const errorWithLinkDoc = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      error: 'link-doc',
    },
  ],
});

export const errorWithLoading = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      error: 'loading',
    },
  ],
});

export const dataLoadedWithDisabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: 'disabled',
  }],
});

export const dataLoadedWithEnabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: 'enabled',
  }],
});

export const skeletonWithWaitingEnabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: 'enabled',
    waiting: 'disabling',
  }],
});

export const skeletonWithWaitingDisabled = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: 'disabled',
    waiting: 'enabling',
  }],
});

export const skeletonWithWaitingRefresh = makeStory(conf, {
  items: [{
    links: [grafanaLink],
    status: 'enabled',
    waiting: 'refreshing',
  }],
});

export const errorWithEnabling = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'disabled',
      error: 'enabling',
    },
  ],
});

export const errorWithDisabling = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
      error: 'disabling',
    },
  ],
});

export const errorWithRefreshing = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
      error: 'refreshing',
    },
  ],
});

export const errorWithLinkGrafanaEnabled = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
      error: 'link-grafana',
    },
  ],
});

export const simulationsWithLoadingEnable = makeStory(conf, {
  items: [
    {
      links: [{ type: 'grafana' }],
    }
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.links = [grafanaLink];
      component.status = 'enabled';
    }),
  ],
});

export const simulationsWithLoadingDisable = makeStory(conf, {
  items: [
    {
      links: [{ type: 'grafana' }],
    }
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.status = 'disabled';
    }),
  ],
});

export const simulationsWithLoadingError = makeStory(conf, {
  items: [
    {
      links: [{ type: 'grafana' }],
    }
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.error = 'loading';
    }),
  ],
});

export const simulationsWithWaitingToEnable = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'disabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = 'enabling';
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.status = 'enabled';
    }),
  ],
});

export const simulationsWithWaitingToDisable = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = 'disabling';
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.status = 'disabled';
    }),
  ],
});

export const simulationsWithWaitingToRefresh = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = 'refreshing';
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.status = 'enabled';
    }),
  ],
});

export const simulationsWithErrorToEnable = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'disabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = 'enabling';
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.error = 'enabling';
    }),
  ],
});

export const simulationsWithErrorEnablingLink = makeStory(conf, {
  items: [
    {
      links: [{ type: 'grafana' }],
      status: 'enabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.links = [grafanaLink];
      component.error = 'link-grafana';
      component.status = 'enabled';
    }),
  ],
});

export const simulationsWithErrorToDisable = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = 'disabling';
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.error = 'disabling';
    }),
  ],
});

export const simulationsWithErrorToRefresh = makeStory(conf, {
  items: [
    {
      links: [grafanaLink],
      status: 'enabled',
    },
  ],
  simulations: [
    storyWait(2000, ([component]) => {
      component.waiting = 'refreshing';
    }),
    storyWait(2000, ([component]) => {
      component.waiting = false;
      component.error = 'refreshing';
    }),
  ],
});

enhanceStoriesNames({
  skeleton,
  errorWithLinkDoc,
  errorWithLoading,
  dataLoadedWithDisabled,
  dataLoadedWithEnabled,
  skeletonWithWaitingEnabled,
  skeletonWithWaitingDisabled,
  skeletonWithWaitingRefresh,
  errorWithEnabling,
  errorWithDisabling,
  errorWithRefreshing,
  errorWithLinkGrafanaEnabled,
  simulationsWithLoadingEnable,
  simulationsWithLoadingDisable,
  simulationsWithLoadingError,
  simulationsWithWaitingToEnable,
  simulationsWithWaitingToDisable,
  simulationsWithWaitingToRefresh,
  simulationsWithErrorToEnable,
  simulationsWithErrorEnablingLink,
  simulationsWithErrorToDisable,
  simulationsWithErrorToRefresh,
});
