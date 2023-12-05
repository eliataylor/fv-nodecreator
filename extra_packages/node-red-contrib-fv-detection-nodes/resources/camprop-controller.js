class CamPropController {

    constructor(jq, p) {
        this.$ = jq;

        this.camServerSelector = '#node-input-fvconfig';
        this.camSelector = '#node-input-camera';
        this.camPropSelector = '#node-input-camprop';
        this.camPropValSelector = '#node-input-propval';

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
            this.$(this.camSelector).html(`<option value="${p.camId}" selected="true" />`)
            this.camId = p.camId;
        } else {
            this.camId = "";
        }
        if (p.camProp) {
            this.$(this.camPropSelector).html(`<option value="${p.camProp}" selected="true" />`)
            this.camProp = p.camProp;
        } else {
            this.camProp = {};
        }
        if (p.propVal) {
            this.$(this.camPropValSelector).html(`<input value="${p.propVal}"  />`)
            this.propVal = p.propVal;
        } else {
            this.propVal = "";
        }
        this.camProperty = p.camProperty || {};

        console.log('CTR INITIALIZED w/ ', p);
        this.getContext('init');

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
        this.syncToForm('done');
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
            this.camProp = '';
            this.camProperty = {};
            let test = await this.loadCamConfigs();
            if (typeof test === 'string') {
                console.warn(test);
            } else {
                this.buildPropValField();
                this.syncToForm('camChange');
            }
        });

        this.$(this.camPropSelector).on('change', (e) => {
            this.setProperty(e.currentTarget.getAttribute('data-parent'), e.currentTarget.getAttribute('data-label'));
            this.syncToForm('camPropChange');
        });

        this.$(this.camPropValSelector).on('change', (e) => {
            this.propVal = e.currentTarget.value;
            this.syncToForm('propValChange');
        });

    }

    restoreFromLocalStorage() {
        if (this.ip === "") {
            console.warn(this.getContext('missing IP Address from localStorage'))
            return {};
        }
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

            if (this.camId === '') return reject('cam not ready');
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
                    console.log("Got Cam Configs", data)
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
        // let allTypes = {}
        if (!this.camSettings) {
            this.$(this.camPropSelector).html('<option value="">No available settings. Try refreshing the camera list.</option>');
            return true;
        }
        this.$(this.camPropSelector).html('<option value="">Select a Property</option>');
        for (let parent in this.camSettings) {

            this.$('<option/>', {
                'text': parent,
                'disabled': true
            }).appendTo(this.camPropSelector);

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
                this.$('<option/>', toPass).appendTo(this.camPropSelector);
            }
        }
    }

    buildPropValField() {

        if (!this.camProperty || !this.camProperty.type) {
            this.$(this.camPropValSelector).val(this.propVal)

            return setTimeout(() => this.buildPropValField(), 250);

            console.log(this.camProperty);
            this.getToolTip('No camProperty yet ' );
            return;
        }

        let config = this.typeMap[this.camProperty.type];

        if (this.$(this.camPropValSelector).prop('nodeName').toLowerCase() !== config.nodeName) { // warn: can switch between input and select components
            const newEl = document.createElement(config.nodeName);
            newEl.setAttribute('type', config.type);
            newEl.id = this.camPropValSelector.substring(1); // strip hash
            this.$(this.camPropValSelector).replaceWith(newEl)
            this.$(this.camPropValSelector).on('change', (e) => {
                this.propVal = e.currentTarget.value;
                this.syncToForm('propValChange');
            });

        } else {
            this.$(this.camPropValSelector).attr('type', config.type);
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
            this.$(this.camPropValSelector).html('');
            this.camProperty.options.forEach(o => {
                this.$('<option/>', {
                    text: o,
                    value: o,
                    selected: o == this.propVal
                }).appendTo(this.camPropValSelector)
            })
        } else {
            this.$(this.camPropValSelector).val(this.propVal)
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

        if (defaults.camProp && defaults.camProp.length > 0) {
            if (this.camSettings) {
                outer: for (let j in this.camSettings) {
                    for (let i in this.camSettings[j]) {
                        if (this.camSettings[j][i].node_name === defaults.camProp) {
                            this.setProperty(j, i);
                            defaults.camProperty = this.camProperty;
                            break outer;
                        }
                    }
                }
            } else {
                console.warn("MISSING CAM SETTINGS??", defaults)
            }
        }

        if (defaults.camProperty) {
            defaults.node_type = defaults.camProperty.type;
            if (defaults.camProperty.access_mode) {
                defaults.access_mode = defaults.camProperty.access_mode;
                if (defaults.access_mode.toUpperCase() === 'READ ONLY') {
                    this.$('#fvPropValRow').hide();
                } else {
                    this.$('#fvPropValRow').show();
                }
            }
        }

        /*
        if (this.propVal === '' && this.camProperty.value) {
            this.$(this.camPropValSelector).val(this.camProperty.value)
            this.$(this.camPropValSelector).trigger('change');
        }
         */

        const event = new CustomEvent('updateToolContext', {detail: defaults});
        document.getElementById("fvCamForm").dispatchEvent(event);

        this.getToolTip('syncToForm: ' + src);

        return defaults;
    }

    getToolTip(src) {
        let html = JSON.stringify(this.camProperty, null, 2);
        let ctx = JSON.stringify(this.getContext(src), null, 2);
        this.$('#camPropertyDesc').html(`<h3>Selected Property</h3><pre>${html}</pre><h3>Context</h3><pre>${ctx}</pre>`)
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
        const prop = this.$(this.camPropSelector + ' option:selected');
        let form = {
            ip: this.$(this.camServerSelector + ' option:selected').text(),
            camId: this.$(this.camSelector).val(),
            camProp: prop.val(),
            propVal: this.$(this.camPropValSelector).val()
        }
        if (prop.length > 0 && this.camSettings) {
            const group = this.camSettings[prop.attr('data-parent')];
            for (let i in group) {
                if (group[i].node_name === form.camProp) {
                    form.camProperty = group[i];
                    break;
                }
            }
        }

        const ctx = {
            ip: this.ip,
            camId: this.camId,
            camProp: this.camProp,
            propVal: this.propVal,
            camProperty: this.camProperty
        };

        const resp = {"form": form, "ctx": ctx};
        if (JSON.stringify(ctx) !== JSON.stringify(form)) {
            console.warn("OUT OF SYNC: " + src, resp)
        }

        return resp
    }

    onUpdates(clk) {
        document.getElementById("fvCamForm").addEventListener('updateToolContext', clk, {capture: false});
    }
}
