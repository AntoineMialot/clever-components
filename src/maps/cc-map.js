import '../atoms/cc-loader.js';
import '../molecules/cc-error.js';
import { css, html, LitElement } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { WORLD_GEOJSON } from '../assets/world-110m.geo.js';
import { dispatchCustomEvent } from '../lib/events.js';
import { i18n } from '../lib/i18n.js';
import * as leaflet from '../lib/leaflet-esm.js';
import { withResizeObserver } from '../mixins/with-resize-observer.js';
import { leafletStyles } from '../styles/leaflet.js';

/**
 * World map with two modes: positioned markers or heatmap.
 *
 * ## Details
 *
 * * The component has a default height of 15rem and a default width 20rem but this can be overridden with CSS.
 * * When using `points`, you need to specify which HTML tag should be used to create and display the marker.
 * * The marker DOM element should expose `size`, `anchor` and `tooltip` to help this component place the marker and tooltip correctly on the map.
 * * When using `points`, you can specify some text for the tooltip but you can also specify which HTML tag to use to create and display the tooltip.
 *
 * ## Type definitions
 *
 * ```js
 * interface Point {
 *   lat: number,              // Latitude
 *   lon: number,              // Longitude
 *   marker: Marker,           // An object describing how to create a marker with a custom element.
 *   tooltip: string|Tooltip,  // Simple string or an object describing how to create a tooltip with a custom element.
 *   zIndexOffset: number,     // The offset to add to the automatic offset already defined for a given point.
 * }
 * ```
 *
 * ```js
 * interface Marker {
 *   tag: string,              // The HTML tag name used for the marker
 *   // Additional specific properties for the marker custom element.
 * }
 * ```
 *
 * ```js
 * interface Tooltip {
 *   tag: string,              // The HTML tag name used for the tooltip
 *   // Additional specific properties for the tooltip custom element.
 * }
 * ```
 *
 * ```js
 * interface HeatmapPoint {
 *   lat: number,   // Latitude
 *   lon: number,   // Longitude
 *   count: number, // Number of occurences for this location
 * }
 * ```
 *
 * @cssdisplay flex
 *
 * @prop {Number} centerLat - Sets the latitude center of the map.
 * @prop {Number} centerLon - Sets the longitude center of the map.
 * @prop {Boolean} error - Displays an error message (can be combined with `loading`).
 * @prop {HeatmapPoint[]} heatmapPoints - Sets the list of points used to draw the heatmap.
 * @prop {Boolean} loading - Displays a loader on top of the map (can be combined with `error`).
 * @prop {"points"|"heatmap"} mode - Sets map mode: `"points"` for points with custom markers and `"heatmap"` for a heatmap.
 * @prop {Point[]} points - Sets the list of points used to place markers.
 * @prop {Number} viewZoom - Sets the zoom of the map (between 1 and 6).
 *
 * @event {CustomEvent<Point>} cc-map:marker-click - Fires the corresponding point whenever a marker is clicked.
 * @event {CustomEvent<Point>} cc-map:marker-enter - Fires the corresponding point whenever a marker is entered by the mouse.
 * @event {CustomEvent<Point>} cc-map:marker-leave - Fires the corresponding point whenever a marker is left by the mouse.
 *
 * @slot - The legend and/or details for the map (displayed at the bottom).
 */
export class CcMap extends withResizeObserver(LitElement) {

  static get properties () {
    return {
      centerLat: { type: Number, attribute: 'center-lat' },
      centerLon: { type: Number, attribute: 'center-lon' },
      error: { type: Boolean, reflect: true },
      heatmapPoints: { type: Array, attribute: 'heatmap-points' },
      loading: { type: Boolean, reflect: true },
      mode: { type: String },
      points: { type: Array },
      viewZoom: { type: Number, attribute: 'view-zoom', reflect: true },
    };
  }

  constructor () {
    super();
    // Centered on Paris by default
    this.centerLat = 48.9;
    this.centerLon = 2.4;
    this.error = false;
    this.loading = false;
    this.mode = 'points';
    this.viewZoom = 2;
    this._pointsCache = {};
  }

  _resetCurrentLayer () {
    const [layerToAdd, layerToRemove] = (this.mode === 'heatmap')
      ? [this._heatLayer, this._pointsLayer]
      : [this._pointsLayer, this._heatLayer];
    this._map.removeLayer(layerToRemove);
    this._map.addLayer(layerToAdd);
  }

