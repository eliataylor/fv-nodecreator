

#### 
Currently, Image Manipulation and Motion Detect will only work against the dev API at "http://localhost:5123". Run it with https://github.com/eliataylor/fa-onprem-api/tree/master


## Local Dev Environment
- `git clone git@github.com:eliataylor/fv-nodecreator.git`
- `cd fv-nodecreator`
- `npm install`
- `npm start`


## To Publish
- increment `"version": "x.x.x"` in `extra_packages/node-red-contrib-fv-detection-nodes/package.json`
- `cd extra_packages/node-red-contrib-fv-detection-nodes`
- `npm login`
- `npm publish`


### Docker Environment (legacy)
- `docker build -t ${whoami}/nodecreator .`
- `docker stop nodecreator && docker rm nodecreator`
- `docker run --name nodecreator -p 1881:1881 -d ${whoami}/nodecreator`
- CLI: `sudo docker exec -it nodecreator /bin/bash`


### Teamviewer Dev Env (legacy)
- `git pull origin master && sudo docker stop fvonprem_nodes && sudo docker rm fvonprem_nodes && sudo docker build -t visioncell/nodecreator . && sudo docker run --name fvonprem_nodes -p 1880:1880 -d visioncell/nodecreator`

- `sudo docker build -t visioncell/nodecreator .`
- `sudo docker stop fvonprem_nodes && sudo docker rm fvonprem_nodes`
- `sudo docker run --name fvonprem_nodes -p 1881:1881 -d visioncell/nodecreator`
- `sudo docker exec -it fvonprem_nodes /bin/bash`

### Install Packages into Global Node-Red installation
- navigate anywhere you want to checkout this module: ex. `cd ~/Documents` 
- `git clone git@github.com:eliataylor/fv-nodecreator.git`
- navigate to your Node-RED Directory: `cd ~/.node-red`
- `npm install ~/Documents/fv-nodecreator/extra_packages/node-red-contrib-fv-detection-nodes`

### Theming
- in settings.js edit `editorTheme.theme` can be any [theme](https://github.com/node-red-contrib-themes/theme-collection), currently dark, dracula, midnight-red, oled, solarized-dark, solarized-light
