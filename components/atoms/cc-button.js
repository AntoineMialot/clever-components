import { classMap } from 'lit-html/directives/class-map.js';
import { css, html, LitElement } from 'lit-element';

/**
 * Simple button for Clever Cloud
 *
 * ## Details
 *
 * * attributes `primary`, `success` and `danger` define the mode of the button and are exclusive.
 * * You can only set one at a time.
 * * When you don't use any of these values, the mode of the button defaults to `simple`.
 *
 * @customElement cc-button
 *
 * @event click - Native click event from inner button element
 *
 * @attr {Boolean} disabled - same as native a button element
 * @attr {Boolean} primary - set button UI mode to primary
 * @attr {Boolean} success - set button UI mode to success
 * @attr {Boolean} danger - set button UI mode to danger
 * @attr {Boolean} outlined - set button UI as outlined with white background instead of filled
 */
export class CcButton extends LitElement {

  static get properties () {
    return {
      disabled: { type: Boolean },
      primary: { type: Boolean },
      success: { type: Boolean },
      danger: { type: Boolean },
      outlined: { type: Boolean },
    };
  }

  static get styles () {
    // language=CSS
    return css`
      :host {
        box-sizing: border-box;
        display: inline-block;
        margin: 0.2rem;
        vertical-align: top;
      }

      /* RESET */
      button {
        background: #fff;
        border: 1px solid #000;
        display: block;
        font-size: 14px;
        margin: 0;
        padding: 0;
      }

      /* BASE */
      button {
        border-radius: 0.15rem;
        cursor: pointer;
        font-weight: bold;
        min-height: 2rem;
        padding: 0 0.5rem;
        text-transform: uppercase;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        width: 100%;
      }

      /* COLORS */
      button.simple {
        --btn-color: hsl(210, 23%, 26%);
      }

      button.primary {
        --btn-color: hsl(213, 55%, 62%);
      }

      button.success {
        --btn-color: hsl(144, 56%, 43%);
      }

      button.danger {
        --btn-color: hsl(351, 70%, 47%);
      }

      /* MODES */
      button {
        background-color: var(--btn-color);
        border-color: var(--btn-color);
        color: #fff;
      }

      button.outlined {
        background-color: #fff;
        color: var(--btn-color);
      }

      /* special case: we want to keep simple buttons subtle */
      button.simple {
        border-color: #aaa;
      }

      /* STATES */
      button:enabled:focus {
        box-shadow: 0 0 0 .2em rgba(50, 115, 220, .25);
        outline: 0;
      }

      button:enabled:hover {
        box-shadow: 0 1px 3px #888;
      }

      button:enabled:active {
        box-shadow: none;
        outline: 0;
      }

      button:disabled {
        cursor: default;
        opacity: .5;
      }

      /* TRANSITIONS */
      button {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
        transition: all 75ms ease-in-out;
      }

      /* We can do this because we set a visible focus state */
      button::-moz-focus-inner {
        border: 0;
      }
    `;
  }

  render () {

    // those are exclusive, only one can be set at a time
    // we chose this over on mode attribute so it would be easier to write/use
    const modes = {
      danger: this.danger && !this.success && !this.primary,
      success: !this.danger && this.success && !this.primary,
      primary: !this.danger && !this.success && this.primary,
    };

    // simple mode is default when no value or when there are multiple conflicting values
    modes.simple = !modes.danger && !modes.success && !modes.primary;

    // outlined is not default except in simple mode
    modes.outlined = this.outlined || modes.simple;

    return html`<button
      type="button"
      class=${classMap(modes)}
      .disabled="${this.disabled}"
    >
      <slot></slot>
    </button>`;
  }
}

window.customElements.define('cc-button', CcButton);
