class CamPropController {

    constructor(jq, p) {
        this.$ = jq;

        this.camServerSelector = '#node-input-fvconfig';
        this.camSelector = '#node-input-camera';
        this.camPropSelector = '#node-input-camProp';
        this.camPropValSelector = '#node-input-propVal';

        this.typeMap = {
            'Enumerate': {type: 'select', nodeName: 'select'},
            'String': {type: 'text', nodeName: 'input'},
            'Integer': {type: 'number', nodeName: 'input'},
            'Float': {type: 'number', nodeName: 'input'},
            'Command': {type: 'textarea', nodeName: 'textarea'},
            'Bool': {type: 'checkbox', nodeName: 'select'} // only because configTree provides True/False `options`
        };
        this.camSettings = false;
        this.allCameras = [];

        this.ipToUri = p.ipToUri; // a function in flexible-vision-nodes.html & .js
        this.ip = p.ip || "";
        if (p.camId) {
            this.$(this.camSelector).html(`<option value="${p.camId}" id="node-input-camera" selected="true" />`)
            this.camId = p.camId;
        } else {
            this.camId = "";
        }
        if (p.camProp) {
            this.$(this.camPropSelector).html(`<option value="${p.camProp}" id="node-input-camProp" selected="true" />`)
            this.camProp = p.camProp;
        } else {
            this.camProp = {};
        }
        if (p.propVal) {
            this.$(this.camPropValSelector).val(p.propVal); // warn: get rerendered as correct nodeType
            this.propVal = p.propVal;
        } else {
            this.propVal = "";
        }
        this.camProperty = p.camProperty || {};

        console.log('CTR INITIALIZED w/ ', p);
        this.getToolTip('Initial');

        this.loadFieldData();
        this.startListeners();
    }

    async loadFieldData(forceReload) {
        let test = await this.loadCameras(forceReload);
        if (typeof test === 'string') {
            console.warn(test);
        } else {
            const test = await this.loadCamConfigs(forceReload);
            if (typeof test === 'string') {
                console.warn(test);
            } else {
                this.buildPropValField();
            }
        }
        this.syncToForm('loadFieldData');
    }

    startListeners() {

        document.getElementById('allCamRefreshBtn').onclick = () => {
            console.log('refreshing cameras!');
            this.loadFieldData(true);
        }

        this.$(this.camServerSelector).on('change', async (e) => {
            let check = this.$(this.camServerSelector + ' option:selected').text(); // can't use target.value because it's a config ID not the host
            if (typeof check === 'string' && this.isValidIP(check)) {
                if (this.ip === check) return false;
                this.ip = check;
                this.loadFieldData(true);
            }
        })

        this.$(this.camSelector).on('change', async (e) => {
            if (this.camId === e.currentTarget.value) return false;
            this.camId = e.currentTarget.value;
            let test = await this.loadCamConfigs();
            if (typeof test === 'string') {
                console.warn(test);
            } else {
                this.buildPropValField();
                this.syncToForm('Camera Change');
            }
        });

        this.$(this.camPropSelector).on('change', (e) => {
            var selectedOption = e.currentTarget.options[e.currentTarget.selectedIndex];
            if (selectedOption && selectedOption.getAttribute('data-parent')) {
                this.setProperty(selectedOption.getAttribute('data-parent'), selectedOption.getAttribute('data-label'));
                this.buildPropValField();
                this.syncToForm('Property Change');
            } else {
                console.warn('no selected cam prop', selectedOption);
            }
        });

        this.$(this.camPropValSelector).on('change', (e) => {
            this.propVal = e.target.value;
            this.syncToForm('Value Change');
        });

    }

    restoreFromLocalStorage() {
        if (this.ip === "") return {};
        let key = 'fvenv' + this.ip;
        let env = localStorage.getItem(key);
        if (!env) return {};
        env = JSON.parse(env);
        if (env.allCameras && env.allCameras.length > 0) {
            this.allCameras = env.allCameras;
        }
        if (this.camId && env.allSettings && env.allSettings[this.camId]) {
            this.camSettings = env.allSettings[this.camId];
        } else {
            this.camSettings = false;
        }

        console.log("restored " + key, env)
        return env;
    }

    saveToLocalStorage() {
        if (this.ip === "") return false;
        let key = 'fvenv' + this.ip;
        let env = localStorage.getItem(key);
        if (env) {
            env = JSON.parse(env);
        } else {
            env = {allCameras: this.allCameras, allSettings: {}}
        }
        if (this.allCameras && this.allCameras.length > 0) {
            env.allCameras = this.allCameras;
        }
        if (this.camId && this.camSettings) {
            env.allSettings[this.camId] = this.camSettings;
        }
        console.log("saved " + key, env);
        localStorage.setItem(key, JSON.stringify(env));
    }

