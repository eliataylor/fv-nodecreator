module.exports = function (RED) {
    "use strict";

    const request = require('request');
    const cors = require('cors');

    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
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
            node.status({fill:"red",shape:"dot",text:"node-red:common.status.not-connected"});
        }

        const HandleResponse = function(msg) {
            msg.topic = 'cam-released';
            node.status({fill:"green",shape:"dot",text:"node-red:common.status.cam-released"});
            node.send(msg);
        }

        node.on('input', function (msg) {

            const url = node.host + '/api/vision/vision/release/' + node.camId;
            node.status({fill:"green",shape:"dot",text:url})

            const options = {method: 'GET', timeout:15000, headers: {'Content-Type': 'application/json'}};
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

        const getContext = function(p) {
            return {
                camlocation: p.camlocation,
                host: p.host,
                camId: p.camId,
                camProp: p.camProp,
                propVal: p.propVal,
                camProperty: p.camProperty,
                access_mode: p.access_mode,
                node_type: p.node_type,
            };
        }

        // console.log("SetCameraConfig1", getContext(n));

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

        // console.log("SetCameraConfig2", getContext(node));

        const HandleFailures = function (msg) {
            // TODO: use RED.settings.logging.console.level to control debug / error messages
            msg.topic = 'cam-config-error';
            node.error(msg);
            node.send(msg);
            node.status({fill:"red",shape:"dot",text:"node-red:common.status.not-connected"});
        }

        const HandleResponse = function(msg) {
            msg.topic = 'cam-config-set';
            node.status({fill:"green",shape:"dot",text:"node-red:common.status.config-set"});
            node.send(msg);
        }

        node.on('input', function (msg) {
            node.debug(JSON.stringify(getContext(node)))

            let url = node.host + '/api/vision/vision/';
            const options = {timeout:15000, headers: {'Content-Type': 'application/json'}};
            if (node.access_mode && node.access_mode.toUpperCase() === 'READ ONLY') {
                options.method = 'GET';
                url += 'readConfig/' + node.camId + '/' + encodeURIComponent(node.camProp);
            } else {
                options.method = 'POST';
                url += 'setVal/' + node.camId;
                options.body = JSON.stringify({
                    node_name:node.camProp,
                    node_type:node.node_type,
                    value:node.propVal
                })
            }
            options.url = url;
            msg.url = url;

            node.debug(url);
            node.debug(JSON.stringify(options));

            node.status({fill:"yellow",shape:"dot",text:url})

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


    let corsHandler = function (req, res, next) {
        next();
    }
    if (RED.settings.httpNodeCors) {
        corsHandler = cors(RED.settings.httpNodeCors);
        RED.httpNode.options("*", corsHandler);
    }

    RED.nodes.registerType("remote-server",RemoteServerNode);
    RED.nodes.registerType("camera-server", CameraLocationNode);
    RED.nodes.registerType("set-camera-property", SetCameraConfig);
    RED.nodes.registerType("release-camera", ReleaseCameraNode);

}
