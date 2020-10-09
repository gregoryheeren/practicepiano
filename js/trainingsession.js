class TrainingSession {

    /**
     * 
     * @param {Array} exercises a list of exercise objectsn they will be ran in order
     */
    constructor(exercises) {

        this.exercises = exercises;
        this.results = new Map(); // will contain exercise.ID = score        
        this.exercisePointer = -1;

    }

    start(onTrainingFinished) {

        console.log("Starting training session with exercises", this.exercises);
        this.onFinished = onTrainingFinished;
        this.nextExercise();
        
    } 

    nextExercise() {

        this.exercisePointer++;
        this.exercises[this.exercisePointer].start((ex) => this.onExerciseFinished(ex));

    }

    onExerciseFinished(ex) {

        console.log("onExerciseFinished",ex);
        this.results[ex.ID] = ex.score;
        this.nextExercise();

    }

}