    loadCameras(forceReload) {

        return new Promise((resolve, reject) => {

             if (!this.ip || this.ip === "") {
                console.log("cannot load cameras without a valid IP")
                return false;
            }

            if (forceReload !== true) {
                this.restoreFromLocalStorage();
                if (this.allCameras && this.allCameras.length > 0) {
                    this.allCamerasCallback(this.allCameras);
                    return resolve(this.allCameras)
                }
            }

            this.$('#allCamRefreshBtn').prop('disabled', true)
            this.togglePreloader(this.camSelector, true)

            const url = this.ipToUri(this.ip, '/api/vision/vision/cameras');

            fetch(url)
                .then(response => {
                    this.$('#allCamRefreshBtn').prop('disabled', false);
                    this.togglePreloader(this.camSelector, false);
                    if (!response.ok) {
                        throw new Error(`API call failed with status: ${response.status}`);
                    }
                    return response.json();

                })
                .then(cameras => {
                    console.log("Got Cameras from Server ", cameras);
                    this.allCameras = cameras;
                    this.saveToLocalStorage();
                    this.allCamerasCallback(cameras);
                    return resolve(cameras)
                })
                .catch(error => {
                    this.$('#allCamRefreshBtn').prop('disabled', false);
                    this.togglePreloader(this.camSelector, false);
                    return reject("LOAD CAM FAILED: " + error.message)
                });

        })
    }

    allCamerasCallback(cameras) {
        const opts = ['<option value="">Select a Camera</option>'];
        this.allCameras.forEach(o => {
            const toPass = {
                'value': o.serial_number,
                'text': [o.user_defined_name, o.serial_number].join(' - ')
            }
            if (o.serial_number == this.camId) {
                toPass.selected = true;
            }
            opts.push($('<option/>', toPass));
        })
        this.$(this.camSelector).html(opts);

        this.$('#allCamRefreshBtn').prop('disabled', false)
        this.togglePreloader(this.camSelector, false);

        if (this.camId || this.camId === '') return false;

        const index = cameras.findIndex(c => c.serial_number == this.camId);
        if (index < -1) {
            return console.warn(index + " - THIS CAMERA IS NO LONGER CONNECTED" + this.camId, cameras)
        }

    }

    loadCamConfigs(forceReload) {

        return new Promise((resolve, reject) => {

            if (this.camId === '') {
                return reject('cam not ready');
            }
            this.togglePreloader(this.camPropSelector, true)

            const url = this.ipToUri(this.ip, '/api/vision/vision/configTree/' + this.camId);
            fetch(url)
                .then(response => {
                    this.togglePreloader(this.camPropSelector, false);
                    if (!response.ok) {
                        throw new Error(`API call failed with status: ${response.status}`);
                    }
                    return response.json();

                })
                .then(data => {
                    console.log("Got cam configs", data)
                    this.camSettings = data;
                    this.renderCamProps();
                    this.saveToLocalStorage();
                    return resolve(data)
                })
                .catch(error => {
                    this.togglePreloader(this.camPropSelector, false);
                    return reject("cam config failed " + error.message)
                });

        })
    }

    renderCamProps() {
        if (!this.camSettings) {
            this.$(this.camPropSelector).html('<option value="">No available settings. Try refreshing the camera list.</option>');
            return true;
        }
        const opts = [];
        for (let parent in this.camSettings) {
            opts.push(this.$('<optgroup />', {
                'label': parent
            }));

            // this.camSettings[parent] = Object.fromEntries(Object.entries(this.camSettings[parent]).sort());

            for (let label in this.camSettings[parent]) {
                const setting = this.camSettings[parent][label];
                // allTypes[setting.type] = label;
                // allTypes[setting.access_mode] = label;
                var toPass = {}
                toPass['data-parent'] = parent;
                toPass['data-label'] = label;
                toPass.value = setting.node_name;
                toPass.text = label;
                if (setting.type === 'null') {
                    toPass.disabled = true;
                }
                if (this.camProp === setting.node_name) {
                    toPass.selected = true;
                }
                opts.push(this.$('<option/>', toPass));
            }
        }
        this.$(this.camPropSelector).html(opts);
    }

