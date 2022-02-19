module.exports = function (RED) {
    "use strict";

    // const fs = require("fs");
    const http = require('http');
    // const fetch = require('fetch');
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
                camProperty: p.camProperty
            };
        }

        console.log("SetCameraConfig1", getContext(n));

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

        console.log("SetCameraConfig2", getContext(node));

        const HandleFailures = function (msg, url) {
            // TODO: use RED.settings.logging.console.level to control debug / error messages
            node.error(msg);
            console.error(msg);
            node.send({
                topic: 'cam-config-error',
                payload: {
                    msg:msg,
                    url:url
                }
            });
            node.status({fill:"red",shape:"dot",text:"node-red:common.status.not-connected"});
        }

        const HandleResponse = function(data, url) {
            node.send({
                topic: 'cam-config-set',
                payload: {
                    data:data,
                    url:url
                }
            });
        }

        node.on('input', function (msg) {
            console.log(getContext(node))

            const url = node.host + '/api/vision/vision/configureCamera/' + node.camId + '/' + encodeURIComponent(node.camProp) + '/' + encodeURIComponent(node.propVal);
            console.log("POST to " + url);
            node.status({fill:"green",shape:"dot",text:url})

            const options = {method: 'POST', timeout:2000, headers: {'Content-Type': 'application/json'}};

            const req = http.request(url, options, (res) => {
                console.log(`STATUS: ${res.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                let data = ''
                res.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                    data += chunk;
                });
            });
            req.setTimeout(15000, (e) => {
                HandleFailures('timeout', url);
            });
            req.on('error', (e) => {
                HandleFailures(e.message, url);
            });
            req.end(data => {
                HandleResponse(data, url);
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

}