  _updateHeatmap (newPoints) {

    if (!Array.isArray(newPoints)) {
      return;
    }

    const counts = newPoints.map(({ count }) => count);
    const maxCount = (newPoints.length > 0)
      ? Math.max(...counts)
      : 1;

    const heatPoints = newPoints
      .map(({ lat, lon, count }) => [lat, lon, count]);

    const heatOptions = {
      blur: 7,
      max: maxCount,
      minOpacity: 0.3,
      radius: 8,
    };

    this._heatLayer
      .clearLayers()
      .addLayer(new leaflet.HeatLayer(heatPoints, heatOptions));
  }

  _updatePoints (newPoints) {

    if (!Array.isArray(newPoints)) {
      return;
    }

    const obsoleteIds = new Set(Object.keys(this._pointsCache));

    // Create new markers or update them if there's already one with the same tag at the same coordinates
    for (const point of newPoints) {
      const id = [point.lat, point.lon, point.marker.tag].join(',');
      const old = this._pointsCache[id];
      if (old == null) {
        this._createMarker(id, point);
      }
      this._updateMarker(id, point);
      // Don't delete this marker
      obsoleteIds.delete(id);
    }

    // Delete markers
    for (const id of obsoleteIds.values()) {
      this._deleteMarker(id);
    }
  }

  _createMarker (id, point) {

    // Prepare icon with custom element
    const iconElement = document.createElement(point.marker.tag);
    const icon = leaflet.divIcon({
      html: iconElement,
      iconSize: iconElement.size,
      iconAnchor: iconElement.anchor,
      tooltipAnchor: iconElement.tooltip,
      className: 'cc-map-marker',
    });

    // Create marker and add it to the map
    const marker = leaflet
      // We don't use for riseOnHover: true, it's up to the user to do it with zIndexOffset
      .marker([point.lat, point.lon], { icon, zIndexOffset: point.zIndexOffset })
      .addTo(this._pointsLayer);

    marker
      .on('click', () => dispatchCustomEvent(this, 'marker-click', point))
      .on('mouseover', () => dispatchCustomEvent(this, 'marker-enter', point))
      .on('mouseout', () => dispatchCustomEvent(this, 'marker-leave', point));

    this._pointsCache[id] = { point, marker, iconElement };
  }

  _updateMarker (id, newPoint) {

    this._pointsCache[id].point = newPoint;
    const { point, marker, iconElement } = this._pointsCache[id];

    // Update marker icon custom element properties
    for (const k in point.marker) {
      if (k !== 'tag') {
        iconElement[k] = point.marker[k];
      }
    }

    // Update zIndexOffset
    marker.setZIndexOffset(point.zIndexOffset);

    // Create, update or delete tooltip
    if (point.tooltip == null) {
      marker.unbindTooltip();
    }
    else {
      if (marker.getTooltip() == null) {
        // Create empty tooltip
        marker.bindTooltip('', { direction: 'top', opacity: 1 });
      }
      if (point.tooltip.tag == null) {
        // Simple tooltip with text
        marker.setTooltipContent(point.tooltip);
      }
      else {
        // Complex tooltip with custom element
        const oldElement = marker.getTooltip().getContent();
        const oldTagName = oldElement?.tagName?.toLowerCase();
        const tooltipElement = (oldTagName !== point.tooltip.tag)
          ? document.createElement(point.tooltip.tag)
          : oldElement;

        // Update tooltip custom element properties
        for (const k in point.tooltip) {
          if (k !== 'tag') {
            tooltipElement[k] = point.tooltip[k];
          }
        }

        // WARNING: This is a trick!
        // Fact A: In order to place a tooltip on the map, Leaflet tries to compute the size of the custom element.
        // Fact B: In order to update the DOM in the most performant way, LitElement does async rendering.
        // Consequence: When Leaflet tries to compute the size of a tooltip using a custom element written with LitElement,
        // it's too soon, the shadow DOM is empty and the computed size is [0, 0].
        // With this dirty trick, we force LitElement to trigger a render on the custom element before we call Leaflet to use it.
        this.appendChild(tooltipElement);
        this.removeChild(tooltipElement);

        marker.setTooltipContent(tooltipElement);
      }
    }
  }

  _deleteMarker (id) {
    const { marker } = this._pointsCache[id];
    this._pointsLayer.removeLayer(marker);
    delete this._pointsCache[id];
  }

  /**
   * Pan the map to a given point but only if it's necessary and with some small padding (50px).
   * @prop {Number} lat - Sets the latitude of the point.
   * @prop {Number} lon - Sets the longitude of the point.
   */
  panInside (lat, lon) {
    this._map.panInside([lat, lon], { padding: [50, 50] });
  }

  /**
   * @private
   */
  onResize () {
    this._map.invalidateSize();
  }

