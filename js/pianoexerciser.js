/**
 * Supposed to be a singleton class, however technically not enforced to be one
 */
class PianoExerciser {

    constructor(onFinished) {

        // initialize OSMD
        this.openSheetMusicDisplay = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdContainer");
        // https://opensheetmusicdisplay.github.io/classdoc/interfaces/iosmdoptions.html
        this.openSheetMusicDisplay.setOptions({
            backend: "svg",
            drawTitle: false,
            drawingParameters: "compact", // don't display title, composer etc.
            drawPartNames: false,
        });

        this.onFinished = onFinished;
        this.COLORS = {
            "todo": "gray",
            "wrong": "red",
            "partial": "orange",
            "correct": "lightgreen"
        }
        this.state = "ready"; //  ready, started, finished

    }

    async start(musicxmlUrl) {

        this.ID = musicxmlUrl;
        this.musicxmlUrl = musicxmlUrl;
        this.totalNotesPlayed = 0; // the total amount of notes you played
        this.errors = 0; // the amount of errors you played

        // listening to midi keys
        var mpl = new MIDIPianoListener();
        mpl.listen(
            (halftone,playedNotes) => this.onKeyDown(halftone,playedNotes),
            (halftone,playedNotes) => this.onKeyUp(halftone,playedNotes)
        );

        // listening to keyboard keys (for debugging)
        this.keyboardKeyDownListener = document.addEventListener('keydown', (e) => { this.onKeyDown(0,[],true);  })

        // show it on the screen
        await this.openSheetMusicDisplay.load(this.musicxmlUrl);
        this.openSheetMusicDisplay.render();
        this.openSheetMusicDisplay.cursor.show();
        this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.todo)

        // update the state
        this.state = "started";
        
    } 

    // score = correct notes played / total notes played
    get score() {
        return (this.totalNotesPlayed - this.errors) / this.totalNotesPlayed;
    }

    /**
     * 
     * @param {*} halftone Contains the note that has just been hit
     * @param {*} playedNotes Contains all notes currently being hit
     * @param {*} alwaysCorrect Used for debugging when no midi piano is available
     */
    onKeyDown(halftone, playedNotes, alwaysCorrect) {
        
        //console.log("onKeyDown", halftone, allnotes);

        if (this.state != "started") { return; }
        
        // increase the counter of total notes played
        this.totalNotesPlayed++;
        
        // is this an expected note?
        var expectedNotes = this.openSheetMusicDisplay.cursor.NotesUnderCursor().filter(note => !note.isRestFlag).map(note => note.pitch.halfTone + 12); // i don't know why we are 12 too low ... 
        var expectedNotesNames = expectedNotes.map(note => this.getNoteNameFromHalftone(note));

        // WRONG NOTE
        if (!expectedNotes.includes(halftone) && !alwaysCorrect) { // a wrong note was played, keep track of error count
            console.log(`Wrong note ${this.getNoteNameFromHalftone(halftone)}. Expecting notes ${expectedNotesNames}`);
            this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.wrong)
            this.errors++;
        } else { 
            // CORRECT NOTE, but are we playing ALL expected notes?
            if (this.arrayIncludedInArray(expectedNotes,playedNotes) || alwaysCorrect) { // you can be playing notes too much, I needed to add this for legato playing
                console.log(`You've got all the right notes for this beat, moving on :). You have ${this.errors} wrong notes so far.`);
                this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.correct);
                this.moveCursor(playedNotes);
            } else {
                console.log(`Correct note ${this.getNoteNameFromHalftone(halftone)} but there's more. Expecting notes ${expectedNotesNames}`);
                this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.partial);

            };
        }

        return;

    }

    // Invoked when the exercise is finished
    finished() {
        this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.correct);
        console.log(`Well done! You reached a score of ${this.score} on ${this.ID}`);
        
        // update the state
        this.state = "finished";
        
        if (this.onFinished) { this.onFinished(this); }
    }

    // invoked when a note is released. This is necessary to check rests
    // you cannot make a mistake by releasing a note in this training (i.e. we don't check the notes you're playing when releasing a key)
     onKeyUp(halftone,playedNotes) {

        if (this.state != "started") { return; }

        this.checkForRests(playedNotes);
    }

    // checks if we should move on because it's only rests and we're ... well ... resting
    checkForRests(playedNotes) {
        if (this.openSheetMusicDisplay.cursor.Iterator.endReached) { return; }
        var expectedNotes = this.openSheetMusicDisplay.cursor.NotesUnderCursor().filter(note => !note.isRestFlag);
        if ((!playedNotes || playedNotes.length == 0) && (!expectedNotes || expectedNotes.length == 0)) {
            console.log("Only rests ... moving on");
            this.moveCursor(playedNotes);
        }
    }

    // moving to the next notes
    moveCursor(playedNotes) {
        this.openSheetMusicDisplay.cursor.next(); // move the cursor ahead
        this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.todo);
        if (this.openSheetMusicDisplay.cursor.Iterator.endReached) { this.finished(); }
        else { this.checkForRests(playedNotes); } // rest after rest ?
    }

    getNoteNameFromHalftone(noteNum) {
        var notes = "C C#D D#E F F#G G#A A#B ";
        var octave;
        var note;

        octave = Math.floor(noteNum / 12 - 1);
        note = notes.substring((noteNum % 12) * 2, (noteNum % 12) * 2 + 2).trim();

        return note + octave;
    }

    // Checks if all elements from the subset are present in the parent array
    arrayIncludedInArray(subset,parent) {
        for (const i of subset) {
            if (!parent.includes(i)) { return false; }
        }
        return true;
    }

}