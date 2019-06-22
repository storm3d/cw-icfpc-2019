import fs from 'fs'

const countMoves = () => {
    let totalScore = 0
    let scores = fs.readFileSync('./current_result.txt').toString().split(';');

    for( let i = 0; i < scores.length - 1; i++ ){
        totalScore += parseInt( scores[i], 10 )
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