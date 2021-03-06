XBMC Xbox Controller
====================

![icon](icon.jpg) Control XBMC using an original Xbox controller

Installation
------------

First, install [Node.js][0].  Then run:

    [sudo] npm install -g xbmc-xbox-controller

### Linux

Everything should work out of the box, no extra work is needed

### Mac OS X

You need to install the [Xbox HID controller][1] driver

If you are running Mountain Lion, Mavericks, or higher, you will
need to install the latest version of this driver found in [this
blog post][2] by using this direct link
[http://xhd.cvs.sourceforge.net/viewvc/xhd/xhd/Release/xhd_2_0_0.dmg?revision=1.3.](http://xhd.cvs.sourceforge.net/viewvc/xhd/xhd/Release/xhd_2_0_0.dmg?revision=1.3)

How To
------

After you have installed [Node.js][0], this program using `npm`, and the necessary
HID driver, you can fire up the program and everything should work automatically.

    $ xbmc-xbox-controller
    one controller found
    opening device: USB_045e_0285_fd121000
    connected to XBMC, ctrl-c to quit
    ^C

All events generated by the controller will be forwarded to XBMC over `127.0.0.1:9777`,
the EventServer API and will conform to `gamepad.xml` found in keymaps/ of XBMC.

If you have more than one controller, or `xbmc-xbox-controller` didn't automatically
detect your controller you can get a list of all HID devices found on your machine with

    $ xbmc-xbox-controller -l
    USB_05ac_0252_fa120000: Apple Internal Keyboard / Trackpad
    USB_05ac_8242_fd110000: Apple IR
    USB_045e_0285_fd121000: Xbox Controller
    USB_05ac_0252_fa120000: Apple Internal Keyboard / Trackpad
    USB_05ac_0252_fa120000: Apple Internal Keyboard / Trackpad
    USB_05ac_0252_fa120000: Apple Internal Keyboard / Trackpad

And then call this program with the correct device path

    $ xbmc-xbox-controller USB_045e_0285_fd121000
    opening device: USB_045e_0285_fd121000
    connected to XBMC, ctrl-c to quit
    ^C

Add 1 or more `-v` arguments to get very verbose logging (by default no events are logged)

    $ xbmc-xbox-controller -vv
    one controller found
    opening device: USB_045e_0285_fd121000
    connected to XBMC, ctrl-c to quit
    {"button":"dpadup","map":"XG","down":false}
    {"button":"dpaddown","map":"XG","down":false}
    {"button":"dpadleft","map":"XG","down":false}
    {"button":"dpadright","map":"XG","down":false}
    {"button":"start","map":"XG","down":false}
    {"button":"back","map":"XG","down":false}
    {"button":"leftthumbbutton","map":"XG","down":false}
    {"button":"rightthumbbutton","map":"XG","down":false}
    {"button":"A","map":"XG","down":false}
    {"button":"B","map":"XG","down":false}
    {"button":"X","map":"XG","down":false}
    {"button":"Y","map":"XG","down":false}
    {"button":"black","map":"XG","down":false}
    {"button":"white","map":"XG","down":false}
    {"button":"leftanalogtrigger","amount":0,"map":"XG","down":false}
    {"button":"rightanalogtrigger","amount":0,"map":"XG","down":false}
    {"button":"leftthumbstickleft","amount":0,"axis":1,"map":"XG","down":false}
    {"button":"leftthumbstickright","amount":0,"down":0,"axis":1,"map":"XG"}
    {"button":"leftthumbstickup","amount":0,"axis":1,"map":"XG","down":false}
    {"button":"leftthumbstickdown","amount":0,"down":0,"axis":1,"map":"XG"}
    {"button":"rightthumbstickleft","amount":0,"axis":1,"map":"XG","down":false}
    {"button":"rightthumbstickright","amount":0,"down":0,"axis":1,"map":"XG"}
    {"button":"rightthumbstickup","amount":0,"axis":1,"map":"XG","down":false}
    {"button":"rightthumbstickdown","amount":0,"down":0,"axis":1,"map":"XG"}
    24 updates sent in the last second
    {"button":"dpadright","map":"XG","down":true}
    {"button":"dpadright","map":"XG","down":false}
    2 updates sent in the last second
    {"button":"X","map":"XG","down":true}
    {"button":"X","map":"XG","down":false}
    2 updates sent in the last second
    {"button":"rightanalogtrigger","amount":6144,"map":"XG","down":true}
    {"button":"rightanalogtrigger","amount":8448,"map":"XG","down":true}
    {"button":"rightanalogtrigger","amount":9216,"map":"XG","down":true}
    {"button":"rightanalogtrigger","amount":11776,"map":"XG","down":true}
    {"button":"rightanalogtrigger","amount":12032,"map":"XG","down":true}
    ^C

Usage
-----

    usage: xbmc-xbox-controller [HID path]

    control XBMC using an original Xbox controller

      -d, --deadzone <percent>      [env XBOX_XBMC_DEADZONE] deadzone for analog sticks, defaults to 25
      -h, --help                    print this message and exit
      -H, --host <host>             [env XBOX_XBMC_HOST] host on which to listen, defaults to localhost
      -l, --list                    list all HID devices found and exit
      -p, --port <port>             [env XBOX_XBMC_PORT] port on which to listen, defaults to 9777
      -u, --updates                 check for available updates
      -v, --verbose                 increase verbosity
      -V, --version                 print the version number and exit

License
-------

MIT License

[0]: http://nodejs.org
[1]: http://xhd.sourceforge.net/
[2]: http://macman860.wordpress.com/2013/05/03/xbox-driver-for-mac-os-x-lion/
