class CameraController {

    constructor(jq, p) {
        this.$ = jq;

        this.camServerSelector = '#node-input-fvconfig';
        this.camSelector = '#node-input-camera';
        this.allCameras = [];

        this.ipToUri = p.ipToUri; // a function in flexible-vision-nodes.html & .js
        this.ip = p.ip;
        let check = this.$(this.camServerSelector + ' option:selected').text()
        if (check.length > 0 && this.isValidIP(check)) {
            this.ip = check;
        }
        this.camId = p.camId || "";

        console.log('CTR INITIALIZED', p, this.getContext('init'));
    }

    startListeners() {
        document.getElementById('allCamRefreshBtn').onclick = () => {
            console.log('refreshing cameras!')
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
            this.syncToForm('camChange');
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
        };
        let check = this.$(this.camServerSelector + ' option:selected').text()
        if (check.length > 0) {
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
        let ctx = JSON.stringify(this.getContext(src), null, 2);
        console.log(ctx)
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
        }

        const ctx = {
            ip: this.ip,
            camId: this.camId
        };

        if (JSON.stringify(ctx) !== JSON.stringify(form)) {
            console.warn("OUT OF SYNC: " + src, ctx, form)
        }

        return {"form": form, "ctx": ctx}
    }
}

