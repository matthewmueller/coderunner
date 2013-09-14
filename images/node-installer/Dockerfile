###
# NPM installer
###

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

# Add files
add    . /src

# Add node_modules to the volume
volume ["/node_modules"]

# Setup
run    cd /src; npm install

# add to NODE_PATH
env    NODE_PATH lib
env    HOME /home

# Expose public port 49100 => private port 80
# expose 3000:3000

# Start webserver
cmd ["node", "/src/index.js", "3000"]

