const cors = require("cors");
module.exports = function (RED) {
    "use strict";

    const request = require('request');
    const cors = require('cors');

    function MotionDetection(n) {
        RED.nodes.createNode(this, n);
        this.threshold = n.threshold;
        var node = this;

        const HandleFailures = function (msg) {
            // TODO: use RED.settings.logging.console.level to control debug / error messages
            msg.topic = 'nomotion';
            node.error(msg);
            node.send(msg);
            node.status({fill:"red",shape:"dot",text:"error"});
        }

        const HandleResponse = (msg) => {
            msg.topic = 'motion detected';
            node.status({fill:(msg.payload.diff > this.threshold) ? "green" : 'yellow', shape:"dot",text:msg.payload.diff + '%'});
            node.send(msg);
        }

        // Function to handle incoming messages
        node.on('input', function(msg) {

            let url = 'http://localhost:5123/api/dev/test/detect_motion';
            const options = {timeout:15000, headers: {'Content-Type': 'application/json'}};
            options.method = 'POST';
            options.body = JSON.stringify({
                threshold:node.threshold,
                camId:'test',
                mask:[0,0,100,100]
            })
            options.url = url;

            node.debug(JSON.stringify(options));

            node.status({fill:"yellow",shape:"dot",text:node.threshold + '%'})
            node.threshold = node.threshold

            request(options, (error, response, body) => {
                if (!error) {
                    msg.payload = JSON.parse(body);
                    return HandleResponse(msg);
                }
                console.log("FAILED")
                msg.payload = error;
                return HandleFailures(msg);
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


    // Register the node with Node-RED
    RED.nodes.registerType('motion-detection', MotionDetection);
};
