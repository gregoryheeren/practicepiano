/**
 * A training session consists of a set of exercises that you go through one
 * after the other. An overall result of the training session is kept
 */
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

    start(onExerciseFinishedCallback, onTrainingFinishedCallback) {

        console.log("Starting training session with exercises", this.exercises);
        this.onTrainingFinishedCallback = onTrainingFinishedCallback;
        this.onExerciseFinishedCallback = onExerciseFinishedCallback;
        this.nextExercise();
        
    } 

    nextExercise() {

        this.exercisePointer++;
        if (this.exercisePointer == this.exercises.length) { this.onTrainingFinished(); return; }
        this.exercises[this.exercisePointer].start((ex) => this.onExerciseFinished(ex));

    }

    onExerciseFinished(ex) {

        this.results.set(ex.ID, ex.score);
        if (this.onExerciseFinishedCallback) { this.onExerciseFinishedCallback(ex); }
        this.nextExercise();

    }

    onTrainingFinished() {
        if (this.onTrainingFinishedCallback) { this.onTrainingFinishedCallback(this); }
    }

    get score() {
        var sum = 0;
        for (let value of this.results.values()) {
            sum += value
        }
        return sum / this.results.size;
    }

}