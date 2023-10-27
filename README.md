

#### 
Currently, Image Manipulation and Motion Detect will only work against the dev API at "http://localhost:5123". Run it with https://github.com/eliataylor/fa-onprem-api/tree/master



## Docker Environment
- `docker build -t ${whoami}/nodecreator .`
- `docker stop nodecreator && docker rm nodecreator`
- `docker run --name nodecreator -p 1881:1881 -d ${whoami}/nodecreator`
- CLI: `sudo docker exec -it nodecreator /bin/bash`


## Teamviewer Dev Env
- `git pull origin master && sudo docker stop fvonprem_nodes && sudo docker rm fvonprem_nodes && sudo docker build -t visioncell/nodecreator . && sudo docker run --name fvonprem_nodes -p 1880:1880 -d visioncell/nodecreator`

- `sudo docker build -t visioncell/nodecreator .`
- `sudo docker stop fvonprem_nodes && sudo docker rm fvonprem_nodes`
- `sudo docker run --name fvonprem_nodes -p 1881:1881 -d visioncell/nodecreator`
- `sudo docker exec -it fvonprem_nodes /bin/bash`

## Local Dev Environment
- in settings.js edit `editorTheme.theme` can be any [theme](https://github.com/node-red-contrib-themes/theme-collection), currently dark, dracula, midnight-red, oled, solarized-dark, solarized-light  
- `npm start`

#### Notes

#### Detected Access Modes: "Example"

- Not Implemented: "Event Test Data"
- Not available: "User Set Save"
- Read Only: "Pixel Correction Y"
- Read and Write: "Test Pending Ack"
- Write Only: "Event Test Control"

#### Detected Field Types: "Example" 
- Bool: "Chunk Enable"
- Command: "Event Test Control"
- Enumerate: "Chunk Selector"
- Float: "Balance Ratio"
- Integer: "Test Pending Ack"
- String: "Device User ID"
- null: "Event Test Data"




zerotier uses port 1880
