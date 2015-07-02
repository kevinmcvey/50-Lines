# 50-Lines

50 Lines is an interactive conceptual art installation by Kevin McVey.

Its purpose is to showcase and celebrate the subtle beauty of simple geometric patterns. Try it out [here](http://kevin.4mcveys.com/50/lines.html).

Though the piece can be run in one's browser, its proper presentation is in the form of a physical installation. There are thus two versions of this code, one for the Web and one to be run on a Raspberry Pi. Please see the [project's homepage](http://kevin.4mcveys.com/v50/) for more. *(also pictures!)*

---

### Raspberry Pi
50 Lines is run as a web application in a Chromium kiosk window. This version, however, has been modified to operate using keyboard input in place of a GUI. 

For installation purposes, this keyboard can also be replaced with physical pushbuttons tied to the Raspberry Pi's GPIO. This code (located in /RasPi/Keyboard) requires [WiringPi](http://wiringpi.com/) and is thus built using the `-lwiringPi` gcc flag. A pinout to keyboard to action diagram is below:

```
WiringPi : Keyboard : Action
-------------------------------------
       0 :    H     : Horizontal box
       1 :    V     : Vertical box
       2 :    F     : Forward diagonal box
       3 :    B     : Backward diagonal box
       4 :    N     : Blank ("null") box
       5 :    ,     : New line
       6 :  <left>  : Move cursor left
      11 :  <right> : Move cursor right
       8 :  <bksp>  : Backspace
       9 :    C     : Reset to default
      10 :    P     : Print (or debug)
```

**Note** that the pins above are [WiringPi pins](http://wiringpi.com/pins/), and *do not* match the pin numbers used on the Raspberry Pi itself.

A custom autostart script is also provided here in the event that your installation is intended to boot straight into this software. Simply modify the file locations on lines 4 & 5, and then place the file in your Pi's `/etc/xdg/lxsession/LXDE-pi/autostart` directory.

---

### Web

Enter combinations of H, V, F, B, N, and comma into the control box on the bottom of the page. Share with friends by simply copy/pasting your automatically updating URL. Yep, it's that easy!