import { css, html, LitElement } from 'lit-element';
import { dispatchCustomEvent } from '../lib/events.js';
import { i18n } from '../lib/i18n.js';
import '@shoelace-style/shoelace';
import { getFlagUrl } from '../lib/remote-assets.js';
import { shoelaceStyles } from '../styles/shoelace.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';

const CURRENCY_EUR = { code: 'EUR', changeRate: 1 };

/**
 * A component doing X and Y (one liner description of your component).
 *
 * * 🎨 default CSS display: `block`
 * <br>
 * 🧐 [component's source code on GitHub](https://github.com/CleverCloud/clever-components/blob/master/src/pricing/cc-pricing-header.js)
 *
 * ## Type definitions
 *
 * ```js
 * interface Zone {
 *   name: string,          // Unique code/identifier for the zone
 *   lat: number,           // Latitude
 *   lon: number,           // Longitude
 *   countryCode: string,   // ISO 3166-1 alpha-2 code of the country (2 letters): "FR", "CA", "US"...
 *   city: string,          // Name of the city in english: "Paris", "Montreal", "New York City"...
 *   country: string,       // Name of the country in english: "France", "Canada", "United States"...
 *   displayName?: string,  // Optional display name for private zones (instead of displaying city + country): "ACME (dedicated)"...
 *   tags: string[],        // Array of strings for semantic tags: ["region:eu", "infra:clever-cloud"], ["scope:private"]...
 * }
 * ```
 *
 * @prop {Zone} selectedZone - the hosting zone selected for the items
 * @prop {Array<Zone>} zones - Sets  all the zone for the select
 * @prop {Array<Item>} items  - Sets all the products selected to calculate the price
 * @prop {String} pricingCurrency - Sets the current pricing currency
 *
 * @event {CustomEvent<ExampleInterface>} cc-pricing-header:change-currency - Fires XXX whenever YYY.
 * @event {CustomEvent<ExampleInterface>} cc-pricing-header:change-zone - Fires XXX whenever YYY.
 *
 *
 */
export class CcPricingHeader extends LitElement {

  static get properties () {
    return {
      currency: { type: Object },
      currencies: { type: Array },
      totalPrice: { type: Number, attribute: 'total-price' },
      zoneId: { type: String, attribute: 'zone-id' },
      zones: { type: Array },
    };
  }

  constructor () {
    super();
    // TODO: skeleton
    this.currencies = [];
    // TODO skeleton
    this.zones = [];
    this.currency = {};
    this.zoneId = 'PAR';
    this.totalPrice = 0;
  }

  _getCurrencySymbol(currency) {
    return new Intl.NumberFormat('fr', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }).formatToParts(0).find((p) => p.type === 'currency').value;
  }

  _getformattedCurrencies (currencies) {
    return currencies.map((currency) => {
      const displayValue = `${this._getCurrencySymbol(currency.code)} ${currency.code}`;
      return {...currency, displayValue};
    });
  }

  _onCurrencyChange (e) {
    const currency = this.currencies.find((c) => c.code === e.target.value);
    dispatchCustomEvent(this, 'change-currency', currency);
  }

  _onZoneInput (e) {
    const zoneName = e.target.value;
    dispatchCustomEvent(this, 'change-zone', zoneName);
  }

  render () {
    return html`
      <div class="header">
        <div class="currency-text">
          ${i18n('cc-pricing-header.currency-text')}
        </div>
        <div class="currency-select">
          <sl-select @sl-change=${this._onCurrencyChange} value=${this.currency.code} class="select">
            ${this._getformattedCurrencies(this.currencies).map((c) => html`
              <sl-menu-item value=${c.code}>${c.displayValue}</sl-menu-item>`)}
          </sl-select>
        </div>
        <div class="zone-text">
          ${i18n('cc-pricing-header.selected-zone')}
        </div>
        <div class="zones">
          <sl-select @sl-change=${this._onZoneInput} value=${this.zoneId} class="select">
            ${this.zones.map((zone) => html`
              <sl-menu-item value=${zone.name}>
                <cc-img class="flag" src=${ifDefined(getFlagUrl(zone.countryCode))}
                  text=${ifDefined(zone.countryCode)}></cc-img>
                ${zone.name}
              </sl-menu-item>`)}
          </sl-select>
        </div>
        <div class="est-cost-text">
          ${i18n('cc-pricing-header.est-cost')}
        </div>
        <div class="total-price">
          ${i18n('cc-pricing-header.price', { price: this.totalPrice * this.currency.changeRate, code: this.currency.code })}
        </div>
      </div>
      </div>
    `;
  }

  static get styles () {
    return [
      shoelaceStyles,
      // language=CSS
      css`
        :host {
          display: block;
          margin-bottom: 1.5rem;
          padding: 1rem;
        }

        .flag {
          border-radius: 0.15rem;
          box-shadow: 0 0 3px #ccc;
          height: 1.5rem;
          margin-right: 1rem;
          width: 2rem;
        }

        .select {

        }

        .select-currency {
          align-items: center;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .currency-text {
          width: max-content;
        }

        .header {
          display: grid;
          grid-template: 
                    "currency-text zone-text estimation-text"
                    "currency-select zones estimation";
          gap: 0.5rem;
        }

        .est-cost-text {
          grid-area: estimation-text;
          justify-self: end;
        }

        .currency-text {
          grid-area: currency-text;
        }

        .currency-select {
          grid-area: currency-select;
        }


        .select-content {
          width: min-content;
        }

        .select-item {
          background-color: #ffffff;
        }

        .zones {
          grid-area: zones;
        }

        .zone-text {
          grid-area: zone-text;
        }

        .total-price {
          font-weight: bold;
          font-size: 1.5rem;
          grid-area: estimation;
          align-self: center;
          justify-self: end;
        }


      `,
    ];
  }
}

window.customElements.define('cc-pricing-header', CcPricingHeader);
