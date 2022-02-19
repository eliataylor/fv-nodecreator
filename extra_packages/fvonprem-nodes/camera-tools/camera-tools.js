module.exports = function (RED) {
    "use strict";

    // const fs = require("fs");
    const http = require('http');
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
        var node = this;
        const hostConfig = RED.nodes.getNode(n.camlocation || n.host);
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
        // console.log("SetCameraConfig1", node);

        const HandleFailures = function (msg) {
            // TODO: use RED.settings.logging.console.level to control debug / error messages
            node.error(msg);
            console.error(msg);
            node.status({fill:"red",shape:"dot",text:"node-red:common.status.not-connected"});
        }

        const HandleReponse = function(data) {
            node.send({
                topic: 'cam-config-set',
                payload: data
            });
        }

        node.on('input', function (msg) {
            console.log("HANDLE MSG", msg);
            node.status({fill:"red",shape:"dot",text:msg})
            node.debug(node)
            const url = node.host + '/vision/configureCamera/' + node.camId + '/' + encodeURIComponent(node.camProp) + '/' + encodeURIComponent(node.propVal);
            console.log("POST Image to " + url);
            node.status({fill:"red",shape:"dot",text:url})

            const options = {method: "POST", url: url, dataType: "json"};

            http.get(options, HandleReponse, HandleFailures).on('error', (e) => {
                console.error(`http error: ${e.message}`);
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
