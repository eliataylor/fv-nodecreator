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
        this.ip = p.ip;
        let check = this.$(this.camServerSelector + ' option:selected').text()
        if (check.length > 0 && this.isValidIP(check)) {
            this.ip = check;
        }
        this.camId = p.camId || "";
        this.propVal = p.propVal || "";
        this.camProp = p.camProp || undefined;
        this.camProperty = p.camProperty || {};

        console.log('CTR INITIALIZED', p, this.getContext('init'));
    }

    startListeners() {
        document.getElementById('allCamRefreshBtn').onclick = () => {
            console.log('refreshing cameras!');
            this.loadCameras(true);
        }

        this.$(this.camServerSelector).on('change', (e) => {
            let check = this.$(this.camServerSelector + ' option:selected').text()
            if (check.length > 0 && this.isValidIP(check)) {
                this.ip = check;
                this.$(this.camSelector).val('').trigger('change');
                this.syncToForm('serverChange');
                this.loadCameras();
            }
        })

        this.$(this.camSelector).on('change', (e) => {
            if (e.currentTarget.value !== this.camId) {
                this.camProp = '';
                this.camProperty = {};
                this.$(this.camPropSelector).val('').trigger('change');
            }
            this.syncToForm('camChange');
            this.loadCamConfigs();
        });

        this.$(this.camPropSelector).on('change', (e) => {
            if (e.currentTarget.value !== this.camProp) {
                this.setCam(e.currentTarget.value)
                this.$(this.camPropValSelector).val('')
                this.propVal = '';
            }
            this.syncToForm('camPropChange');
            this.buildPropValField()
        });

        this.loadCameras();
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

    renderCameras() {
        this.$(this.camSelector).html('<option value="">Select a Camera</option>');
        this.allCameras.forEach(o => {
            const toPass = {
                'value': o.serial_number,
                'text': [o.user_defined_name, o.serial_number].join(' - ')
            }
            if (o.serial_number == this.camId) {
                toPass.selected = true;
            }
            this.$('<option/>', toPass).appendTo(this.camSelector);
        })
        this.$('#allCamRefreshBtn').prop('disabled', false)
        this.togglePreloader(this.camSelector, false);
        this.syncToForm('renderCameras');
    }

    loadCameras(forceReload) {
        if (forceReload !== true) {
            this.restoreFromLocalStorage();
            if (this.allCameras && this.allCameras.length > 0) {
                if (this.camId === '') {
                    return this.allCamerasCallback(this.allCameras);
                } else if (this.allCameras.findIndex(c => c.serial_number == this.camId) > -1) {
                    return this.allCamerasCallback(this.allCameras);
                } else {
                    console.warn("selected camera missing: " + this.camId, this.allCameras)
                }
            }
        }
        if (!this.ip || this.ip === "") {
            console.log("cannot load cameras without a valid IP")
            return false;
        }

        this.$('#allCamRefreshBtn').prop('disabled', true)
        this.togglePreloader(this.camSelector, true)
        const url = this.ipToUri(this.ip, '/api/vision/vision/cameras');
        this.$.ajax({
            url: url,
            dataType: "json"
        }).done(async (cameras) => {
            console.log("Got Cameras from Server ", cameras);
            this.allCameras = cameras;
            this.saveToLocalStorage();
            this.allCamerasCallback(cameras);
        }).fail((err) => {
            console.error("LOAD CAM FAILED", err);
            this.$('#allCamRefreshBtn').prop('disabled', false);
            this.togglePreloader(this.camSelector, false);
            this.getToolTip('loadCamFailed');
        })
    }

    allCamerasCallback(cameras) {
        this.renderCameras();
        if (this.camId === '') {
            return false;
        }
        const index = cameras.findIndex(c => c.serial_number == this.camId);
        if (index < -1) {
            return console.warn(index+ " - THIS CAMERA IS NO LONGER CONNECTED" + this.camId, cameras)
        }

        this.loadCamConfigs();
    }

    loadCamConfigs() {
        if (typeof this.camProp === 'undefined') return false; // only use for set-config-prop node
        var url = this.ipToUri(this.ip, '/api/vision/vision/configTree/' + this.camId);
        this.togglePreloader(this.camPropSelector, true)

        this.$.ajax({
            url: url,
            dataType: "json"
        }).done(data => {
            console.log("Got Cam Configs", data)
            this.camSettings = data;
            this.renderCamProps();
            this.saveToLocalStorage();
        }).fail(err => {
            this.camSettings = false;
            this.togglePreloader(this.camPropSelector, false);
            console.error("LOAD CAM CONFIG FAILED", err);
            this.getToolTip('loadCamConfigFailed');
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
        this.togglePreloader(this.camPropSelector, false)
        this.syncToForm('renderProps');

        this.buildPropValField();
        // console.info(allTypes);
    }

    buildPropValField() {
        if (!this.camProperty || !this.camProperty.type) {
            this.getToolTip('buildPropValField: no camProperty');
            console.log(this.getContext('missing camProperty'))
            return;
        }

        let config = this.typeMap[this.camProperty.type];

        if (this.$(this.camPropValSelector).prop('nodeName').toLowerCase() !== config.nodeName) {
            const newEl = document.createElement(config.nodeName);
            newEl.setAttribute('type', config.type);
            newEl.id = this.camPropValSelector.substring(1); // strip hash
            this.$(this.camPropValSelector).replaceWith(newEl)
        }

        const atts = {min:'min', max:'max', inc:'step'};
        for(let att in atts) {
            if (typeof this.camProperty[att] !== 'undefined') {
                this.$(this.camPropValSelector).attr(atts[att], this.camProperty[att])
            } else {
                this.$(this.camPropValSelector).removeAttr(atts[att])
            }
        }

        this.$(this.camPropValSelector).attr('type', config.type);

        if (this.camProperty.options) {
            this.$(this.camPropValSelector).html('');
            this.camProperty.options.forEach(o => {
                this.$('<option/>', {
                    text: o,
                    value: o,
                    selected: o == this.propVal
                }).appendTo(this.camPropValSelector)
            })
        }

        this.$(this.camPropValSelector).val(this.propVal)

        this.$(this.camPropValSelector).on('change', (e) => {
            this.propVal = e.currentTarget.value;
            this.syncToForm('propValChange');
        });

        this.syncToForm('buildPropValField')
    }

    releaseCamera() {
        // TODO: when access_mode === "READ_ONLY"
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

    setCam(cam) {
        this.camId = cam;
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
        let check = this.$(this.camServerSelector + ' option:selected').text()
        if (check && check.length > 0) {
            if (this.isValidIP(check)) {
                defaults.ip = check;
                this.ip = check;
            } else {
                console.error('invalid IP address', e.message)
            }
        }

        check = this.$(this.camSelector).val()
        if (check && check !== '') {
            defaults.camId = check;
            this.setCam(check)
        } else if (defaults.camId) {
            this.$(this.camSelector).val(defaults.camId);
        }

        check = this.$(this.camPropSelector + ' option:selected')
        if (check && check.length > 0 && check.attr('data-parent')) {
            this.setProperty(check.attr('data-parent'), check.attr('data-label'));
            defaults.camProperty = this.camProperty;
            defaults.camProp = this.camProp;
        } else if (defaults.camProp && defaults.camProp.length > 0) {
            if (this.camSettings) {
                outer: for(let j in this.camSettings) {
                    for(let i in this.camSettings[j]) {
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
            this.$(this.camPropSelector).val(defaults.camProp);
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

        if (this.propVal === '' && this.camProperty.value) {
            this.propVal = this.camProperty.value;
            defaults.propVal = this.propVal;
            this.$(this.camPropValSelector).val(this.camProperty.value)
        }

        // console.log('synced form', defaults);
        if (document.getElementById("fvCamForm")) {
            const event = new CustomEvent('updateToolContext', {detail: defaults});
            document.getElementById("fvCamForm").dispatchEvent(event);
        } else {
            console.warn('Form not in DOM', defaults);
        }

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
        if (prop.length > 0) {
            const group = this.camSettings[prop.attr('data-parent')];
            for(let i in group) {
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

        if (JSON.stringify(ctx) !== JSON.stringify(form)) {
            console.warn("OUT OF SYNC: " + src, ctx, form)
        }

        return {form: form, ctx: ctx}
    }
}

