module.exports = function (RED) {
    "use strict";

    const HOURGLASS = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTzMyMC0xNjBoMzIwdjEyMHEwLTY2LTM3LTQ3LTExM3QtMTExLTQ3cTctNjYgMC0xMTMgNDd0LTExMy00N3E2NiAwLTExMyA0N3QtNDcgMTExIDQ3di0xMjB6bTE2MC0zNjBxNjYgMCAxMTMtNDcgNDd0LTEyMCAxNjBxLTc2IDQ3IDEyIDQ3di0xMjB6bTE2MC04MHYtODByaDgwdi0xMjBxNjAgNjEgMjguNS0xMTQuNU0zNDgtNDgwdi0xMzgtODBoODB2LTEyMC00NzUuNUwzNDAtNDgwIDYxLjUtMTE0LjV0NDctMTEzIDQ3LTM3LTExMyA0N3F6MTYwLTE2MCBxNjYgMCAxMTMtNDd0LTExMy00N3QtNDd0LTEyIDYxIDExMyA0N3Z4MTYwLTM2em0xNjAtODB2LTgweC04MHE4MC0xMjB0LTExMjAgMCA2MS0yOC41IDExMy00N3Q0NyLTExM3E0NyA2NiA0NyAxMTMgNDd6MTYwLTh6MTYwLTI0MC04MC0yNDB2LTEyMHQtODB2LTgwczY2IDAtMTEgNDctNDd0NDd0LTEyIDYxIDExMzA0NyA0N3Q0NyA2Ni0yOCAzMi04OS41LTM1LjUgODktODUuNXQyNDAuLTQ4MHYtMTIwLTI4djc0LjUtODUuNXQxMjQwLTY4MHQ4MC0xMjB2LTEyMHpoNjQwdi04MHpNMTYwLTI4MHYtODB6MTYwLTY0MHpNMTYwLTgwejE2MC02NDB6Ii8+PC9zdmc+\n'

    const FV_DOMAIN = 'v1.cloud.flexiblevision.com';
    //const FV_DOMAIN = 'clouddeploy.api.flexiblevision.com'
    let AUTH_TOKEN = '';
    let auth = null;

    const request = require('request');
    var FormData = require('form-data');
    var cors = require('cors');
    const fs = require("fs");
    const http = require('http');

    let corsHandler = function (req, res, next) {
        next();
    }

    if (RED.settings.httpNodeCors) {
        corsHandler = cors(RED.settings.httpNodeCors);
        RED.httpNode.options("*", corsHandler);
    }

    function ServerConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.workstation = n.workstation;
        this.username = n.username;
        this.password = n.password;
        authenticate(n.host, n.username, n.password);
        initializeCameras(n.host);
    }

    function initializeCameras(host) {
        var path = 'http://' + host + ':5000/api/capture/camera/';

        console.log(path)
        request.get({
            "rejectUnauthorized": false,
            headers: {'content-type': 'application/json', 'Referer': path},
            url: path,
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                return;
            }
            const data = body;
            console.log(data)
        });
    }

    function authenticate(host, username, password) {
        const data = JSON.stringify({"username": username, "password": password})
        const options = {
            hostname: host,
            port: 5000,
            path: '/api/capture/auth/verify_account',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData)["id_token"]["token"];
                    auth = parsedData;
                } catch (e) {
                    console.error(e.message);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        // Write data to request body
        req.write(data);
        req.end();
    }

    function PredictUpload(n) {
        RED.nodes.createNode(this, n);
        var config = RED.nodes.getNode(n.fvconfig);
        var node = this;
        node.host = config.host;
        node.preset = n.preset;
        // node.model   = n.model;
        // node.version = n.version;
        node.ws = config.workstation;

        var authToken = authenticate(node.host, config.username, config.password);

        node.on('input', function (msg) {
            // if (!auth){
            //   return alert("Please login")
            // }
            // if (!node.model) {
            //   return alert("Select a model");
            // }

            var file = msg.filename;
            if (msg.file instanceof Buffer) {
                file = msg.file;
                console.log("as buffer ");
            } else if (typeof file == 'string') {
                console.log("from filepath ");
                file = fs.createReadStream(file);
                console.log("to stream ");
            }

            var form = new FormData();
            form.append('images', file);
            const preset = node.preset != null ? '&preset_id=' + node.preset : '';
            const did = msg.did != null ? '&did=' + msg.did : '';
            const path = 'api/capture/predict/upload/preset/preset' + '?workstation=' + node.ws + preset + did;
            const options = {
                hostname: node.host,
                port: 5000,
                path: path,
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + auth,
                    'Referer': 'http://' + node.host
                },
                timeout: 1500
            };

            form.submit(options, function (err, res) {
                if (err) {
                    console.error(err.statusMessage);
                } else {
                    res.resume();
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => {
                        rawData += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            node.send({
                                topic: 'predicted-upload',
                                payload: parsedData
                            });
                        } catch (e) {
                            //console.error('error');
                        }
                    });
                }
            });

        });
    }

    function PredictCamera(n) {
        RED.nodes.createNode(this, n);
        var config = RED.nodes.getNode(n.fvconfig);
        var node = this;

        node.host = config.host;
        node.preset = n.preset;


        // node.model   = n.model;
        // node.version = n.version;
        // node.camera  = n.camera;
        node.ws = config.workstation;
        // node.mask    = n.mask;


        // var idx_uid  = node.camera.split("#")
        // var cam_idx  = idx_uid[0]
        // var cam_uid  = idx_uid[1]

        authenticate(node.host, config.username, config.password);

        node.on('input', function (msg) {
            // if (!auth){
            //   return alert("Please login");
            // }
            // if (!node.model) {
            //   return alert("Select a model");
            // }
            // if (!node.version) {
            //   return alert("Select a version");
            // }
            // if (!node.camera) {
            //   return alert("Select a camera");
            // }

            // var mask = node.mask != 'false' ? '&mask_id='+node.mask : '';
            const preset = node.preset != null ? '&preset_id=' + node.preset : '';
            const did = msg.did != null ? '&did=' + msg.did : '';
            const path = 'api/capture/predict/snap/preset/preset/0' + '?workstation=' + node.ws + preset + did;
            const options = {
                hostname: node.host,
                port: 5000,
                path: path,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + auth,
                    'Referer': 'http://' + node.host
                },
                timeout: 1500
            };

            http.get(options, (res) => {
                const {statusCode} = res;
                const contentType = res.headers['content-type'];

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => {
                    rawData += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        node.send({
                            topic: 'camera-snap-predicted',
                            payload: parsedData
                        });
                    } catch (e) {
                        console.log(e);
                    }
                });
            }).on('error', (e) => {
                console.log(e);
            });

        });
    }

    // CLOUD FUNCTIONS ---------------------------
    function login_user(username, password) {
        // var path = 'https://v1.cloud.flexiblevision.com/';
        var path = 'https://' + FV_DOMAIN + '/api/capture/auth/node_login';
        const params = {
            username: username,
            password: password,
        }
        request.post({
            "rejectUnauthorized": false,
            headers: {'content-type': 'application/json'},
            url: path,
            json: params,
            timeout: 1500
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                return;
            }
            const data = body;
            AUTH_TOKEN = data.access_token;
            if (!error) {
                fs.writeFile('creds.txt', AUTH_TOKEN, (err) => {
                    console.log("Error: ", err)
                });
            }
        });
    }

    function get_token(username, password) {
        fs.readFile('creds.txt', function read(err, data) {
            if (err) {
                console.log(err);
                login_user(username, password);
                return;
            }

            const token = data.toString();
            const has_token = token.length > 20 ? true : false

            if (!has_token) login_user(username, password);
            if (has_token && isTokenExpired(token)) {
                login_user(username, password);
            } else {
                AUTH_TOKEN = token;
                return token;
            }
        });
    }

    function isTokenExpired(token) {
        if (token) {
            var hr_seconds = 3600;
            const token_header = token.split('.')[1];
            const decodedString = JSON.parse(Buffer.from(token_header, 'base64').toString('binary'));
            var token_expires = decodedString.exp - hr_seconds;
            var d = new Date();
            var t = d.getTime() / 1000;
            return t > token_expires;
        } else {
            return true;
        }
    }

    function CloudUpload(n) {
        AUTH_TOKEN = get_token(n.username, n.password);
        RED.nodes.createNode(this, n);
        var node = this;
        node.project = n.project;

        node.on('input', function (msg) {
            if (!AUTH_TOKEN) {
                return console.log("please login");
            }

            var file = msg.filename;

            if (msg.payload instanceof Buffer) {
                file = msg.payload;
                console.log("as buffer ");

            } else if (typeof file == 'string') {
                console.log("from filepath");
                file = fs.createReadStream(file);
                console.log("to stream ");
            }

            var form = new FormData();
            form.append('images', file);
            var data = {
                images: fs.createReadStream(msg.filename)
            };


            var auth = AUTH_TOKEN.trim();
            var headers = {'content-type': 'multipart/form-data', 'Authorization': 'Bearer ' + auth}
            request.post({
                method: 'POST',
                headers: headers,
                url: 'https://' + FV_DOMAIN + '/api/capture/predict/upload/' + node.project,
                formData: data
            }, function (error, response, body) {
                const parsedData = JSON.parse(body);
                if (!error) {
                    node.send({
                        topic: 'predicted-upload',
                        payload: parsedData
                    });
                } else {
                    console.log(error);
                }
            });
        });
    }

    // CLOUD FUNCTIONS ---------------------------

    RED.nodes.registerType("server-settings", ServerConfigNode);
    RED.nodes.registerType("onprem-snap", PredictCamera);
    RED.nodes.registerType("onprem-upload", PredictUpload);
    RED.nodes.registerType("cloud-upload", CloudUpload, {
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    });


    // VISION NODES

    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
    }

    function CameraLocationNode(n) {
        RED.nodes.createNode(this, n);
        // console.log("CameraLocationNode", n, this);
        this.host = n.camlocation;
        this.camlocation = n.camlocation;
    }

    function ReleaseCameraNode(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
        node.camlocation = n.camlocation;
        node.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            node.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            node.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            node.host = n.host;
        }
        node.camId = n.camId;

        const HandleFailures = function (msg) {
            msg.topic = 'cam-release-error';
            node.error(msg);
            node.send(msg);
            node.status({fill: "red", shape: "dot", text: "node-red:common.status.not-connected"});
        }

        const HandleResponse = function (msg) {
            msg.topic = 'cam-released';
            node.status({fill: "green", shape: "dot", text: "node-red:common.status.cam-released"});
            node.send(msg);
        }

        node.on('input', function (msg) {

            const url = node.host + '/api/vision/vision/release/' + node.camId;
            node.status({fill: "green", shape: "dot", text: url})

            const options = {method: 'GET', timeout: 15000, headers: {'Content-Type': 'application/json'}};
            options.url = url;
            node.debug(url);

            request(options, (error, response, body) => {
                console.log(error, body)
                if (!error) {
                    msg.payload = body;
                    return HandleResponse(msg);
                }
                msg.payload = error;
                msg.url = url;
                HandleFailures(msg);
            });


        });

    }

    function OpenCameraNode(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
        node.camlocation = n.camlocation;
        node.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            node.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            node.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            node.host = n.host;
        }
        node.camId = n.camId;

        const HandleFailures = function (msg) {
            msg.topic = 'cam-open-error';
            node.error(msg);
            node.send(msg);
            node.status({fill: "red", shape: "dot", text: "node-red:common.status.not-connected"});
        }

        const HandleResponse = function (msg) {
            msg.topic = 'cam-opened';
            node.status({fill: "green", shape: "dot", text: "node-red:common.status.cam-opened"});
            node.send(msg);
        }

        node.on('input', function (msg) {

            const url = node.host + '/api/vision/vision/open/' + node.camId;
            node.status({fill: "green", shape: "dot", text: url})

            const options = {method: 'GET', timeout: 15000, headers: {'Content-Type': 'application/json'}};
            options.url = url;
            node.debug(url);

            request(options, (error, response, body) => {
                console.log(error, body)
                if (!error) {
                    msg.payload = body;
                    return HandleResponse(msg);
                }
                msg.payload = error;
                msg.url = url;
                HandleFailures(msg);
            });


        });

    }

    function SetCameraConfig(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);

        node.camlocation = n.camlocation;
        node.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            node.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            node.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            node.host = n.host;
        }
        node.camId = n.camId;
        node.camProp = n.camProp;
        node.propVal = n.propVal;
        node.access_mode = n.access_mode;
        node.node_type = n.node_type;

        const HandleFailures = function (msg) {
            // TODO: use RED.settings.logging.console.level to control debug / error messages
            msg.topic = 'cam-config-error';
            node.error(msg);
            node.send(msg);
            node.status({fill: "red", shape: "dot", text: "node-red:common.status.not-connected"});
        }

        const HandleResponse = function (msg) {
            msg.topic = 'cam-config-set';
            node.status({fill: "green", shape: "dot", text: "node-red:common.status.config-set"});
            node.send(msg);
        }

        node.on('input', function (msg) {

            let url = node.host + '/api/vision/vision/';
            const options = {timeout: 15000, headers: {'Content-Type': 'application/json'}};
            if (node.access_mode && node.access_mode.toUpperCase() === 'READ ONLY') {
                options.method = 'GET';
                url += 'readConfig/' + node.camId + '/' + encodeURIComponent(node.camProp);
            } else {
                options.method = 'POST';
                url += 'setVal/' + node.camId;
                options.body = JSON.stringify({
                    node_name: node.camProp,
                    node_type: node.node_type,
                    value: node.propVal
                })
            }
            options.url = url;
            msg.url = url;

            node.debug(url);
            node.debug(JSON.stringify(options));

            node.status({fill: "yellow", shape: "dot", text: url})

            request(options, (error, response, body) => {
                console.log(error, body)
                if (!error) {
                    msg.payload = body;
                    return HandleResponse(msg);
                }
                msg.payload = error;
                msg.url = url;
                HandleFailures(msg);
            });
        });
    }

    function ImageManipulation(n) {
        RED.nodes.createNode(this, n);
        const node = this;

        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
        node.camlocation = n.camlocation;
        node.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            node.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            node.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            node.host = n.host;
        }
        node.efx_name = n.efx_name;
        node.efx_value = n.efx_value;

        node.on('input', function (msg) {

            const obj = {
                base64: msg.payload,
                efx_value: JSON.parse(node.efx_value),
                efx_name: node.efx_name
            };
            if (msg.efx_value && typeof msg.efx_value === 'object') {
                for (let param in msg.efx_value) {
                    if (msg.efx_value[param] !== '' && msg.efx_value[param] !== null) {
                        obj.efx_value[param] = msg.efx_value[param];
                    }
                }
            }

            // WARN: change hardcoded test api
            let url = 'http://localhost:5123/api/dev/test/image_manipulation';
            const options = {timeout: 15000, headers: {'Content-Type': 'application/json'}};
            options.method = 'POST';
            options.body = JSON.stringify(obj);
            options.url = url;

            node.status({fill: "yellow", shape: "dot", text: 'processing ' + node.efx_name})

            request(options, (error, response, body) => {
                if (!error && body) {
                    try {
                        let bodyjson = JSON.parse(body);
                        if (typeof bodyjson['error'] === 'string') {
                            msg.topic = 'image manipulation error';
                            msg.payload = HOURGLASS
                            node.status({fill: "red", shape: "dot", text: bodyjson['error']});
                            return node.send(msg);
                        }
                        if (typeof bodyjson["b64"] === "string") {
                            msg.topic = 'image manipulation returned';
                            msg.payload = bodyjson['b64']
                            node.status({fill: "green", shape: "dot"});
                            return node.send(msg);
                        }
                    } catch (err) {
                        msg.payload = HOURGLASS;
                        msg.topic = 'invalid json';
                        node.status({fill: "red", shape: "dot", text: "invalid json: " + body});
                        return node.send(msg);
                    }
                }
                console.error("image manipulation failed", error.message)
                msg.payload = HOURGLASS;
                msg.topic = 'image manipulation failed';
                node.status({fill: "red", shape: "dot", text: error.message});
                return node.send(msg);
            });
        });
    }

    function MotionDetection(n) {
        RED.nodes.createNode(this, n);

        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
        this.camlocation = n.camlocation;
        this.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            this.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            this.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            this.host = n.host;
        }
        this.camId = n.camId;
        this.mask = n.mask;
        this.threshold = parseInt(n.threshold) || 50;
        this.debounce = parseInt(n.debounce) || 250;

        const node = this;

        node.on('input', function (msg) {
            let lastRun = this.context().flow.get("last_motion_check"), now = new Date().getTime()
            if (lastRun && lastRun > now - n.debounce - 50) {
                node.debug("ANTI SPAM: " + now);
                msg.topic = 'wait until ' + new Date(now + n.debounce).toString();
                msg.payload = HOURGLASS;
                node.status({fill: "pink", shape: "dot", text: "wait"});
                return node.send([null, msg]);
            }

            this.context().flow.set("last_motion_check", now);

            var fvconfig = RED.nodes.getNode(n.fvconfig);
            let url = 'http://localhost:5123/api/dev/test/detect_motion'; // WARN: change to config.host + '/api/detect_motion'
            const options = {timeout: 15000, headers: {'Content-Type': 'application/json'}};
            options.method = 'POST';
            options.body = JSON.stringify({
                camId: n.camId,
                mask: n.mask,
                threshold: n.threshold,
                debounce: n.debounce,
                camhost: node.host,
                fvhost: fvconfig.host
            })
            options.url = url;

            node.status({fill: "blue", text: n.camId + ' expects > ' + n.threshold})

            request(options, (error, response, body) => {

                if (!error) {
                    let bodyjson = null;
                    try {
                        bodyjson = JSON.parse(body);
                    } catch (e) {
                        return node.debug(e)
                    }
                    if (!bodyjson['b64']) {
                        msg.topic = 'bad response';
                        msg.payload = HOURGLASS;
                        node.status({fill: "red", shape: "dot", text: "bad response"});
                        return node.send([null, msg]);
                    }

                    if (bodyjson.score < n.threshold) {
                        msg.topic = 'motion detected';
                        msg.payload = bodyjson['b64']
                        node.status({
                            fill: "green",
                            text: `${bodyjson.score.toFixed(2)}% similar`
                        });
                        return node.send([msg, null]);
                    } else {
                        msg.topic = 'no motion';
                        msg.payload = bodyjson['b64']
                        node.status({
                            fill: "yellow",
                            text: `${bodyjson.score.toFixed(2)}% similar`
                        });
                        return node.send([null, msg]);
                    }
                }
                node.debug(body);
                msg.topic = 'no motion failed';
                msg.payload = HOURGLASS;
                node.status({fill: "red", shape: "dot", text: "error / timeout"});
                return node.send([null, msg]);
            });


        });
    }

    function PinStateGet(n) {
        RED.nodes.createNode(this, n);

        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
        this.camlocation = n.camlocation;
        this.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            this.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            this.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            this.host = n.host;
        }
        this.camId = n.camId;
        this.pin = n.pin;
        this.state = parseInt(n.state) || 50;
        const node = this;

        node.on('input', function (msg) {

            let url = 'http://192.168.196.2:5000/api/capture/io/cur_pins_state';
            const options = {'url': url, method: 'GET', timeout: 15000, headers: {'Content-Type': 'application/json'}};
            node.status({fill: "blue", text: 'checking ' + n.pin})

            request(options, (error, response, body) => {
                node.debug(body);
                const pins = JSON.parse(body);

                if (error) {
                    // msg.topic = 'setting pin failed ' + error;
                    node.status({fill: "red", shape: "dot", text: "error / timeout"});
                    msg.payload = {pin: this.pin, state: false}
                } else {
                    node.status({fill: "blue", text: pins[n.pin] ? 'enabled' : 'disabled'})
                    msg.payload = {pin: n.pin, state: pins[n.pin]};
                }

                return node.send(msg);
            });


        });

    }

    function PinStateSet(n) {
        RED.nodes.createNode(this, n);

        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
        this.camlocation = n.camlocation;
        this.host = n.host;
        if (hostConfig && hostConfig.camlocation && hostConfig.camlocation.indexOf('http') > -1) {
            this.host = hostConfig.camlocation
        } else if (n.camlocation && n.camlocation.indexOf('http') > -1) {
            this.host = n.camlocation
        } else if (n.host && n.host.indexOf('http') > -1) {
            this.host = n.host;
        }
        this.camId = n.camId;
        this.pin = n.pin;
        this.state = parseInt(n.state) || 50;

        const node = this;

        node.on('input', function (msg) {


            let url = 'http://172.17.0.1:5001/set_pin';
            // let url = 'http://192.168.196.2:5000/api/capture/io/toggle_pin';
            const options = {"url": url, method: "PUT", timeout: 15000, headers: {'Content-Type': 'application/json'}};
            options.body = JSON.stringify({
                pin_num: n.pin,
                state: n.state
            })
            node.status({fill: "blue", text: 'set ' + n.pin})

            request(options, (error, response, body) => {
                node.debug(body);
                msg.payload = body;

                if (error) {
                    msg.topic = 'setting pin failed ' + error;
                    node.status({fill: "red", shape: "dot", text: "error / timeout"});
                }
                return node.send(msg);
            });

        });
    }


    RED.nodes.registerType('pin-state-get', PinStateGet);
    RED.nodes.registerType('pin-state-set', PinStateSet);
    RED.nodes.registerType('motion-detection', MotionDetection);
    RED.nodes.registerType('image-manipulation', ImageManipulation);
    RED.nodes.registerType("remote-server", RemoteServerNode);
    RED.nodes.registerType("camera-server", CameraLocationNode);
    RED.nodes.registerType("set-camera-property", SetCameraConfig);
    RED.nodes.registerType("release-camera", ReleaseCameraNode);
    RED.nodes.registerType("open-camera", OpenCameraNode);

}
