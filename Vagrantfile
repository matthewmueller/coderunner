# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu"

  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:9001" will access port 80 on the guest machine.
  config.vm.network :forwarded_port, guest: 9001, host: 9001

  # Add a private network for nfs
  # config.vm.network :private_network, ip: " 192.168.1.110"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder ".", "/vagrant"

  # Install docker on ubuntu 12.04
  # Provision docker and new kernel if deployment was not done
  if Dir.glob("#{File.dirname(__FILE__)}/.vagrant/machines/default/*/id").empty?
    # Add lxc-docker package
    pkg_cmd = "apt-get update -qq; apt-get install -q -y python-software-properties; " \
      "add-apt-repository -y ppa:dotcloud/lxc-docker; apt-get update -qq; " \
      "apt-get install -q -y lxc-docker; "
    # Add X.org Ubuntu backported 3.8 kernel
    pkg_cmd << "add-apt-repository -y ppa:ubuntu-x-swat/r-lts-backport; " \
      "apt-get update -qq; apt-get install -q -y linux-image-3.8.0-19-generic; "
    # Add guest additions if local vbox VM
    is_vbox = true
    ARGV.each do |arg| is_vbox &&= !arg.downcase.start_with?("--provider") end
    if is_vbox
      pkg_cmd << "apt-get install -q -y linux-headers-3.8.0-19-generic dkms; " \
        "echo 'Downloading VBox Guest Additions...'; " \
        "wget -q http://dlc.sun.com.edgesuite.net/virtualbox/4.2.12/VBoxGuestAdditions_4.2.12.iso; "
      # Prepare the VM to add guest additions after reboot
      pkg_cmd << "echo -e 'mount -o loop,ro /home/vagrant/VBoxGuestAdditions_4.2.12.iso /mnt\n" \
        "echo yes | /mnt/VBoxLinuxAdditions.run\numount /mnt\n" \
          "rm /root/guest_additions.sh; ' > /root/guest_additions.sh; " \
        "chmod 700 /root/guest_additions.sh; " \
        "sed -i -E 's#^exit 0#[ -x /root/guest_additions.sh ] \\&\\& /root/guest_additions.sh#' /etc/rc.local; " \
        "echo 'Installation of VBox Guest Additions is proceeding in the background.'; " \
        "echo '\"vagrant reload\" can be used in about 2 minutes to activate the new guest additions.'; "
    end

    # Install node.js dependencies
    pkg_cmd << "apt-get install -y make python g++;" \
      "apt-get install -y curl;" \
      "curl http://nodejs.org/dist/v0.10.13/node-v0.10.13-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv;"

    # Install global dependencies
    pkg_cmd << "npm install -g component;" \
      "npm install -g node-gyp;" \
      "npm install -g node-dev;"

    # Activate new kernel
    pkg_cmd << "shutdown -r +1; "
    config.vm.provision :shell, :inline => pkg_cmd
  end

  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]          # Make sure DNS works properly
    vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    vb.customize ["modifyvm", :id, "--cpus", "2"]                  # Make VM Dual Core
    vb.customize ["modifyvm", :id, "--cpuexecutioncap", "100"]     # Limit CPU usage to 100% of host
    vb.customize ["modifyvm", :id, "--memory", 1024]                       # Give VM 1GB RAM
  end
end
