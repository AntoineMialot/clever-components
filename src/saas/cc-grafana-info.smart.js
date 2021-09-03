
import './cc-grafana-info.js';
import '../smart/cc-smart-container.js';
import { defineComponent } from '../lib/smart-manager.js';
import { LastPromise, unsubscribeWithSignal } from '../lib/observables.js';
import { getGrafanaOrganisation } from '../lib/api-helpers.js';
import { sendToApi } from '../lib/send-to-api.js';

defineComponent({
  selector: 'cc-grafana-info',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    grafanaBaseLink: { type: String }
  },

  onConnect(container, component, context$, disconnectSignal) {
    console.log({ container, component, context$, disconnectSignal })

    // LastPromise avoid some race condition that can happens on UI
    const grafanaId_lp = new LastPromise();

    // unsubscribeWithSignal will handle all signals unsubscribe call behind the scene (when component is out of the DOM)
    unsubscribeWithSignal(disconnectSignal, [

      // Always print some error's log to ease the debug
      grafanaId_lp.error$.subscribe(console.error),

      // Listen and apply a component action on errors
      grafanaId_lp.error$.subscribe(() => (component.error = "loading")),

      // Final subscription when the async call return a valid value
      grafanaId_lp.value$.subscribe((product) => {
        console.log("product")
        console.log(product)
        component.status = product.status
        component.link = product.link
      }),

      // When we receive an update, on one of the component input or context we are looking at, apply this action
      context$.subscribe(({ apiConfig, ownerId, grafanaBaseLink }) => {

        // Reset compontent to it's initial state on any change
        component.status = null;
        component.error = false;
        component.waiting = false;
        component.link = null;

        if (apiConfig != null && ownerId != null && grafanaBaseLink != null) {
          // On change, apply the CC API call
          grafanaId_lp.push((signal) => fetchGrafanaOrga({ apiConfig, signal, ownerId, grafanaBaseLink }));
        }
      }),

    ]);

  }
})

function fetchGrafanaOrga({ apiConfig, signal, ownerId, grafanaBaseLink }) {
  return getGrafanaOrganisation({ id: ownerId }).then(sendToApi({ apiConfig, signal }))
    .then(
      // Case when a valid object is return by the API
      (exposedVarsObject) => {
        console.log(exposedVarsObject)
        return Object.create({ status: "enabled", link: grafanaBaseLink + "/home?orgId=" + exposedVarsObject.id });
      },
      // Case when a valid error is returned by the API (not found)
      (error) => {
        console.log("error in then")
        if (error.toString().startsWith("Error: Grafana organization not found")) {
          return Object.create({ status: "disabled", link: null });
        } else {
          return error
        }
      },
    );
}