    buildPropValField() {

        if (!this.camProperty || !this.camProperty.type) {
            if (this.camId === '') {
                return this.getToolTip('Reselect your camera');
            }
            this.$(this.camPropValSelector).val(this.propVal);
            this.findAndSetCamProperty();
            this.getToolTip('Still loading camera properties');
            return setTimeout(() => this.buildPropValField(), 250);
        }

        let config = this.typeMap[this.camProperty.type];

        if (this.$(this.camPropValSelector).prop('nodeName').toLowerCase() !== config.nodeName) { // warn: can switch between input and select components
            const newEl = document.createElement(config.nodeName);
            newEl.setAttribute('type', config.type);
            newEl.id = this.camPropValSelector.substring(1); // strip hash
            newEl.onchange = (e) => {
                this.propVal = e.currentTarget.value;
                this.syncToForm(this.camProperty.type + ' Value Change');
            }
            this.$(this.camPropValSelector).replaceWith(newEl);
        } else {
            this.$(this.camPropValSelector).attr('type', config.type);
        }

        if (this.camProperty.access_mode.toUpperCase() === 'READ ONLY') {
            this.$(this.camPropValSelector).prop('disabled', true);
        }

        const atts = {min: 'min', max: 'max', inc: 'step'};
        for (let att in atts) {
            if (typeof this.camProperty[att] !== 'undefined') {
                this.$(this.camPropValSelector).attr(atts[att], this.camProperty[att])
            } else {
                this.$(this.camPropValSelector).removeAttr(atts[att])
            }
        }

        if (this.camProperty.options) {
            const opts = this.camProperty.options.map(o => {
                const opt = document.createElement("OPTION");
                opt.value = 0;
                opt.innerText = o;
                if (o.toString() == this.propVal) { // do not use ===
                    opt.setAttribute('selected', true);
                }
                return opt;
            })
            this.$(this.camPropValSelector).html(opts);
        } else {
            this.$(this.camPropValSelector).val(this.propVal);
        }
    }

    findAndSetCamProperty() {
        if (this.camSettings) {
            for (let j in this.camSettings) {
                for (let i in this.camSettings[j]) {
                    if (this.camSettings[j][i].node_name === this.camProp) {
                        return this.setProperty(j, i);
                    }
                }
            }
        } else {
            this.loadCamConfigs(true);
            console.warn("MISSING CAM SETTINGS");
        }
    }

    setProperty(parent, label) {
        if (!this.camSettings || !this.camSettings[parent] || !this.camSettings[parent][label]) {
            console.log("INVALID CAM PROP!!!", parent, label, this.camSettings)
            return false;
        }
        this.camProperty = this.camSettings[parent][label];
        this.camProperty.parent = parent;
        this.camProperty.label = label;
        if (this.propVal === ''  || this.camProp !== this.camProperty.node_name) {
            if (typeof this.camProperty.value === 'object') {
                console.warn("camProperty.value should always be a string. found: " + typeof this.camProperty.value);
                this.propVal = JSON.stringify(this.camProperty.value);
            } else {
                this.propVal = this.camProperty.value;
            }
        }

        if (this.camProperty.access_mode.toUpperCase() === 'READ ONLY') {
            this.$(this.camPropValSelector).prop('disabled', true);
        }

        this.camProp = this.camProperty.node_name;
    }

    isValidIP(ip) {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    // like ComponentDidUpdate in react.js
    syncToForm(src) {
        let defaults = {
            ip: this.ip,
            camId: this.camId,
            camProperty: this.camProperty,
            camProp: this.camProp,
            propVal: this.propVal
        };

        if (defaults.camProperty) {
            defaults.node_type = defaults.camProperty.type;
            if (defaults.camProperty.access_mode) {
                defaults.access_mode = defaults.camProperty.access_mode;
                if (defaults.access_mode.toUpperCase() === 'READ ONLY') {
                    this.$(this.camPropValSelector).prop('disabled', true);
                } else {
                    this.$(this.camPropValSelector).prop('disabled', false);
                }
            }
        }

        const event = new CustomEvent('updateToolContext', {detail: defaults});
        document.getElementById("fvCamForm").dispatchEvent(event);

        this.getToolTip(src);

        return defaults;
    }

    getToolTip(desc) {
        let html = JSON.stringify(this.camProperty, null, 2);
        let ctx = JSON.stringify(this.getContext(desc), null, 2);
        this.$('#camPropertyDesc').html(`<h3>Selected Property</h3><pre>${html}</pre><div style="opacity:.5"><h3>${desc}</h3><pre>${ctx}</pre></div>`)
    }

    togglePreloader(sel, show) {
        let parent = this.$(sel).parent();
        if (show === true) {
            parent.addClass('loading')
            this.$(sel).prop('disabled', true)
        } else {
            parent.removeClass('loading')
            this.$(sel).prop('disabled', false)
        }
    }

    getContext(src) {
        let form = {
            ip: this.$(this.camServerSelector + ' option:selected').text(),
            camId: this.$(this.camSelector).val(),
            camProp: this.$(this.camPropSelector).val(),
            propVal: this.$(this.camPropValSelector).val()
        }

        const ctx = {
            ip: this.ip,
            camId: this.camId,
            camProp: this.camProp,
            propVal: this.propVal
        };

        const resp = {"form": form, "ctx": ctx};
        if (JSON.stringify(ctx) !== JSON.stringify(form)) {
            console.warn("OUT OF SYNC: " + src, resp)
        }

        return resp
    }

    onUpdates(clk) {
        document.getElementById("fvCamForm").addEventListener('updateToolContext', (e) => clk(e), {capture: false});
    }
}
