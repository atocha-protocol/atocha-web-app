
import sha256 from 'sha256';

function MakeAnswerSha256WithSimple (answerTxt, puzzleHash) {
  // let final_answer = answer_txt.toLowerCase()
  // final_answer = final_answer.replace(/[^0-9a-z]/gi, '')
  // console.log("final_answer 1 = ", final_answer , "puzzle_hash = ", puzzle_hash )
  console.log('final_answer raw char = ', answerTxt);
  let finalAnswer = sha256(answerTxt);
  console.log('final_answer sha256 = ', finalAnswer, 'puzzle_hash =', puzzleHash);
  finalAnswer += puzzleHash.toString();
  console.log('final_answer append puzzle-hash = ', finalAnswer);
  finalAnswer = sha256(finalAnswer);
  console.log('final_answer final sha256 = ', finalAnswer);
  return finalAnswer;
}
export default MakeAnswerSha256WithSimple;
