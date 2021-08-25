import '../atoms/cc-loader.js';
import '../molecules/cc-block-section.js';
import '../molecules/cc-block.js';
import '../molecules/cc-error.js';
import { css, html, LitElement } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { dispatchCustomEvent } from '../lib/events.js';
import { i18n } from '../lib/i18n.js';
import { skeletonStyles } from '../styles/skeleton.js';
import { ccLink, linkStyles } from '../templates/cc-link.js';

const infoSvg = new URL('../assets/info.svg', import.meta.url).href;

const GRAFANA_LOGO_URL = 'https://static-assets.cellar.services.clever-cloud.com/logos/grafana.svg';
const GRAFANA_DOCUMENTATION = 'https://www.clever-cloud.com/doc/administrate/metrics/overview/';
const GRAFANA_ORG_SCREEN = new URL('../assets/organization.png', import.meta.url).href;
const GRAFANA_APPLICATION_SCREEN = new URL('../assets/application.png', import.meta.url).href;
const GRAFANA_ADDON_SCREEN = new URL('../assets/addon.png', import.meta.url).href;

/**
 * A component to display enable/disable a grafana service.
 *
 * ## Details
 *
 * * You need to list the links you want to display in `links`.
 * * You can omit the `href` property while you wait for the real link, a skeleton UI (loading hint) will be displayed.
 *
 * ## Type definitions
 *
 * ```js
 * interface Link {
 *   type: "grafana",
 *   href?: string,
 * }
 * ```
 *
 * @cssdisplay grid
 *
 * @prop {false|"reseting"|"loading"|"disabling"|"enabling"|link-doc|link-grafana} error - Displays an error message.
 * @prop {Link[]} links - Sets the different links.
 * @prop {null|"enabled"|"disabled"} status - Grafana acount status, is the Grafana enable or disable. Null means no data are received.
 * @prop {false|"reseting"|"disabling"|"enabling"} waiting - are we waiting an action result response (reset, disable or enable).
 *
 * @event {CustomEvent} cc-grafana-info:enable - Fires when the enable button is clicked.
 * @event {CustomEvent} cc-grafana-info:disable - Fires when the disable button is clicked.
 * @event {CustomEvent} cc-grafana-info:reset - Fires when the reset button is clicked.
 */
export class CcGrafanaInfo extends LitElement {

  static get properties () {
    return {
      error: { type: String },
      links: { type: Array },
      status: { type: String },
      waiting: { type: String },
    };
  }

  constructor () {
    super();
    this.error = false;
    this.status = null;
    this.waiting = false;
  }

  _onEnableSubmit () {
    dispatchCustomEvent(this, 'enable');
  }

  _onResetSubmit () {
    dispatchCustomEvent(this, 'reset');
  }

  _onDisableSubmit () {
    dispatchCustomEvent(this, 'disable');
  }

