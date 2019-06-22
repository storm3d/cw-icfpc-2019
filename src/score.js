import fs from 'fs'

const countMoves = () => {
    let totalScore = 0
    let scores = fs.readFileSync('./current_result.txt').toString().split(';');

    let scoresPerModel = new Map();
    for( let i = 0; i < scores.length - 1; i++ ){
        let score = scores[i].split(':');
        let scoreVal = parseInt( score[1], 10 );
        scoresPerModel.set(score[0], scoreVal);
        totalScore += scoreVal;
    }
    let current_result = `./current_result_${new Date().getTime().toString()}.txt`;
    for (let key of Array.from(scoresPerModel.keys()).sort()) {
        fs.appendFileSync(current_result, `${key} : ${scoresPerModel.get(key)}\n`);
    }
    fs.appendFileSync('./all_results.txt', `${totalScore}\n`);
    console.log("----------------------------");
    console.log("total moves: ", totalScore)
    fs.unlinkSync('./current_result.txt');
}

countMoves();

module.exports = {
    countMoves
};