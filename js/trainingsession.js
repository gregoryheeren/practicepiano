/**
 * A training session consists of a set of exercises that you go through one
 * after the other. An overall result of the training session is kept
 */
class TrainingSession {

    /**
     * 
     * @param {Array} exerciseUrls a list urls of music xml files
     */
    constructor(exerciseUrls,onExerciseFinishedCallback, onTrainingFinishedCallback) {

        this.exerciseUrls = exerciseUrls;
        this.results = new Map(); // will contain exercise URL = score        
        this.pianoExerciser = new PianoExerciser((ex) => this.onExerciseFinished(ex));
        this.onTrainingFinishedCallback = onTrainingFinishedCallback;
        this.onExerciseFinishedCallback = onExerciseFinishedCallback;

    }

    start() {

        console.log("Starting training session with exercises", this.exerciseUrls);
        this.nextExercise();
        
    }

    nextExercise() {

        var nextExerciseUrl = Recommender.recommend(this.results, this.exerciseUrls);
        this.pianoExerciser.start(nextExerciseUrl);

    }

    onExerciseFinished(ex) {

        this.results.set(ex.ID, {"id": ex.ID, "score": ex.score, "dts": new Date().toISOString() });
        if (this.onExerciseFinishedCallback) { this.onExerciseFinishedCallback(ex); }
        this.nextExercise();

    }

    // currently this is never invoked ... training is never over ;)
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