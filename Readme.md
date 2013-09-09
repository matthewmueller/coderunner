# coderunner

Run server-side code in the browser. Automatic dependency installation. Live code execution. Revision support. Powered by [docker](http://docker.io).

## Demo

![coderunner](https://i.cloudup.com/bBH1cQRZ6W.gif)

> Less janky [demo](https://cloudup.com/itpREoH439e)

## Design Goals

#### Secure

Coderunner is designed to be secure. No user script should be able to jump outside its personal sandbox. All scripts run inside an isolated linux container and package installers run in separate, shared linux containers.

#### Flexible

Many server-side script runners remove features of the language in order to keep the system secure. This makes the language much less powerful. With Coderunner, you have full access to everything the language provides.

#### Fast

Coderunner is designed to provide immediate feedback. Most script runners use VMs to run server-side code securely. VMs are slow and CPU-intensive. Linux containers are fast and light-weight, offering the same kind of security that a VM provides.

#### Multilingual

Coderunner is designed to support many languages. Currently, Node.js is the only supported language, but it should be trivial to add additional scripting languages like Python, Ruby, PHP, etc.

#### Extendable

One of the upcoming goals of coderunner is to be more extendable. The script execution should be separated from the front-end allowing coderunner to support a variety of different products.

## Development

In order to develop docker locally, you'll need to install VirtualBox, Vagrant and Git.

1. Install virtualbox from https://www.virtualbox.org/ (or use your package manager)
2. Install vagrant from http://www.vagrantup.com/ (or use your package manager)
3. Install git if you had not installed it before, check if it is installed by running git in a terminal window
4. Install coderunner locally:

    `git clone https://github.com/matthewmueller/coderunner`

5. Change directory to coderunner

    `cd coderunner`

6. Run vagrant from coderunner directory

    `vagrant up`

Vagrant will download and install an ubuntu virtual machine containing:

  - ubuntu 12.04
  - docker
  - git
  - npm
  - node.js
  - coderunner

7. SSH into VM

    `vagrant ssh`

8. Change directory into `coderunner`

    `cd ~/coderunner`

9. Install node modules & [components](http://github.com/visionmedia/component):

    `make install`

10. Start the node-installer (using [mongroup](http://github.com/visionmedia/node-mongroup))

    `mongroup start node-installer`

10. Start node server (use `node-dev index.js` if you want to autorestart on save)

    `node index.js`

11. Go to [http://localhost:8080](http://localhost:8080)

## TODO

This code is still in it's infancy. There's lots to do. Here's a few things I'd like to add:

#### Docker

- Better resource limiting in docker (memory, storage, & network)
- Better docker signal support (hopefully coming in docker 0.7, see [here](http://blog.docker.io/2013/08/websockets-dockerfile-upgrade-better-registry-support-expert-mode-and-more/).)
- Ship coderunner inside docker container ([docker inside docker](https://github.com/jpetazzo/dind/))

#### Features

- Easier language interface
- More languages
- User support with script history
- Multiple files
- Environment variables for easier sharing

