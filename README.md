### Eli's Localhost
- `docker build -t ${whoami}/nodecreator .`
- `docker stop nodecreator && docker rm nodecreator`
- `docker run --name nodecreator -p 1881:1881 -d ${whoami}/nodecreator`
- `sudo docker exec -it nodecreator /bin/bash`


### Teamviewer Dev Env
- `sudo docker build -t visioncell/nodecreator .`
- `sudo docker stop fvonpremn_nodes && sudo docker rm fvonpremn_nodes`
- `sudo docker run --name fvonpremn_nodes -p 1881:1881 -d visioncell/nodecreator`
- `sudo docker exec -it fvonpremn_nodes /bin/bash`


# Testing Environment
- in settings.js edit `editorTheme.theme` can be any [theme](https://github.com/node-red-contrib-themes/theme-collection), currently dark, dracula, midnight-red, oled, solarized-dark, solarized-light  
- `npm start`

