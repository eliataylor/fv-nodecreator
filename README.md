- cp -R flexvision/static node_modules/@node-red/editor-client/public

# Testing Environment

- in settings.js, edit `httpStatic` with this directory (where you put this repository)
- in a terminal run, `PORT=3080 node-red /[THIS DIRECTORY]/test-suite.json -s /THIS DIRECTORY/settings.js`


- EX.
PORT=3080 node-red ~/flexibleassembly/RobotCommNode/motioncell-flow.json -s ~/flexibleassembly/RobotCommNode/settings-motioncell.js

### Deploy
- `docker build -t elitaylor/nodecreator .`
- `docker stop nodecreator && docker rm nodecreator`
- `docker run --name nodecreator -p 1881:1881 -d elitaylor/nodecreator`
- `sudo docker exec -it nodecreator /bin/bash`


### on stage
- `sudo docker build -t visioncell/nodecreator .`
- `sudo docker stop fvonpremn_nodes && docker rm fvonpremn_nodes`
- `sudo docker run --name fvonpremn_nodes -p 1881:1881 -d visioncell/nodecreator`
- `sudo docker exec -it fvonpremn_nodes /bin/bash`
