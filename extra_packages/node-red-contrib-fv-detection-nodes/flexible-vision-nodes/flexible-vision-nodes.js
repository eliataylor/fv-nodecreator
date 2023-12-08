module.exports = function (RED) {
    "use strict";

    const HOURGLASS = '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VfOKSSnsP1zwo/8ABElx6SSn/9k4QklNBCEAAAAAAFcAAAABAQAAAA8AQQBkAG8AYgBlACAAUABoAG8AdABvAHMAaABvAHAAAAAUAEEAZABvAGIAZQAgAFAAaABvAHQAbwBzAGgAbwBwACAAMgAwADIAMAAAAAEAOEJJTQQGAAAAAAAHAAEBAQABAQD/4RE9aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA2LjAtYzAwMiA3OS4xNjQ0NjAsIDIwMjAvMDUvMTItMTY6MDQ6MTcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6R2V0dHlJbWFnZXNHSUZUPSJodHRwOi8veG1wLmdldHR5aW1hZ2VzLmNvbS9naWZ0LzEuMC8iIHhtbG5zOnhtcFJpZ2h0cz0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3JpZ2h0cy8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGx1cz0iaHR0cDovL25zLnVzZXBsdXMub3JnL2xkZi94bXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgcGhvdG9zaG9wOkNyZWRpdD0iR2V0dHkgSW1hZ2VzL2lTdG9ja3Bob3RvIiBwaG90b3Nob3A6TGVnYWN5SVBUQ0RpZ2VzdD0iQjhCNUEzREIzODdGQTJFMUQ3NjhGMzdFOTI4NDQ0REYiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjEiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSIiIEdldHR5SW1hZ2VzR0lGVDpBc3NldElEPSIxMzk5NTg4ODcyIiB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgeG1wTU06RG9jdW1lbnRJRD0iMUJGQzQ1NDE1Q0M0NDVDMUU5RTYyMkUyOTI0RkI5OEQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M2M5MGMwYjktZjE1Ni00MTk4LThhMDItMmM0NDBlMzRhMjE5IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9IjFCRkM0NTQxNUNDNDQ1QzFFOUU2MjJFMjkyNEZCOThEIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMi0wMVQyMjozODo0NS0xMDowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTItMDFUMjI6NDA6NTgtMTA6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMTItMDFUMjI6NDA6NTgtMTA6MDAiPiA8ZGM6Y3JlYXRvcj4gPHJkZjpTZXE+IDxyZGY6bGk+SXZhbiBaYWthbGV2eWNoPC9yZGY6bGk+IDwvcmRmOlNlcT4gPC9kYzpjcmVhdG9yPiA8ZGM6ZGVzY3JpcHRpb24+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPkNvcnJ1cHRlZCBwaXhlbCBmaWxlIGljb24uIERhbWFnZSBkb2N1bWVudCBpbGx1c3RyYXRpb24gc3ltYm9sLiBTaWduIGJyb2tlbiBkYXRhIHZlY3Rvci48L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOmRlc2NyaXB0aW9uPiA8cGx1czpMaWNlbnNvcj4gPHJkZjpTZXE+IDxyZGY6bGkgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMzk5NTg4ODcyLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPiA8L3JkZjpTZXE+IDwvcGx1czpMaWNlbnNvcj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Y2RiZWFmYjYtZTM2MS00YzQzLTgxZWMtYWRmM2Q2ODhhOTZlIiBzdEV2dDp3aGVuPSIyMDIzLTEyLTAxVDIyOjQwOjQwLTEwOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6M2M5MGMwYjktZjE1Ni00MTk4LThhMDItMmM0NDBlMzRhMjE5IiBzdEV2dDp3aGVuPSIyMDIzLTEyLTAxVDIyOjQwOjU4LTEwOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/uACFBZG9iZQBkgAAAAAADABADAAECAAAAAAAAAAAAAAAA/9sAQwAMCAgICQgMCQkMEQsKCxEVDwwMDxUYExMVExMYEQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8IACwgAWABGAQERAP/EAHkAAAIDAQEAAAAAAAAAAAAAAAAHBAUGAwIQAAAFAwQDAQEAAAAAAAAAAAADBAUGAjYHATUWFxAgFTQlEQABAwICBAkJBQkAAAAAAAACAQMEABIiBRARE3QyQlJyspPTFDQgITEzs8OUtORiIyQVNUFxsZJTc0SEBv/aAAgBAQEAAAClkBHvmX2E05QTjHye9lppygnG/UYloppypxxpzf8AuvXVi5cZs8fVnDI2jlACCkrZymXiX1rBSVs5cjXzKJi80lbOXl698esJJWzlACCki0ADxG//2gAIAQEAAQUALlMxOO+xkIfYyEPsZCB0omKeuJvUr5AmWo1enjHt6ecnXXJGhS9xhmNLxuGpyJdW0Y9vTzk660355DEGmQmlS90ZpCMe3oFShT2KMm6a6ywmfRCgnsCHB2l8JUN7UoWatePb0BuOaTJGJLj2l+d+oaB1DQF+K6EaFpr/AJmPb09n3ZGnaMe3p4dshsbS49rRoR6RIJCkD7sjTtGPb0GQJW4xyhpiTVL2/qqMh+dT8eKGtTWrbX3ZGnaMe3oD0qZQCiiiaAciRqKqaaaKX3ZGnaMe3p7PuyNO0I6npvWcqng5VPByqeDlU8HKp4OVTwHSWcHlNSJXo3//2gAIAQEBBj8AVpjMpbziqVrbaCZKiLxQBpSw167MupXsK9dmXUr2FeuzLqV7ClbkZjLYcRNag6ggSIvoWw2hKoq5zJlhltrivHKDZs8Atle8bbYD95bZjolivtvoC6jVoxPUq8qxSt0xebJ6BeRI3Zn3lO5ZHIBekA1qJ3XZhJt1b7UIuJT0bOR7weZkjrKwkuRBaRGz2u22GK5zBUfMWBIGZQI4AmiISIvKQVLRF5sjoF5EjdmfeU1zB/hTDuYK8hRxIW9kdiajUVK7zLyKa/5aETH5fEltQWkcFSdVtVbDE5eNzuP+noi82R0C0EG3dQEzUEsRw7dV4YbLrLdD6J6VjM+8psSzJtFEURUtc9KJ/br9Tb/lc7OpgsS2ClOsuI0SNkhq4oELdrmz4d/HrOkWQ8pjCat1umqoXeoqYceGovNkdAtC57+YkirLGX3fZJqwqJbLabT7PDt0Hma5gUZTbBvZI0h6rLsV6uDwrq/Vj6ge1r9WPqB7WpEv80M+7tG7ZsRS6wVO27aca2s7PV/hMlq/2oq1F5sjoF5eYbq97M6zvcGfmotRebI6BaXstlNySfjqKGrbaEOIRcS0lcHilXqZnVD2tOS4Iug204rRI8KCtyIJ+ZBI8OPRmG6vezOs73Bn5qLUXmyOgWiAUHY/ijcFzboq+YEAhstNvlUz/wBJmhujOzAbnkjHY1rbVY47NshctwNDx69ZL61OzocpyMmyjyWlmGszW4e0VVZwkBM/d2MjhqJKc1bR9ht07fRrMBMrfs4qzDdXvZnWd7gz81FqLzZHQLQPeGget4N4oWrXybkpG2gFtseCAogon7hHQhPsNukiakIwEl1cnElIIogiKakRPMiIn7ErMN1e9mdZ3uDPzUWovNkdAvLzDdXvZnWd7gz81FrvkFmSxJbU0B0WDVUQtYlw2iHENeImfDfT14iZ8N9PXiJnw309eImfDfT14iZ8N9PXiJnw309Gw89MNp0VBwVjekSS0h80fk1nQLFfRChtCIq04mv8VFwjgxYa/9k='

    const FV_DOMAIN = 'v1.cloud.flexiblevision.com';
    //const FV_DOMAIN = 'clouddeploy.api.flexiblevision.com'
    let AUTH_TOKEN = '';
    let auth = null;

    const request = require('request');
    var FormData = require('form-data');
    var cors = require('cors');
    const fs = require("fs");
    const http = require('http');

    function getExtensionFromBase64(base64String) {
        // Extract the first few characters of the Base64 string to identify the magic number
        const magicNumber = base64String.substring(0, 20);

        // Define magic numbers and their corresponding file extensions
        const magicNumbers = {
            '/9j/': 'jpg',
            'iVBORw': 'png',
            'R0lGOD': 'gif',
            'UklGRg': 'webp',
            'AAAAI': 'ico',
            'PHN2Zy': 'svg+xml',
            // Add more as needed...
        };

        // Check for a match and return the corresponding file extension
        for (const [magic, ext] of Object.entries(magicNumbers)) {
            if (magicNumber.startsWith(magic)) {
                return `.${ext}`;
            }
        }

        // If no match is found, return a default extension (you may adjust this)
        return '.bin';
    }

    function isBase64(str) {
        try {
            const decoded = Buffer.from(str, 'base64').toString('utf-8');
            const reencoded = Buffer.from(decoded, 'utf-8').toString('base64');
            return reencoded === str;
        } catch (error) {
            return false;
        }
    }

    function ipToUri(ip, basepath) { // make sure this matches the same function in flexible-vision-nodes.html
        if (basepath.indexOf('/detect_motion') > -1 || basepath.indexOf('/image_manipulation') > -1) {
            return "http://" + ip + ":5123" + basepath;
            // return "http://127.0.0.1:5123" + basepath;
        } else if (basepath.indexOf('/api/visiontools/') === 0) {
            return "http://" + ip + ":5021" + basepath;
        } else if (basepath.indexOf('/api/vision/') === 0) {
            return "http://" + ip + ":5555" + basepath;
        } else if (basepath.indexOf('/api/capture/') === 0) {
            return "http://" + ip + ":5000" + basepath;
        } else if (basepath.indexOf('/set_pin') === 0) {
            return "http://" + ip + ":5001/set_pin"
        } else {
            return "http://" + ip + ":5555"
        }
    }

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
        // authenticate(n.host, n.username, n.password);
        // initializeCameras(n.host);
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

        node.on('input', function (msg) {

            let file = null;
            if (typeof msg.file !== 'undefined' && msg.file instanceof Buffer) {
                file = msg.file;
                console.log("as buffer ");
            } else {
                if (typeof msg.filename === 'string' && fs.existsSync(msg.filename)) {
                    file = fs.createReadStream(msg.filename);
                    console.log("from filepath to stream ");
                } else {
                    const buffer = Buffer.from(msg.payload, 'base64');
                    const filename = `tmpfile${getExtensionFromBase64(msg.payload)}`;
                    fs.writeFileSync(filename, buffer);
                    fs.writeFileSync(`tmpfile.txt`, msg.payload);
                    console.log('File Created:', filename);
                    file = fs.createReadStream(filename)

                }
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
                            console.error('error', e);
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

    function ReleaseCameraNode(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        const fvconfig = RED.nodes.getNode(n.fvconfig);
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

            const url = ipToUri(fvconfig.host, '/api/vision/vision/release/' + node.camId)
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
        const fvconfig = RED.nodes.getNode(n.fvconfig);
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

            const url = ipToUri(fvconfig.host, '/api/vision/vision/open/' + node.camId);
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
        const fvconfig = RED.nodes.getNode(n.fvconfig);
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

            let url = '/api/vision/vision/';
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
            options.url = ipToUri(fvconfig.host, url);
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

        const fvconfig = RED.nodes.getNode(n.fvconfig);
        node.efx_name = n.efx_name;
        node.efx_value = n.efx_value;

        node.on('input', function (msg) {

            function handleError(topic, err, payload) {
                msg.topic = topic;
                msg.payload = payload
                node.status({fill: "red", shape: "dot", text: err});
                return node.send(msg);
            }

            if (node.efx_name === 'remove_bgr') {
                let url = ipToUri(fvconfig.host, '/api/visiontools/remove_bgr');
                node.debug('requesting ' + url);
                console.log('requesting ' + url);
                const options = {timeout: 15000, headers: {'Content-Type': 'application/json'}};
                options.method = 'POST';
                options.body = JSON.stringify({img_b64: msg.payload});
                options.url = url;

                node.status({fill: "yellow", shape: "dot", text: 'processing ' + node.efx_name})

                request(options, (error, response, body) => {
                    node.debug(body)
                    if (!error && body) {
                        msg.topic = 'remove_bgr returned';
                        msg.payload = body
                        node.status({fill: "green", shape: "dot"});
                        return node.send(msg);
                    }
                    return handleError('remove_bgr failed', error.message, HOURGLASS)
                });
            } else {

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

                let url = ipToUri(fvconfig.host, '/api/dev/test/image_manipulation');
                const options = {timeout: 15000, headers: {'Content-Type': 'application/json'}};
                options.method = 'POST';
                options.body = JSON.stringify(obj);
                options.url = url;

                node.status({fill: "yellow", shape: "dot", text: 'processing ' + node.efx_name})

                request(options, (error, response, body) => {
                    if (!error && body) {
                        if (body.indexOf('404 Not Found') > -1) {
                            return handleError('Image Manipulation API error', 'API missing endpoint', HOURGLASS)
                        }
                        try {
                            let bodyjson = JSON.parse(body);
                            if (typeof bodyjson['error'] === 'string') {
                                return handleError('image manipulation error', bodyjson['error'], HOURGLASS)
                            }
                            if (typeof bodyjson["b64"] === "string") {
                                msg.topic = 'image manipulation returned';
                                msg.payload = bodyjson['b64']
                                node.status({fill: "green", shape: "dot"});
                                return node.send(msg);
                            }
                        } catch (err) {
                            return handleError('image manipulation json error', "invalid json: " + body, HOURGLASS)
                        }
                    }
                    return handleError('image manipulation failed', error.message, HOURGLASS);
                });
            }


        });
    }

    function MotionDetection(n) {
        RED.nodes.createNode(this, n);

        const fvconfig = RED.nodes.getNode(n.fvconfig);
        this.camId = n.camId;
        this.mask = n.mask;
        this.threshold = parseInt(n.threshold) || 50;
        this.debounce = parseInt(n.debounce) || -500;

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

            let url = ipToUri(fvconfig.host, '/api/dev/test/detect_motion');
            const options = {
                timeout: 100000000,
                method: "POST",
                url: url,
                headers: {'Content-Type': 'application/json'}
            };
            options.body = JSON.stringify({
                camId: n.camId,
                mask: n.mask,
                threshold: n.threshold,
                debounce: n.debounce,
                ip: fvconfig.host
            })

            node.status({fill: "blue", text: n.camId + ' expects > ' + n.threshold})

            request(options, (error, response, body) => {
                if (!error && body) {
                    let bodyjson = false, err = 'bad response';
                    if (response.statusCode !== 200) {
                        err = 'Error code ' + response.statusCode + ' ' + JSON.stringify(response);
                    } else {
                        try {
                            bodyjson = JSON.parse(body);
                        } catch (e) {
                            err = e.message;
                            if (body.indexOf('404 Not Found') > -1) {
                                err = 'API Missing endpoint';
                            }
                        }
                    }

                    if (!bodyjson || typeof bodyjson['b64'] !== 'string') {
                        msg.topic = err;
                        msg.payload = HOURGLASS;
                        node.status({fill: "red", shape: "dot", text: err});
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

        const fvconfig = RED.nodes.getNode(n.fvconfig);
        this.camId = n.camId;
        this.pin = n.pin;
        this.state = parseInt(n.state) || 50;
        const node = this;

        node.on('input', function (msg) {

            let url = ipToUri(fvconfig.host, '/api/capture/io/cur_pins_state');
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

        const fvconfig = RED.nodes.getNode(n.fvconfig);
        this.camId = n.camId;
        this.pin = n.pin;
        this.state = parseInt(n.state) || 50;

        const node = this;

        node.on('input', function (msg) {

            let url = ipToUri(fvconfig.host, '/set_pin');
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

    function UpdateInference(n) {
        RED.nodes.createNode(this, n);

        const fvconfig = RED.nodes.getNode(n.fvconfig);
        this.inferenceobj = n.inferenceobj;

        const node = this;

        node.on('input', function (msg) {

            let url = ipToUri(fvconfig.host, '/api/capture/predict/update_inference');
            const options = {"url": url, method: "PUT", timeout: 15000, headers: {'Content-Type': 'application/json'}};
            try {
                options.body = JSON.stringify(msg.payload)
                node.status({fill: "blue", text: 'updating  ' + n.inferenceobj})
                request(options, (error, response, body) => {
                    node.debug(body);
                    msg.payload = body;

                    if (error) {
                        msg.topic = 'error updating inference ' + error;
                        node.status({fill: "red", shape: "dot", text: "error / timeout"});
                    }
                    return node.send(msg);
                });
            } catch (e) {
                node.status({fill: "red", text: 'invalid json payload'})
                return node.send(null);
            }

        });
    }

    function GetCamImage(n) {
        RED.nodes.createNode(this, n);
        const node = this;

        const fvconfig = RED.nodes.getNode(n.fvconfig);
        node.camId = n.camId;

        node.on('input', function (msg) {

            function handleError(topic, err, payload) {
                msg.topic = topic;
                msg.payload = payload
                node.status({fill: "red", shape: "dot", text: err});
                return node.send(msg);
            }

            let url = ipToUri(fvconfig.host, '/api/vision/vision/b64Frame/' + node.camId);
            const options = {"url": url, method: "GET", timeout: 15000, headers: {'Content-Type': 'application/json'}};
            node.status({fill: "blue", text: 'loading frame'})
            request(options, (error, response, body) => {
                if (error) {
                    return handleError('get frame error', "invalid json: " + body, HOURGLASS)
                } else {
                    try {
                        let bodyjson = JSON.parse(body);
                        if (typeof bodyjson['error'] === 'string') {
                            return handleError('get frame error', bodyjson['error'], HOURGLASS)
                        }
                        if (typeof bodyjson["b64"] === "string") {
                            msg.topic = 'got image';
                            msg.payload = bodyjson['b64']
                            node.status({fill: "green", shape: "dot"});
                            return node.send(msg);
                        }
                    } catch (err) {
                        return handleError('get frame json error', "invalid json: " + body, HOURGLASS)
                    }
                }
            });
        });
    }

    RED.nodes.registerType('update-inference', UpdateInference);
    RED.nodes.registerType('get-cam-image', GetCamImage);
    RED.nodes.registerType('pin-state-get', PinStateGet);
    RED.nodes.registerType('pin-state-set', PinStateSet);
    RED.nodes.registerType('motion-detection', MotionDetection);
    RED.nodes.registerType('image-manipulation', ImageManipulation);
    RED.nodes.registerType("set-camera-property", SetCameraConfig);
    RED.nodes.registerType("release-camera", ReleaseCameraNode);
    RED.nodes.registerType("open-camera", OpenCameraNode);

}
