import { LitElement, html } from 'lit';

const ALT_SCHEMA = [
  { name: "temp", title: "Alternative temperature sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "feels_like", title: "Alternative feels like temperature sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "description", title: "Alternative weather description sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "press", title: "Alternative pressure sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "humid", title: "Alternative humidity sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "uv", title: "Alternative UV index sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "winddir", title: "Alternative wind bearing sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "windspeed", title: "Alternative wind speed sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "dew_point", title: "Alternative dew pointsensor", selector: { entity: { domain: 'sensor' } } },
  { name: "wind_gust_speed", title: "Alternative wind gust speed sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "visibility", title: "Alternative visibility sensor", selector: { entity: { domain: 'sensor' } } },
  { name: "cloud_coverage", title: "Alternative cloud coverage sensor (%)", selector: { entity: { domain: 'sensor' } } },
  { name: "custom_text_sensor", title: "Custom text sensor (displayed at top center)", selector: { entity: {} } },
];

class EinkWeatherCardEditor extends LitElement {
  static get properties() {
    return {
      _config: { type: Object },
      currentPage: { type: String },
      entities: { type: Array },
      hass: { type: Object },
      _entity: { type: String },
    };
  }

  constructor() {
    super();
    this.currentPage = 'card';
    this._entity = '';
    this.entities = [];
    this._formValueChanged = this._formValueChanged.bind(this);
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = { ...config, forecast: { ...(config.forecast || {}) } };
    this._entity = config.entity || '';
    this.hasApparentTemperature = (
      this.hass &&
      this.hass.states[config.entity] &&
      this.hass.states[config.entity].attributes &&
      this.hass.states[config.entity].attributes.apparent_temperature !== undefined
    ) || config.feels_like !== undefined;
    this.hasDewpoint = (
      this.hass &&
      this.hass.states[config.entity] &&
      this.hass.states[config.entity].attributes &&
      this.hass.states[config.entity].attributes.dew_point !== undefined
    ) || config.dew_point !== undefined;
    this.hasWindgustspeed = (
      this.hass &&
      this.hass.states[config.entity] &&
      this.hass.states[config.entity].attributes &&
      this.hass.states[config.entity].attributes.wind_gust_speed !== undefined
    ) || config.wind_gust_speed !== undefined;
    this.hasVisibility = (
      this.hass &&
      this.hass.states[config.entity] &&
      this.hass.states[config.entity].attributes &&
      this.hass.states[config.entity].attributes.visibility !== undefined
    ) || config.visibility !== undefined;
    this.hasDescription = (
      this.hass &&
      this.hass.states[config.entity] &&
      this.hass.states[config.entity].attributes &&
      this.hass.states[config.entity].attributes.description !== undefined
    ) || config.description !== undefined;
    this.fetchEntities();
    this.requestUpdate();
  }

  get config() {
    return this._config;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.fetchEntities();
    }
    if (changedProperties.has('_config') && this._config && this._config.entity) {
      this._entity = this._config.entity;
    }
  }

  fetchEntities() {
    if (this.hass) {
      this.entities = Object.keys(this.hass.states).filter((e) => e.startsWith('weather.'));
      this.requestUpdate();
    }
  }

  _EntityChanged(event, key) {
    if (!this._config) {
      return;
    }
    const newConfig = { ...this._config };
    newConfig.entity = event.target.value;
    this._entity = event.target.value;
    this.configChanged(newConfig);
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  _valueChanged(event, key) {
    if (!this._config) {
      return;
    }

    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    const isToggle = tagName === 'ha-switch' || tagName === 'ha-checkbox';
    const value = isToggle ? target.checked : target.value;

    let newConfig = { ...this._config };

    if (key.includes('.')) {
      const parts = key.split('.');
      let currentLevel = newConfig;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        currentLevel[part] = { ...currentLevel[part] };
        currentLevel = currentLevel[part];
      }

      currentLevel[parts[parts.length - 1]] = value;
    } else {
      newConfig[key] = value;
    }

    this.configChanged(newConfig);
    this.requestUpdate();
  }

  _handleStyleChange(event) {
    if (!this._config) {
      return;
    }
    const newConfig = JSON.parse(JSON.stringify(this._config));
    newConfig.forecast.style = event.target.value;
    this.configChanged(newConfig);
    this.requestUpdate();
  }

  _handleTypeChange(event) {
    if (!this._config) {
      return;
    }
    const newConfig = JSON.parse(JSON.stringify(this._config));
    newConfig.forecast.type = event.target.value;
    this.configChanged(newConfig);
    this.requestUpdate();
  }

  _handleIconStyleChange(event) {
    if (!this._config) {
      return;
    }
    const newConfig = JSON.parse(JSON.stringify(this._config));
    newConfig.icon_style = event.target.value;
    this.configChanged(newConfig);
    this.requestUpdate();
  }

  _handleIconSetChange(event) {
    if (!this._config) return;
    const newConfig = JSON.parse(JSON.stringify(this._config));
    const value = event.target.value;
    if (value === 'ha') {
      newConfig.animated_icons = false;
      newConfig.icon_style = 'style1';
    } else if (value === 'inkypi') {
      newConfig.animated_icons = true;
      newConfig.icon_style = 'inkypi';
    } else {
      newConfig.animated_icons = true;
      newConfig.icon_style = value;
    }
    this.configChanged(newConfig);
    this.requestUpdate();
  }

  _getIconSet() {
    if (this._config.icon_style === 'inkypi') return 'inkypi';
    if (this._config.animated_icons) return this._config.icon_style || 'style1';
    return 'ha';
  }

  _handlePrecipitationTypeChange(e) {
    if (!this._config) return;
    const newConfig = JSON.parse(JSON.stringify(this._config));
    newConfig.forecast.precipitation_type = e.target.value;
    this.configChanged(newConfig);
    this.requestUpdate();
  }

  _formValueChanged(event) {
    if (event.target.tagName.toLowerCase() === 'ha-form') {
      const newConfig = event.detail.value;
      this.configChanged(newConfig);
      this.requestUpdate();
    }
  }

  showPage(pageName) {
    this.currentPage = pageName;
    this.requestUpdate();
  }

  render() {
    if (this._config && this._config.entity !== this._entity) {
      this._entity = this._config.entity;
    }
    const forecastConfig = this._config.forecast || {};
    const unitsConfig = this._config.units || {};
    const iconSet = this._getIconSet();

    return html`
      <style>
        .switch-label {
          padding-left: 14px;
        }
        .switch-container {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .page-container {
          display: none;
        }
        .page-container.active {
          display: block;
        }
        .time-container {
          display: flex;
          flex-direction: row;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .switch-right {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .textfield-container {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
          gap: 20px;
        }
        .radio-container {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .radio-group {
          display: flex;
          align-items: center;
        }
        .radio-group label {
          margin-left: 4px;
        }
        div.buttons-container {
          display: flex;
          gap: 8px;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        div.buttons-container mwc-button {
          --mdc-theme-primary: var(--primary-text-color);
          --mdc-button-outline-color: var(--divider-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color, var(--ha-card-background, #fff));
        }
        div.buttons-container mwc-button.active {
          border-color: var(--primary-color);
          background: var(--primary-color);
          --mdc-theme-primary: #fff;
        }
        .flex-container {
          display: flex;
          flex-direction: row;
          gap: 20px;
          flex-wrap: wrap;
        }
        .flex-container ha-textfield {
          flex-basis: calc(50% - 10px);
          flex-grow: 1;
        }
        .sizes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 12px;
        }
        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }
        .select-wrapper label {
          font-size: 12px;
          color: var(--secondary-text-color, #757575);
        }
        select.native-select {
          padding: 8px 12px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          background: var(--card-background-color, var(--primary-background-color, #fff));
          color: var(--primary-text-color, #000);
          font-family: inherit;
          font-size: 14px;
          width: 100%;
          min-height: 40px;
          box-sizing: border-box;
          cursor: pointer;
        }
        select.native-select:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
        .section-header {
          font-weight: 600;
          font-size: 12px;
          color: var(--secondary-text-color, #757575);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin: 20px 0 10px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .section-header:first-child {
          margin-top: 4px;
        }
      </style>
      <div>

        <!-- Entity and title -->
        <div class="textfield-container">
          <div class="select-wrapper">
            <label>Entity</label>
            <select
              class="native-select"
              .value=${this._entity || ''}
              @change=${(e) => this._EntityChanged(e, 'entity')}
            >
              ${this.entities.map((entity) => html`<option value=${entity} ?selected=${entity === this._entity}>${entity}</option>`)}
            </select>
          </div>
          <ha-textfield
            label="Title"
            .value="${this._config.title || ''}"
            @change="${(e) => this._valueChanged(e, 'title')}"
          ></ha-textfield>
        </div>

        <!-- Tab buttons -->
        <div class="buttons-container">
          <mwc-button class="${this.currentPage === 'card' ? 'active' : ''}" @click="${() => this.showPage('card')}">Main</mwc-button>
          <mwc-button class="${this.currentPage === 'forecast' ? 'active' : ''}" @click="${() => this.showPage('forecast')}">Forecast</mwc-button>
          <mwc-button class="${this.currentPage === 'units' ? 'active' : ''}" @click="${() => this.showPage('units')}">Units</mwc-button>
          <mwc-button class="${this.currentPage === 'alternate' ? 'active' : ''}" @click="${() => this.showPage('alternate')}">Alternate entities</mwc-button>
        </div>

        <!-- ===== MAIN TAB ===== -->
        <div class="page-container ${this.currentPage === 'card' ? 'active' : ''}">

          <div class="section-header">Display Mode</div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'eink_mode')}"
              .checked="${this._config.eink_mode === true}"
            ></ha-switch>
            <label class="switch-label">E-Ink Display Mode (high contrast, bold text, no animations)</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'eink_color_mode')}"
              .checked="${this._config.eink_color_mode === true}"
            ></ha-switch>
            <label class="switch-label">E-Ink Color Mode (7-color e-ink palette, bold, no animations)</label>
          </div>

          <div class="section-header">Icons</div>
          <div class="select-wrapper" style="margin-bottom: 12px;">
            <label>Icon set</label>
            <select
              class="native-select"
              @change=${(e) => this._handleIconSetChange(e)}
            >
              <option value="ha" ?selected=${iconSet === 'ha'}>HA default icons</option>
              <option value="style1" ?selected=${iconSet === 'style1'}>Animated – Style 1</option>
              <option value="style2" ?selected=${iconSet === 'style2'}>Animated – Style 2</option>
              <option value="inkypi" ?selected=${iconSet === 'inkypi'}>InkyPi (static PNG, bundled locally)</option>
            </select>
          </div>
          ${iconSet !== 'ha' ? html`
            <div class="flex-container" style="margin-bottom: 12px;">
              <ha-textfield
                label="Icon size"
                type="number"
                .value="${this._config.icons_size || '25'}"
                @change="${(e) => this._valueChanged(e, 'icons_size')}"
              ></ha-textfield>
              ${iconSet !== 'inkypi' ? html`
                <ha-textfield
                  label="Custom icon path (overrides icon set)"
                  .value="${this._config.icons || ''}"
                  @change="${(e) => this._valueChanged(e, 'icons')}"
                ></ha-textfield>
              ` : ''}
            </div>
          ` : ''}

          <div class="section-header">What to Show</div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_main')}"
              .checked="${this._config.show_main !== false}"
            ></ha-switch>
            <label class="switch-label">Show main weather area</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_temperature')}"
              .checked="${this._config.show_temperature !== false}"
            ></ha-switch>
            <label class="switch-label">Show current temperature</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_current_condition')}"
              .checked="${this._config.show_current_condition !== false}"
            ></ha-switch>
            <label class="switch-label">Show current weather condition</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_attributes')}"
              .checked="${this._config.show_attributes !== false}"
            ></ha-switch>
            <label class="switch-label">Show attributes</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_attribute_labels')}"
              .checked="${this._config.show_attribute_labels === true}"
            ></ha-switch>
            <label class="switch-label">Show attribute labels (e.g. Humidity, Pressure, Wind)</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_humidity')}"
              .checked="${this._config.show_humidity !== false}"
            ></ha-switch>
            <label class="switch-label">Show humidity</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_pressure')}"
              .checked="${this._config.show_pressure !== false}"
            ></ha-switch>
            <label class="switch-label">Show pressure</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_wind_direction')}"
              .checked="${this._config.show_wind_direction !== false}"
            ></ha-switch>
            <label class="switch-label">Show wind direction</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_wind_speed')}"
              .checked="${this._config.show_wind_speed !== false}"
            ></ha-switch>
            <label class="switch-label">Show wind speed</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_sun')}"
              .checked="${this._config.show_sun !== false}"
            ></ha-switch>
            <label class="switch-label">Show sunrise / sunset</label>
          </div>
          ${this.hasApparentTemperature ? html`
            <div class="switch-container">
              <ha-switch
                @change="${(e) => this._valueChanged(e, 'show_feels_like')}"
                .checked="${this._config.show_feels_like !== false}"
              ></ha-switch>
              <label class="switch-label">Show feels-like temperature</label>
            </div>
          ` : ''}
          ${this.hasDewpoint ? html`
            <div class="switch-container">
              <ha-switch
                @change="${(e) => this._valueChanged(e, 'show_dew_point')}"
                .checked="${this._config.show_dew_point !== false}"
              ></ha-switch>
              <label class="switch-label">Show dew point</label>
            </div>
          ` : ''}
          ${this.hasWindgustspeed ? html`
            <div class="switch-container">
              <ha-switch
                @change="${(e) => this._valueChanged(e, 'show_wind_gust_speed')}"
                .checked="${this._config.show_wind_gust_speed !== false}"
              ></ha-switch>
              <label class="switch-label">Show wind gust speed</label>
            </div>
          ` : ''}
          ${this.hasVisibility ? html`
            <div class="switch-container">
              <ha-switch
                @change="${(e) => this._valueChanged(e, 'show_visibility')}"
                .checked="${this._config.show_visibility !== false}"
              ></ha-switch>
              <label class="switch-label">Show visibility</label>
            </div>
          ` : ''}
          ${this.hasDescription ? html`
            <div class="switch-container">
              <ha-switch
                @change="${(e) => this._valueChanged(e, 'show_description')}"
                .checked="${this._config.show_description !== false}"
              ></ha-switch>
              <label class="switch-label">Show weather description</label>
            </div>
          ` : ''}
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_last_changed')}"
              .checked="${this._config.show_last_changed !== false}"
            ></ha-switch>
            <label class="switch-label">Show when last data changed</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_daily_summary')}"
              .checked="${this._config.show_daily_summary === true}"
            ></ha-switch>
            <label class="switch-label">Show tomorrow &amp; in 2 days summary</label>
          </div>

          <div class="section-header">Clock</div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'show_time')}"
              .checked="${this._config.show_time !== false}"
            ></ha-switch>
            <label class="switch-label">Show current time</label>
          </div>
          ${this._config.show_time ? html`
            <div class="time-container" style="margin-left: 14px; margin-bottom: 8px;">
              <div class="checkbox-container">
                <ha-checkbox
                  @change="${(e) => this._valueChanged(e, 'show_time_seconds')}"
                  .checked="${this._config.show_time_seconds !== false}"
                ></ha-checkbox>
                <label>Show seconds</label>
              </div>
              <div class="checkbox-container">
                <ha-checkbox
                  @change="${(e) => this._valueChanged(e, 'show_day')}"
                  .checked="${this._config.show_day !== false}"
                ></ha-checkbox>
                <label>Show day</label>
              </div>
              <div class="checkbox-container">
                <ha-checkbox
                  @change="${(e) => this._valueChanged(e, 'show_date')}"
                  .checked="${this._config.show_date !== false}"
                ></ha-checkbox>
                <label>Show date</label>
              </div>
            </div>
            <div class="flex-container" style="margin-bottom: 12px;">
              <ha-textfield
                label="Time text size"
                type="number"
                .value="${this._config.time_size || '26'}"
                @change="${(e) => this._valueChanged(e, 'time_size')}"
              ></ha-textfield>
              <ha-textfield
                label="Day and date text size"
                type="number"
                .value="${this._config.day_date_size || '15'}"
                @change="${(e) => this._valueChanged(e, 'day_date_size')}"
              ></ha-textfield>
            </div>
          ` : ''}
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'use_12hour_format')}"
              .checked="${this._config.use_12hour_format !== false}"
            ></ha-switch>
            <label class="switch-label">Use 12-hour format</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'autoscroll')}"
              .checked="${this._config.autoscroll !== false}"
            ></ha-switch>
            <label class="switch-label">Autoscroll</label>
          </div>

          <div class="section-header">Text Sizes</div>
          <div class="sizes-grid">
            <ha-textfield
              label="Current temperature"
              type="number"
              .value="${this._config.current_temp_size || '28'}"
              @change="${(e) => this._valueChanged(e, 'current_temp_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Condition text"
              type="number"
              .value="${this._config.condition_text_size || '18'}"
              @change="${(e) => this._valueChanged(e, 'condition_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Feels like text"
              type="number"
              .value="${this._config.feels_like_text_size || '13'}"
              @change="${(e) => this._valueChanged(e, 'feels_like_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Description text"
              type="number"
              .value="${this._config.description_text_size || '13'}"
              @change="${(e) => this._valueChanged(e, 'description_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Attributes text"
              type="number"
              .value="${this._config.attributes_text_size || '14'}"
              @change="${(e) => this._valueChanged(e, 'attributes_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Attributes icon"
              type="number"
              .value="${this._config.attributes_icon_size || '24'}"
              @change="${(e) => this._valueChanged(e, 'attributes_icon_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Wind speed text"
              type="number"
              .value="${this._config.wind_speed_text_size || '11'}"
              @change="${(e) => this._valueChanged(e, 'wind_speed_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Wind unit text"
              type="number"
              .value="${this._config.wind_unit_text_size || '9'}"
              @change="${(e) => this._valueChanged(e, 'wind_unit_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Last updated text"
              type="number"
              .value="${this._config.last_updated_text_size || '13'}"
              @change="${(e) => this._valueChanged(e, 'last_updated_text_size')}"
            ></ha-textfield>
            ${this._config.show_daily_summary ? html`
              <ha-textfield
                label="Daily summary text"
                type="number"
                .value="${this._config.daily_summary_text_size || '14'}"
                @change="${(e) => this._valueChanged(e, 'daily_summary_text_size')}"
              ></ha-textfield>
              <ha-textfield
                label="Daily summary icon"
                type="number"
                .value="${this._config.daily_summary_icon_size || '30'}"
                @change="${(e) => this._valueChanged(e, 'daily_summary_icon_size')}"
              ></ha-textfield>
            ` : ''}
          </div>

          <div class="section-header">Language &amp; Custom</div>
          <div class="textfield-container" style="margin-bottom: 12px;">
            <ha-textfield
              label="Custom text sensor entity"
              .value="${this._config.custom_text_sensor || ''}"
              @change="${(e) => this._valueChanged(e, 'custom_text_sensor')}"
            ></ha-textfield>
            ${this._config.custom_text_sensor ? html`
              <ha-textfield
                label="Attribute to display (leave blank to use state — only shown when state is 'on')"
                .value="${this._config.custom_text_sensor_attribute || ''}"
                @change="${(e) => this._valueChanged(e, 'custom_text_sensor_attribute')}"
              ></ha-textfield>
            ` : ''}
          <div class="select-wrapper" style="margin-bottom: 12px;">
            <label>Language</label>
            <select
              class="native-select"
              @change=${(e) => this._valueChanged(e, 'locale')}
            >
              ${[
                { value: '', label: 'HA Default' },
                { value: 'bg', label: 'Bulgarian' },
                { value: 'ca', label: 'Catalan' },
                { value: 'cs', label: 'Czech' },
                { value: 'da', label: 'Danish' },
                { value: 'nl', label: 'Dutch' },
                { value: 'en', label: 'English' },
                { value: 'fi', label: 'Finnish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
                { value: 'el', label: 'Greek' },
                { value: 'hu', label: 'Hungarian' },
                { value: 'it', label: 'Italian' },
                { value: 'lt', label: 'Lithuanian' },
                { value: 'no', label: 'Norwegian' },
                { value: 'pl', label: 'Polish' },
                { value: 'pt', label: 'Portuguese' },
                { value: 'ro', label: 'Romanian' },
                { value: 'ru', label: 'Russian' },
                { value: 'sk', label: 'Slovak' },
                { value: 'es', label: 'Spanish' },
                { value: 'sv', label: 'Swedish' },
                { value: 'uk', label: 'Ukrainian' },
                { value: 'ko', label: '한국어' },
              ].map((o) => html`<option value=${o.value} ?selected=${(this._config.locale || '') === o.value}>${o.label}</option>`)}
            </select>
          </div>
        </div>

        <!-- ===== FORECAST TAB ===== -->
        <div class="page-container ${this.currentPage === 'forecast' ? 'active' : ''}">

          <div class="section-header">Forecast Type</div>
          <div class="radio-group">
            <ha-radio
              name="type"
              value="daily"
              @change="${this._handleTypeChange}"
              .checked="${forecastConfig.type === 'daily'}"
            ></ha-radio>
            <label>Daily forecast</label>
          </div>
          <div class="radio-group">
            <ha-radio
              name="type"
              value="hourly"
              @change="${this._handleTypeChange}"
              .checked="${forecastConfig.type === 'hourly'}"
            ></ha-radio>
            <label>Hourly forecast</label>
          </div>

          <div class="section-header">Chart Style</div>
          <div class="radio-container">
            <div class="switch-right">
              <ha-radio
                name="style"
                value="style1"
                @change="${this._handleStyleChange}"
                .checked="${forecastConfig.style === 'style1'}"
              ></ha-radio>
              <label>Chart style 1</label>
            </div>
            <div class="switch-right">
              <ha-radio
                name="style"
                value="style2"
                @change="${this._handleStyleChange}"
                .checked="${forecastConfig.style === 'style2'}"
              ></ha-radio>
              <label>Chart style 2</label>
            </div>
          </div>

          <div class="section-header">Forecast Settings</div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'forecast.condition_icons')}"
              .checked="${forecastConfig.condition_icons !== false}"
            ></ha-switch>
            <label class="switch-label">Show condition icons</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'forecast.show_wind_forecast')}"
              .checked="${forecastConfig.show_wind_forecast !== false}"
            ></ha-switch>
            <label class="switch-label">Show wind forecast</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'forecast.round_temp')}"
              .checked="${forecastConfig.round_temp !== false}"
            ></ha-switch>
            <label class="switch-label">Round temperatures</label>
          </div>
          <div class="switch-container">
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'forecast.disable_animation')}"
              .checked="${forecastConfig.disable_animation !== false}"
            ></ha-switch>
            <label class="switch-label">Disable chart animation</label>
          </div>
          <div class="select-wrapper" style="margin-bottom: 12px;">
            <label>Precipitation type (probability if supported by weather entity)</label>
            <select
              class="native-select"
              @change=${(e) => this._valueChanged(e, 'forecast.precipitation_type')}
            >
              <option value="rainfall" ?selected=${forecastConfig.precipitation_type === 'rainfall'}>Rainfall</option>
              <option value="probability" ?selected=${forecastConfig.precipitation_type === 'probability'}>Probability</option>
            </select>
          </div>
          <div class="switch-container" ?hidden=${forecastConfig.precipitation_type !== 'rainfall'}>
            <ha-switch
              @change="${(e) => this._valueChanged(e, 'forecast.show_probability')}"
              .checked="${forecastConfig.show_probability !== false}"
            ></ha-switch>
            <label class="switch-label">Show precipitation probability</label>
          </div>

          <div class="section-header">Sizes &amp; Layout</div>
          <div class="flex-container" style="margin-bottom: 12px;">
            <ha-textfield
              label="Precipitation bar size %"
              type="number"
              max="100"
              min="0"
              .value="${forecastConfig.precip_bar_size || '100'}"
              @change="${(e) => this._valueChanged(e, 'forecast.precip_bar_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Number of forecasts (0 = auto)"
              type="number"
              .value="${forecastConfig.number_of_forecasts || '0'}"
              @change="${(e) => this._valueChanged(e, 'forecast.number_of_forecasts')}"
            ></ha-textfield>
            <ha-textfield
              label="Chart height"
              type="number"
              .value="${forecastConfig.chart_height || '180'}"
              @change="${(e) => this._valueChanged(e, 'forecast.chart_height')}"
            ></ha-textfield>
            <ha-textfield
              label="Extra height when raining (px)"
              type="number"
              min="0"
              .value="${forecastConfig.precip_expand_height || '0'}"
              @change="${(e) => this._valueChanged(e, 'forecast.precip_expand_height')}"
            ></ha-textfield>
            <ha-textfield
              label="Labels font size"
              type="number"
              .value="${forecastConfig.labels_font_size || '11'}"
              @change="${(e) => this._valueChanged(e, 'forecast.labels_font_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Chart text size"
              type="number"
              .value="${forecastConfig.chart_text_size || '14'}"
              @change="${(e) => this._valueChanged(e, 'forecast.chart_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Chart ticks text size"
              type="number"
              .value="${forecastConfig.chart_ticks_text_size || '14'}"
              @change="${(e) => this._valueChanged(e, 'forecast.chart_ticks_text_size')}"
            ></ha-textfield>
            <ha-textfield
              label="Chart line width"
              type="number"
              step="0.5"
              .value="${forecastConfig.chart_line_width || '1.5'}"
              @change="${(e) => this._valueChanged(e, 'forecast.chart_line_width')}"
            ></ha-textfield>
            <ha-textfield
              label="Chart point radius"
              type="number"
              step="0.5"
              .value="${forecastConfig.chart_point_radius || '2'}"
              @change="${(e) => this._valueChanged(e, 'forecast.chart_point_radius')}"
            ></ha-textfield>
            <ha-textfield
              label="Condition icon size"
              type="number"
              .value="${forecastConfig.condition_icon_size || '25'}"
              @change="${(e) => this._valueChanged(e, 'forecast.condition_icon_size')}"
            ></ha-textfield>
          </div>
        </div>

        <!-- ===== UNITS TAB ===== -->
        <div class="page-container ${this.currentPage === 'units' ? 'active' : ''}">
          <div class="textfield-container">
            <div class="select-wrapper">
              <label>Convert pressure to</label>
              <select
                class="native-select"
                @change=${(e) => this._valueChanged(e, 'units.pressure')}
              >
                <option value="hPa" ?selected=${unitsConfig.pressure === 'hPa'}>hPa</option>
                <option value="mmHg" ?selected=${unitsConfig.pressure === 'mmHg'}>mmHg</option>
                <option value="inHg" ?selected=${unitsConfig.pressure === 'inHg'}>inHg</option>
              </select>
            </div>
            <div class="select-wrapper">
              <label>Convert wind speed to</label>
              <select
                class="native-select"
                @change=${(e) => this._valueChanged(e, 'units.speed')}
              >
                <option value="km/h" ?selected=${unitsConfig.speed === 'km/h'}>km/h</option>
                <option value="m/s" ?selected=${unitsConfig.speed === 'm/s'}>m/s</option>
                <option value="Bft" ?selected=${unitsConfig.speed === 'Bft'}>Bft</option>
                <option value="mph" ?selected=${unitsConfig.speed === 'mph'}>mph</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ===== ALTERNATE ENTITIES TAB ===== -->
        <div class="page-container ${this.currentPage === 'alternate' ? 'active' : ''}">
          <h5>Alternative sensors for the main card attributes:</h5>
          <ha-form
            .data=${this._config}
            .schema=${ALT_SCHEMA}
            .hass=${this.hass}
            @value-changed=${this._formValueChanged}
          ></ha-form>
        </div>

      </div>
    `;
  }
}
customElements.define("eink-weather-card-editor", EinkWeatherCardEditor);
