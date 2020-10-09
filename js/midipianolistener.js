class MIDIPianoListener {

    constructor() {
        
        // check capability of browser
        if (!navigator.requestMIDIAccess) { throw new Error('WebMIDI is not supported in this browser.'); }
        //console.log('WebMIDI is supported in this browser.');

        // intial setup
        this.notesOn = new Set(); // keeps track of all notes that are currently being pushed


    }

    async listen(onKeyDown, onKeyUp) {
        
        // event handlers
        this.onKeyDown = onKeyDown;
        this.onKeyUp = onKeyUp;

        // obtain midi streams
        try {
            var midiAccess = await navigator.requestMIDIAccess();
            for (var input of midiAccess.inputs.values()) {
                input.onmidimessage = (msg) => this.onMIDIMessage(msg);
            }
        } catch (err) {
            throw err;
            //throw new Error("Error: Could not access MIDI devices. Connect a device and refresh to try again.");
        }
    }

    // removes the listeners
    stopListening() {
        this.onKeyUp = null;
        this.onKeyDown = null;
    }

    onMIDIMessage(message) {

        //console.log("onMIDIMessage", message);

        var command = message.data[0];
        var halftone = message.data[1];
        var velocity = message.data[2];

        switch (command) {
            case 128: // noteOff
                this.notesOn.delete(halftone);
                if (this.onKeyUp) { this.onKeyUp(halftone,[...this.notesOn]); }
                break;
            case 144: // noteOn
                this.notesOn.add(halftone);
                if (this.onKeyDown) { this.onKeyDown(halftone,[...this.notesOn]); }
                break;
        }
    }

}