  render () {

    const links = this.links ?? [];
    const grafanaLink = links.find(({ type }) => type === 'grafana');
    const isFormDisabled = this.error !== false || this.waiting !== false;
    const dashboards = [
      {
        title: i18n('cc-grafana-info.organization-title'),
        url: GRAFANA_ORG_SCREEN,
        description: i18n('cc-grafana-info.organization-description'),
        alt: 'grafana main organization dashboard',
      },
      {
        title: i18n('cc-grafana-info.runtime-title'),
        url: GRAFANA_APPLICATION_SCREEN,
        description: i18n('cc-grafana-info.runtime-description'),
        alt: 'grafana application runtime dashboard',
      },
      {
        title: i18n('cc-grafana-info.addon-title'),
        url: GRAFANA_ADDON_SCREEN,
        description: i18n('cc-grafana-info.addon-description'),
        alt: 'grafana application addon dashboard',
      },
    ];

    return html`

      <cc-block>

        <div slot="title" style="font-weight: bold;">${i18n('cc-grafana-info.main-title')}</div>

        ${this.waiting === 'enabling' || this.waiting === 'disabling' ? html`
          <cc-loader slot="overlay"></cc-loader>
        ` : ''}

        <cc-block-section>
          <div slot="title">${i18n('cc-grafana-info.documentation-title')}</div>
          <div slot="info">${i18n('cc-grafana-info.documentation-description')}</div>
          ${this.error === 'link-doc' ? html`
            <cc-error>${i18n('cc-grafana-info.error-link-doc')}</cc-error>
          ` : html`
          <div>
            ${ccLink(GRAFANA_DOCUMENTATION, html`
              <cc-img src="${infoSvg}"></cc-img><span>${i18n('cc-grafana-info.link.doc')}</span>
            `)}
          </div>
          `}
        </cc-block-section>

        ${this.error === 'loading' ? html`
          <cc-block-section>
            <div slot="title">${i18n('cc-grafana-info.loading-title')}</div>
            <cc-error>${i18n('cc-grafana-info.error-loading')}</cc-error>
          </cc-block-section>
        ` : html`
          ${!this.status ? html`
            <cc-block-section>
            <div slot="title">${i18n('cc-grafana-info.loading-title')}</div>
            <div>
              <cc-loader></cc-loader> <span>${i18n('cc-grafana-info.loading-data')}</span>
            </div>
            </cc-block-section>
          ` : ''}

          ${this.status === 'disabled' ? html`
            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.enable-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.enable-description')}</div>
              ${this.error === 'enabling' ? html`
                <cc-error>${i18n('cc-grafana-info.error-enabling')}</cc-error>
              ` : html`
              <div>
                <cc-button success ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onEnableSubmit}>${i18n('cc-grafana-info.enable')}</cc-button>
              </div>
              `}
            </cc-block-section>
          ` : ''}

          ${this.status === 'enabled' ? html`
            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.grafana-link-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.grafana-link-description')}</div>
              ${this.error === 'link-grafana' || grafanaLink == null ? html`
                <cc-error>${i18n('cc-grafana-info.error-link-grafana')}</cc-error>
              ` : html`
              <div>
                ${grafanaLink != null ? html`
                  ${ccLink(grafanaLink.href, html`
                    <cc-img src="${GRAFANA_LOGO_URL}"></cc-img>
                    <span class="${classMap({ skeleton: (grafanaLink.href == null) })}">${i18n('cc-grafana-info.link.grafana')}</span>
                  `)}
                ` : ''}
              </div>
              `}
            </cc-block-section>

            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.reset-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.reset-description')}</div>
              ${this.error === 'reseting' ? html`
                <cc-error>${i18n('cc-grafana-info.error-reseting')}</cc-error>
              ` : html`
                <div>
                  <cc-button primary ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} ?waiting=${this.waiting === 'reseting'} @cc-button:click=${this._onResetSubmit}>${i18n('cc-grafana-info.reset')}</cc-button>
                </div>
              `}
            </cc-block-section>

            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.disable-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.disable-description')}</div>
              ${this.error === 'disabling' ? html`
                <cc-error>${i18n('cc-grafana-info.error-disabling')}</cc-error>
              ` : html`
                <div>
                  <cc-button danger delay="3" ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onDisableSubmit}>${i18n('cc-grafana-info.disable')}</cc-button>
                </div>
              `}
            </cc-block-section>
          ` : ''}
        `}

        ${!this.waiting || this.waiting === 'reseting' ? html`
          ${dashboards.map((item) => html`
            <cc-block-section>
              <div slot="title">${item.title}</div>
              <div slot="info">${item.description}</div>
              <div>
                ${ccLink(item.url, html`
                  <img class="dashboard-screenshot" src="${item.url}" alt="${item.alt}">
                `)}
              </div>
            </cc-block-section>
          `)}
        ` : ''}

      </cc-block>
    `;
  }

  static get styles () {
    return [
      skeletonStyles,
      linkStyles,
      // language=CSS
      css`
        :host {
          --cc-gap: 1em;
        }

        cc-img {
          border-radius: 0.25em;
          flex: 0 0 auto;
          height: 1.5em;
          margin-right: 0.5em;
          width: 1.5em;
        }

        .cc-link {
          align-items: center;
          display: inline-flex;
        }

        .dashboard-screenshot {
          border-radius: 0.25em;
          max-width: 50em;
          width: 100%;
        }

        cc-error {
          text-align: center;
        }
      `,
    ];
  }
}

window.customElements.define('cc-grafana-info', CcGrafanaInfo);
