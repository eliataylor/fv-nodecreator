## Eli's Localhost
- `docker build -t ${whoami}/nodecreator .`
- `docker stop nodecreator && docker rm nodecreator`
- `docker run --name nodecreator -p 1881:1881 -d ${whoami}/nodecreator`
- `sudo docker exec -it nodecreator /bin/bash`


## Teamviewer Dev Env
- `git pull origin master && sudo docker stop fvonpremn_nodes && sudo docker rm fvonpremn_nodes && sudo docker build -t visioncell/nodecreator . && sudo docker run --name fvonpremn_nodes -p 1881:1881 -d visioncell/nodecreator`

- `sudo docker build -t visioncell/nodecreator .`
- `sudo docker stop fvonpremn_nodes && sudo docker rm fvonpremn_nodes`
- `sudo docker run --name fvonpremn_nodes -p 1881:1881 -d visioncell/nodecreator`
- `sudo docker exec -it fvonpremn_nodes /bin/bash`


## Testing Environment
- in settings.js edit `editorTheme.theme` can be any [theme](https://github.com/node-red-contrib-themes/theme-collection), currently dark, dracula, midnight-red, oled, solarized-dark, solarized-light  
- `npm start`


### Notes

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



