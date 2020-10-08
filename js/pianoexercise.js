class PianoExercise {

    constructor(musicxmlUrl, openSheetMusicDisplay) {

        this.openSheetMusicDisplay = openSheetMusicDisplay;
        this.musicxmlUrl = musicxmlUrl;
        this.totalnotes = 0; // the total amount of notes you played
        this.errors = 0; // the amount of errors you played
        this.COLORS = {
            "todo": "gray",
            "wrong": "red",
            "partial": "orange",
            "correct": "lightgreen"
        }
        

    }

    async start(onfinished) {

        this.onFinished = onfinished;

        var mpl = new MIDIPianoListener();
        mpl.listen((halftone,playedNotes) => this.onKeyDown(halftone,playedNotes),(halftone,playedNotes) => this.onKeyUp(halftone,playedNotes));

        // show it on the screen
        await this.openSheetMusicDisplay.load(exerciseUrl);
        this.openSheetMusicDisplay.render();
        this.openSheetMusicDisplay.cursor.show();
        this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.todo)
        
    } 

    onKeyDown(halftone, playedNotes) {

        //console.log("onNoteOn", halftone, allnotes);
        
        // is this an expected note?
        var expectedNotes = this.openSheetMusicDisplay.cursor.NotesUnderCursor().filter(note => !note.isRestFlag).map(note => note.pitch.halfTone + 12); // i don't know why we are 12 too low ... 
        var expectedNotesNames = expectedNotes.map(note => this.getNoteNameFromHalftone(note));

        // WRONG NOTE
        if (!expectedNotes.includes(halftone)) { // a wrong note was played, keep track of error count
            console.log(`Wrong note ${this.getNoteNameFromHalftone(halftone)}. Expecting notes ${expectedNotesNames}`);
            this.openSheetMusicDisplay.cursor.updateStyle(3 * 10.0 * this.openSheetMusicDisplay.zoom, this.COLORS.wrong)
            this.errors++;
        } else { 
            // CORRECT NOTE, but are we playing ALL expected notes?
            if (this.arrayIncludedInArray(expectedNotes,playedNotes)) { // you can be playing notes too much, I needed to add this for legato playing
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
        console.log(`Well done! You had ${this.errors} errors.`);
        if (this.onFinished) { this.onFinished; }
    }

    // invoked when a note is released. This is necessary to check rests
    // you cannot make a mistake by releasing a note in this training (i.e. we don't check the notes you're playing when releasing a key)
     onKeyUp(halftone,playedNotes) {
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