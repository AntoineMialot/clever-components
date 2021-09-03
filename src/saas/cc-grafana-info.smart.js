
import './cc-grafana-info.js';
import '../smart/cc-smart-container.js';
import { defineComponent } from '../lib/smart-manager.js';
import { fromCustomEvent, LastPromise, unsubscribeWithSignal, withLatestFrom, merge } from '../lib/observables.js';
import { getGrafanaOrganisation, resetGrafanaOrga, deleteGrafanaOrganisation, createGrafanaOrganisation } from '../lib/api-helpers.js';
import { sendToApi } from '../lib/send-to-api.js';
import { addErrorType } from '../lib/utils.js';

defineComponent({
  selector: 'cc-grafana-info',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    grafanaBaseLink: { type: String }
  },

  onConnect(container, component, context$, disconnectSignal) {
    // LastPromise avoid some race condition that can happens on UI
    const grafanaId_lp = new LastPromise();
    const reset_lp = new LastPromise();

    // What happend on reset call
    const onReset$ = fromCustomEvent(component, 'cc-grafana-info:reset')
      .pipe(withLatestFrom(context$));

    // What happend on disable call
    const onDisable$ = fromCustomEvent(component, 'cc-grafana-info:disable')
      .pipe(withLatestFrom(context$));

    // What happend on enable call
    const onEnable$ = fromCustomEvent(component, 'cc-grafana-info:enable')
      .pipe(withLatestFrom(context$));

    const error$ = merge(grafanaId_lp.error$, reset_lp.error$);

    // unsubscribeWithSignal will handle all signals unsubscribe call behind the scene (when component is out of the DOM)
    unsubscribeWithSignal(disconnectSignal, [
      // Always print some error's log to ease the debug
      error$.subscribe(console.error),

      // Listen and apply a component action on errors
      error$.subscribe((error) => {
        console.log(component)
        component.error = error.type;
        component.waiting = false;
      }),

      // Final subscription when grafana async call return a valid value
      grafanaId_lp.value$.subscribe((product) => {
        component.status = product.status
        if (component.status == "enabled" && product.link == null) {
          component.error = "link-grafana"
        } else {
          component.link = product.link
        }
        component.waiting = false
      }),

      // Final subscription when reset async call return a valid value
      reset_lp.value$.subscribe(() => {
        component.waiting = false
      }),

      // Action to apply when reset is clicked
      onReset$.subscribe(([variables, { apiConfig, ownerId }]) => {

        // Prepare resetting state
        component.error = false;
        component.waiting = "resetting";

        if (apiConfig != null && ownerId != null) {
          reset_lp.push(
            (signal) => fetchResetGrafanaOrga({ apiConfig, signal, ownerId }).catch(addErrorType('resetting'))
          );
        } else {
          component.error = "resetting";
        }
      }),

      // Action to apply when disable is clicked
      onDisable$.subscribe(([variables, { apiConfig, ownerId }]) => {

        // Prepare disabling state
        component.error = false;
        component.waiting = "disabling";

        if (apiConfig != null && ownerId != null) {
          // On change, apply the CC API call on the Grafana object
          grafanaId_lp.push(
            (signal) => fetchDisableGrafanaOrga({ apiConfig, signal, ownerId }).catch(addErrorType('disabling'))
          );
        } else {
          component.error = "disabling";
        }
      }),

      // Action to apply when enable is clicked
      onEnable$.subscribe(([variables, { apiConfig, ownerId, grafanaBaseLink }]) => {

        // Prepare enabling state
        component.error = false;
        component.waiting = "enabling";

        if (apiConfig != null && ownerId != null && grafanaBaseLink != null) {
          // On change, apply the CC API call on the Grafana object
          grafanaId_lp.push(
            (signal) => fetchEnableGrafanaOrga({ apiConfig, signal, ownerId, grafanaBaseLink }).catch(addErrorType('enabling'))
          );
        } else {
          component.error = "enabling";
        }
      }),

      // When we receive an update, on one of the component input or context we are looking at, apply this action
      context$.subscribe(({ apiConfig, ownerId, grafanaBaseLink }) => {

        // Reset component to it's initial state before any change
        component.status = null;
        component.error = false;
        component.waiting = false;
        component.link = null;

        if (apiConfig != null && ownerId != null && grafanaBaseLink != null) {
          // On change, apply the CC API call on the Grafana object
          grafanaId_lp.push(
            (signal) => fetchGrafanaOrga({ apiConfig, signal, ownerId, grafanaBaseLink }).catch(addErrorType('loading'))
          );
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
        return Object.create({ status: "enabled", link: grafanaBaseLink + "/home?orgId=" + exposedVarsObject.id });
      },
      // Case when a valid error is returned by the API (not found)
      (error) => {
        if (error.toString().startsWith("Error: Grafana organization not found")) {
          return disabledGrafana();
        } else {
          return error
        }
      },
    );
}

function fetchResetGrafanaOrga({ apiConfig, signal, ownerId }) {
  return resetGrafanaOrga({ id: ownerId }).then(sendToApi({ apiConfig, signal }))
}

function fetchDisableGrafanaOrga({ apiConfig, signal, ownerId }) {
  return deleteGrafanaOrganisation({ id: ownerId }).then(sendToApi({ apiConfig, signal }))
    .then(
      // Case when a valid object is return by the API
      () => {
        return disabledGrafana();
      }
    );
}

async function fetchEnableGrafanaOrga({ apiConfig, signal, ownerId, grafanaBaseLink }) {
  // Wait for organization to be created
  await createGrafanaOrganisation({ id: ownerId }).then(sendToApi({ apiConfig, signal }));
  // Finally get the Grafana Organisation
  return await fetchGrafanaOrga({ apiConfig, signal, ownerId, grafanaBaseLink });
}


function disabledGrafana() {
  return Object.create({ status: "disabled", link: null });
}