/**
 * This magical class tells you which exercise should be the next one given a set of results
 */
class Recommender {

    /**
     * 
     * @param {*} history Contains the history of exercises done, their DTS (datetimestamp) and score
     * @param {*} trainingset Contains the possible exercises to chose from now
     * 
     * history = {
     *  "id": "someid"
     *  "dts": "20201012...",
     *  "score": 0.5
     * }
     * 
     * trainingset = {
     *  "id": "someid"
     * }
     * 
     * 
     */
    static recommend(history, trainingset) {
        return trainingset[Math.floor(Math.random()*trainingset.length)];
    }


}