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
const GRAFANA_DOCUMENTATION = 'https://www.clever-cloud.com/doc/addons/elastic/';
const GRAFANA_ORG_SCREEN = new URL('../assets/organization.png', import.meta.url).href;
const GRAFANA_APPLICATION_SCREEN = new URL('../assets/application.png', import.meta.url).href;
const GRAFANA_ADDON_SCREEN = new URL('../assets/addon.png', import.meta.url).href;

/**
 * A component to display various links (Documentation, kibana, APM) for an grafana service.
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
 * TODO: don't document types that aren't exposed by the component
 *
 * ```js
 * interface Dashboards {
 *   description: string,
 *   title: string,
 *   url: string,
 * }
 * ```
 *
 * @cssdisplay grid
 *
 * @prop {Boolean} enabled - TODO When Grafana is enabled.
 * @prop {Boolean} error - Displays an error message.
 * @prop {Link[]} links - Sets the different links.
 * @prop {"refreshing"|"disabling"|"enabling"} waiting - TODO.
 *
 * TODO: remove -grafana suffix
 *
 * @event {CustomEvent} cc-grafana-info:enable-grafana - Fires when the enable button is clicked.
 * @event {CustomEvent} cc-grafana-info:disable-grafana - Fires when the disable button is clicked.
 * @event {CustomEvent} cc-grafana-info:refresh-grafana - Fires when the refresh button is clicked.
 */
export class CcGrafanaInfo extends LitElement {

  static get properties () {
    // TODO sort alpha the property names (same for JSDoc)
    return {
      // TODO: you don't need attribute when it's the same name
      error: { type: Boolean },
      // TODO: you need attribute with kebab case when it's more than one word
      // TODO: => dashboard-error
      enabled: { type: Boolean, attribute: 'enabled' },
      links: { type: Array, attribute: 'links' },
      refreshing: { type: Boolean },
      waiting: { type: Boolean },
    };
  }

  constructor () {
    super();
    this.enabled = false;
    this.error = false;
    this.waiting = false;
  }

  _onEnableSubmit () {
    dispatchCustomEvent(this, 'enable-grafana');
  }

  _onRefreshSubmit () {
    dispatchCustomEvent(this, 'refresh-grafana');
  }

  _onDisableSubmit () {
    dispatchCustomEvent(this, 'disable-grafana');
  }

  render () {

    const links = this.links ?? [];
    const grafanaLink = links.find(({ type }) => type === 'grafana');
    const isFormDisabled = (this.error !== false) ?? this.saving;
    const dashboards = [
      {
        title: i18n('cc-grafana-info.organization-title'),
        url: GRAFANA_ORG_SCREEN,
        description: i18n('cc-grafana-info.organization-description'),
      },
      {
        title: i18n('cc-grafana-info.runtime-title'),
        url: GRAFANA_APPLICATION_SCREEN,
        description: i18n('cc-grafana-info.runtime-description'),
      },
      {
        title: i18n('cc-grafana-info.addon-title'),
        url: GRAFANA_ADDON_SCREEN,
        description: i18n('cc-grafana-info.addon-description'),
      },
    ];

    return html`

      <cc-block>

        <div slot="title" style="font-weight: bold;">${i18n('cc-grafana-info.main-title')}</div>

        ${this.waiting ? html`
          <cc-loader slot="overlay"></cc-loader>
        ` : ''}

        <cc-block-section>
          <div slot="title">${i18n('cc-grafana-info.documentation-title')}</div>
          <div slot="info">${i18n('cc-grafana-info.documentation-description')}</div>
          <div>
            ${ccLink(GRAFANA_DOCUMENTATION, html`
              <cc-img src="${infoSvg}"></cc-img><span>${i18n('cc-grafana-info.link.doc')}</span>
            `)}
          </div>
        </cc-block-section>

        <div style="display: flex; border-top:1px solid #000;padding-top: 1em;">
          <cc-loader></cc-loader> <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque feugiat dui at leo porta dignissim.</span>
        </div>

        ${this.error ? html`
          <cc-error>${i18n('cc-grafana-info.error')}</cc-error>
        ` : ''}

        ${!this.error ? html`

          ${!this.enabled ? html`
            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.enable-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.enable-description')}</div>
              <div>
                <cc-button success ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onEnableSubmit}>${i18n('cc-grafana-info.enable')}</cc-button>
              </div>
            </cc-block-section>
          ` : ''}

          ${this.enabled ? html`
            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.grafana-link-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.grafana-link-description')}</div>
              <div>
                ${grafanaLink != null ? html`
                  ${ccLink(grafanaLink.href, html`
                    <cc-img src="${GRAFANA_LOGO_URL}"></cc-img>
                    <span class="${classMap({ skeleton: (grafanaLink.href == null) })}">${i18n('cc-grafana-info.link.grafana')}</span>
                  `)}
                ` : ''}
              </div>
            </cc-block-section>

            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.refresh-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.refresh-description')}</div>
              <div>
                <cc-button primary ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} ?waiting=${this.refreshing} @cc-button:click=${this._onRefreshSubmit}>${i18n('cc-grafana-info.refresh')}</cc-button>
              </div>
            </cc-block-section>

            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.disable-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.disable-description')}</div>
              <div>
                <cc-button danger delay="3" ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onDisableSubmit}>${i18n('cc-grafana-info.disable')}</cc-button>
              </div>
            </cc-block-section>
          ` : ''}
        ` : ''}

        ${!this.waiting ? html`
          ${dashboards.map((item) => html`
            <cc-block-section>
              <div slot="title">${item.title}</div>
              <div slot="info">${item.description}</div>
              <div>
                ${ccLink(item.url, html`
                  <img class="dashboard-screenshot" src="${item.url}" alt="TODO">
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
