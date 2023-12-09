/****************************************************************
*       Reloop Beatmix script v0.8                              *
*       Author: Eugene Erokhin, uncle.eugene@gmail.com          *
*       Tested on Mixxx version 2.4.x                           *
*                                                               *
*       Documentation in the Mixxx wiki:                        *
*       https://mixxx.org/wiki/doku.php/reloop_terminal_mix     *
****************************************************************/

function Beatmix() {}

// This constant defines the volume fader threshold at which fader start kicks in.
const faderStartThr = 0x20

// Internal variables
Beatmix.scratchEnabled = [false, false];
Beatmix.faderStartEnabled = [false, false];
Beatmix.faderLastValue = [0,0];

// ----------   Functions   ----------

// Beatmix.init initializes the controller. Currently it just sets all lights off.
Beatmix.init = function (id,debug) {
    Beatmix.id = id;

    for (var i=0; i<=1; i++) {
        for (var j=1; j<=120; j++) {
            midi.sendShortMsg(0x90+i,j,0x00);
        }
    }
}

// Beatmix.FaderStart handles fased start feature. The feature is enabled by Shift-Cue
// and its state is indicated by Shift-Cue light.
Beatmix.FaderStart = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group)
    if (value == 0x7F) {
        if (Beatmix.faderStartEnabled[deck]) {
            Beatmix.faderStartEnabled[deck] = false;
            midi.sendShortMsg(0x90+channel, 0x4E, 0x00);
    
        } else {
            Beatmix.faderStartEnabled[deck] = true;
            midi.sendShortMsg(0x90+channel, 0x4E, 0x7F);
    
        }
    }
}

// Beatmix.Fader handles volume faders. If fader start is enabled it will start the
// corresponding deck once volume fader is above a certain position.
// No fader stop implemented. 
// If you want to use fader as a hotcue button then what are you, a monster? :)
Beatmix.Fader = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (Beatmix.faderStartEnabled[deck] && value > faderStartThr && Beatmix.faderLastValue[deck] < faderStartThr) {
        engine.setValue(group, "play", 1);
    }

    engine.setParameter(group, "volume", value/127);
    Beatmix.faderLastValue[deck] = value;

}

// Beatmix.ToggleScratchMode toggles scratch mode on/off. Unfortunately
// the scratch button LED on Reloop Beatmix is controlled by hardware so
// there's no way to set this LED in accordance to current scratch mode.
// So i deceided to leave the dedicated button alone. It does nothing at all.
// Instead scratch mode is enabled and indicated by Shift-Load.
Beatmix.ToggleScratchMode = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (value == 0x7F) {
        Beatmix.scratchEnabled[deck] = !Beatmix.scratchEnabled[deck]
    }
    if (Beatmix.scratchEnabled[deck]) {
        midi.sendShortMsg(0x90+channel, 0x52, 0x7F);
    } else {
        midi.sendShortMsg(0x90+channel, 0x52, 0x00);

    }
}

// Beatmix.wheelTouch handles the touch of jog top plate. When scratch mode is selected
// touching the plate will switch deck into scratch mode.
Beatmix.wheelTouch = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    if (Beatmix.scratchEnabled[deck]) {
        if (value == 0x7F) {
            var alpha = 1.0/8;
            var beta = alpha/32;
            engine.scratchEnable(deck, 800, 33+1/3, alpha, beta);
        }
        else {    // If button up
            engine.scratchDisable(deck);
        }
    }
}

// Beatmix.wheelTurn process jogwheel movement depending on selected jog mode.
// There are two modes. One (default) is more gentle and another (kicked in with
// the search button just next to the jog) is four time faster.
Beatmix.wheelTurn = function (channel, control, value, status, group) {
    var deck = script.deckFromGroup(group);
    var newValue=(value-64);
    if (engine.isScratching(deck)) {
        engine.scratchTick(deck,newValue);
        return;
    }
    if (control == 0x26 || control == 0x28){
        engine.setValue(group, "jog", newValue/2);
    } else {
        engine.setValue(group, "jog", newValue/16);
    }
}

// Beatmix.shiftKey handles shift keys. Shift keys affect navigation knob behaviour.
// Shift-Knob will scroll through the library tree.
Beatmix.shiftKey = function(channel, control, value, status, group) {
   if (value == 0x7F) {
        engine.setValue("[Library]", "focused_widget", 2);
   }
   else
   {
        engine.setValue("[Library]", "focused_widget", 3);
    }
}

// Beatmix.expandCollapse handles Shif-Knob-Click event. It will expand/collapse
// currently selected library tree entry.
// Sidenote: There are two options.
// "ToggleSelectedSidebarItem" is deprecated but it expands/collapses all types
// or tree entries.
// Newer "GoToItem" doesn't seem to work with AutoDJ and tracks. Which is not a big
// deal to be honest.
Beatmix.expandCollapse = function(channel, control, value, status, group) {
    if (value == 0x7F && engine.getValue("[Library]", "focused_widget") == 2) {
        //engine.setValue("[Playlist]", "ToggleSelectedSidebarItem", 1);
        engine.setValue("[Library]", "GoToItem", 1);
    } else {
        engine.setValue("[Library]", "focused_widget", 2);        
    }
}

// Beatmix.loopSize handles Loop Size knob. This know ajusts auto loop size.
Beatmix.loopSize = function (channel, control, value, status, group) {
    var newValue=(value-64);
    if (newValue < 0) {
        engine.setValue(group, "loop_halve", 1);
    } else {
        engine.setValue(group, "loop_double", 1);
    }
}

// Beatmix.loopMove handles Loop Move knob (Shift Loop Size). This knob adjusts auto loop position.
Beatmix.loopMove = function (channel, control, value, status, group) {
    var newValue=(value-64);
    engine.setValue(group, "loop_move", newValue);

}