  // Draw the Leaflet map
  firstUpdated () {

    const leafletOptions = {
      // Block view on the world
      attributionControl: false,
      doubleClickZoom: true,
      dragging: true,
      keyboard: true,
      maxBounds: [[-84, -180], [90, 180]],
      maxBoundsViscosity: 1,
      maxZoom: 6,
      minZoom: 1,
      zoomControl: true,
    };

    // Init map
    this._map = leaflet
      .map(this.renderRoot.getElementById('cc-map-container'), leafletOptions)
      .setView([this.centerLat, this.centerLon], this.viewZoom);

    this._map.on('zoomanim', (e) => {
      this.viewZoom = e.zoom;
    });

    // Place zoom controls
    this._map.zoomControl.setPosition('bottomright');

    // Init world map from geojson data
    leaflet
      .geoJSON(WORLD_GEOJSON, {
        style: { className: 'map-country' },
        pane: 'tilePane',
      })
      .addTo(this._map);

    // Init layers
    this._pointsLayer = leaflet.layerGroup();
    this._heatLayer = leaflet.layerGroup();
    this._resetCurrentLayer();
  }

  // updated and not udpate because we need this._map before
  updated (changedProperties) {

    if (changedProperties.has('centerLat') || changedProperties.has('centerLon')) {
      this._map.setView([this.centerLat, this.centerLon]);
    }

    if (changedProperties.has('viewZoom')) {
      this._map.setZoom(this.viewZoom);
    }

    if (changedProperties.has('mode')) {
      this._resetCurrentLayer();
    }

    if (changedProperties.has('heatmapPoints')) {
      this._updateHeatmap(this.heatmapPoints);
    }

    if (changedProperties.has('points')) {
      this._updatePoints(this.points);
    }

    super.updated(changedProperties);
  }

  render () {

    const noHeatmapPoints = (!this.error && this.mode === 'heatmap' && this.heatmapPoints?.length === 0);
    const errorMode = this.loading ? 'loading' : 'info';

    return html`
      <div id="cc-map-container" class=${classMap({ 'no-data': noHeatmapPoints })}></div>
      <div class="legend ${classMap({ 'no-data': noHeatmapPoints })}"><slot></slot></div>
      ${this.loading && !this.error ? html`
        <cc-loader class="loader"></cc-loader>
      ` : ''}
      ${this.error || noHeatmapPoints ? html`
        <div class="msg-container">
          ${this.error ? html`
            <cc-error mode=${errorMode}>${i18n('cc-map.error')}</cc-error>
          ` : ''}
          ${noHeatmapPoints ? html`
            <div class="msg">${i18n('cc-map.no-points')}</div>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  static get styles () {
    return [
      leafletStyles,
      // language=CSS
      css`
        :host {
          display: flex;
          flex-direction: column;
          height: 15rem;
          position: relative;
          width: 20rem;
        }

        #cc-map-container {
          flex: 1 1 0;
          width: 100%;
        }

        :host([loading]) .leaflet-control-container,
        :host([error]) .leaflet-control-container {
          display: none;
        }

        :host([loading]) #cc-map-container,
        :host([error]) #cc-map-container,
        #cc-map-container.no-data,
        :host([loading]) .legend,
        :host([error]) .legend,
        .legend.no-data {
          filter: blur(.1rem);
        }

        .leaflet-container {
          background-color: #aadaff;
          z-index: 1;
        }

        .map-country {
          fill: #f5f5f5;
          fill-opacity: 1;
          stroke: #ddd;
          stroke-width: 1;
        }

        :host(:not(:empty)) .legend {
          background-color: #f1f5ff;
          box-shadow: inset 0 6px 6px -6px #a4b1c9;
          box-sizing: border-box;
          color: #2e2e2e;
          font-size: 0.9rem;
          font-style: italic;
          padding: 0.4rem 1rem;
        }

        .loader {
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
          /* Over Leaflet */
          z-index: 2000;
        }

        .msg-container {
          align-items: center;
          display: flex;
          height: 100%;
          justify-content: center;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
          /* Over Leaflet */
          z-index: 2000;
        }

        cc-error,
        .msg {
          max-width: 80%;
        }

        .msg {
          align-items: center;
          background-color: white;
          border: 1px solid #bcc2d1;
          border-radius: 0.25rem;
          box-shadow: 0 0 1rem #aaa;
          display: flex;
          justify-content: center;
          padding: 1rem;
        }

        .cc-map-marker {
          align-items: center;
          display: flex;
          justify-content: center;
        }
      `,
    ];
  }
}

window.customElements.define('cc-map', CcMap);
