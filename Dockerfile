# TODO: figure out a "simple" orchestration
# # or wait till Docker supports it
# #
# # maybe: http://nick.stinemat.es/

# ###
# # FE server
# ###

# from    ubuntu:12.04
# maintainer    Matthew Mueller "mattmuelle@gmail.com"

# # make sure the package repository is up to date
# run    echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
# run    apt-get update

# # Install ubuntu dependencies
# run    apt-get install -y make python g++

# # Install node.js
# run    apt-get install -y curl
# run    curl http://nodejs.org/dist/v0.10.13/node-v0.10.13-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv


# # Install global dependencies
# run    npm install -g component
# run    npm install -g node-gyp

# # Add files
# add    . /src

# # Setup
# run    cd /src; npm install
# run    cd /src; component install
# run    cd /src; ./lib/build/builder

# # add to NODE_PATH
# env    NODE_PATH lib

# # Start webserver
# # cmd ["node", "/src/index.js", "80"]

####
# Runner Images
####

# NODE
from    ubuntu:12.04
maintainer    Matthew Mueller "mattmuelle@gmail.com"

# make sure the package repository is up to date
run    echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
run    apt-get update


# Install ubuntu dependencies
run    apt-get install -y make python g++

# Install node.js
run    apt-get install -y curl
run    curl http://nodejs.org/dist/v0.10.13/node-v0.10.13-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv

# Setup volumes
volume ["/scripts", "/scripts"]











