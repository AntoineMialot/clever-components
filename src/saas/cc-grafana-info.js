import '../atoms/cc-img.js';
import '../atoms/cc-flex-gap.js';
import '../molecules/cc-error.js';
import '../molecules/cc-block.js';
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
 * @prop {Boolean} dashboardError - Display an error message due when cann't load dashboards screens.
 * @prop {Boolean} error - Display an error message.
 * @prop {Link[]} links - Sets the different links.
 * @prop {Boolean} enabled - When Grafana is enabled.
 *
 * @event {CustomEvent} cc-grafana-info:enable-grafana - Fires when the enable button is clicked.
 * @event {CustomEvent} cc-grafana-info:refresh-grafana - Fires when the refresh button is clicked.
 * @event {CustomEvent} cc-grafana-info:disable-grafana - Fires when the disable button is clicked.
 */
export class CcGrafanaInfo extends LitElement {

  static get properties () {
    // TODO sort alpha the property names (same for JSDoc)
    return {
      // TODO: you don't need attribute when it's the same name
      error: { type: Boolean, attribute: 'error' },
      // TODO: you need attribute with kebab case when it's more than one word
      // TODO: => dashboard-error
      dashboardError: { type: Boolean, attribute: 'dashboard-error' },
      enabled: { type: Boolean, attribute: 'enabled' },
      links: { type: Array, attribute: 'links' },
    };
  }

  constructor () {
    super();
    this.error = false;
    this.dashboardError = false;
    this.enabled = false;
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
    // TODO: you can use the ?? operator instead of || now
    const links = this.links ?? [];
    const grafanaLink = links.find(({ type }) => type === 'grafana');
    const isFormDisabled = (this.error !== false) ?? this.saving;
    const dashboards = [
      { title: 'cc-grafana-info.organization-title', url: GRAFANA_ORG_SCREEN, description: 'cc-grafana-info.organization-description' },
      { title: 'cc-grafana-info.runtime-title', url: GRAFANA_APPLICATION_SCREEN, description: 'cc-grafana-info.runtime-description' },
      { title: 'cc-grafana-info.addon-title', url: GRAFANA_ADDON_SCREEN, description: 'cc-grafana-info.addon-description' },
    ];

    return html`

      <cc-block>

        <div slot="title" style="font-weight: bold;">${i18n('cc-grafana-info.main-title')}</div>
        
        ${!this.error ? html`  
          <cc-block-section>
            <div slot="title">${i18n('cc-grafana-info.documentation-title')}</div>
            <div slot="info">${i18n('cc-grafana-info.documentation-description')}</div>
            <div>
              ${ccLink(GRAFANA_DOCUMENTATION, html`
                <cc-img src="${infoSvg}"></cc-img><span>${i18n('cc-grafana-info.link.doc')}</span>
              `)}
            </div>
          </cc-block-section>
          
          ${!this.enabled ? html`
          <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.enable-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.enable-description')}</div>
              <div>
                <cc-button primary ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onEnableSubmit}>${i18n('cc-grafana-info.enable')}</cc-button>
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
                    <cc-img src="${GRAFANA_LOGO_URL}"></cc-img><span class="${classMap({ skeleton: (grafanaLink.href == null) })}">${i18n('cc-grafana-info.link.grafana')}</span>
                  `)}
                ` : ''}
              </div>
            </cc-block-section>
  
            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.refresh-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.refresh-description')}</div>
              <div>
                <cc-button primary ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onRefreshSubmit}>${i18n('cc-grafana-info.refresh')}</cc-button>
              </div>
            </cc-block-section>
  
            <cc-block-section>
              <div slot="title">${i18n('cc-grafana-info.disable-title')}</div>
              <div slot="info">${i18n('cc-grafana-info.disable-description')}</div>
              <div>
                <cc-button primary ?skeleton=${this._skeleton} ?disabled=${isFormDisabled} @cc-button:click=${this._onDisableSubmit}>${i18n('cc-grafana-info.disable')}</cc-button>
              </div>
            </cc-block-section>
          ` : ''}
        ` : ''}

        ${!this.dashboardError ? html`
          
            ${dashboards.map((item) => html`
            <cc-block-section>

              <div>
                ${ccLink(item.url, html`
                    <cc-img .src="${item.url}" style="height: 20rem; width: 40rem;"></cc-img>
                  `)}
              </div>
              <div  slot="title">
                <span>${i18n(item.title)}</span>
              </div>
              <div  slot="info">
                <span>${i18n(item.description)}</span>
              </div>

            </cc-block-section>
            `)}
        ` : ''}
  
        ${this.error ? html`
          <cc-error>${i18n('cc-grafana-info.error')}</cc-error>
        ` : ''}
  
        ${this.dashboardError ? html`
          <cc-error>${i18n('cc-grafana-info.error')}</cc-error>
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
          --cc-gap: 1rem;
          /*background-color: #fff;*/
          /*border: 1px solid #bcc2d1;*/
          /*border-radius: 0.25rem;*/
          /*display: grid;*/
          /*grid-gap: var(--cc-gap);*/
          /*overflow: hidden;*/
          /*padding: var(--cc-gap);*/
          /*padding-left: 4rem;*/
          /*position: relative;*/
        }

        .cc-link {
          align-items: center;
          display: flex;
        }

        cc-img {
          border-radius: 0.25rem;
          flex: 0 0 auto;
          height: 1.5rem;
          margin-right: 0.5rem;
          width: 1.5rem;
        }

        .info-ribbon {
          --height: 1.5rem;
          --width: 8rem;
          --r: -45deg;
          --translate: 1.6rem;
          background: #3A3871;
          color: white;
          font-size: 0.9rem;
          font-weight: bold;
          height: var(--height);
          left: calc(var(--width) / -2);
          line-height: var(--height);
          position: absolute;
          text-align: center;
          top: calc(var(--height) / -2);
          transform: rotate(var(--r)) translateY(var(--translate));
          width: var(--width);
          z-index: 2;
        }

        /* SKELETON */
        .skeleton {
          background-color: #bbb;
        }

        cc-error {
          text-align: center;
        }
      `,
    ];
  }
}

window.customElements.define('cc-grafana-info', CcGrafanaInfo);
