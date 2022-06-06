import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { puzzle_status } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()

  // Puzzle information.
  const [answerList, setAnswerList] = useState([]);

  async function loadAnswerList() {
    console.log("Double run answer-list.");
    //alert("AnswerList|loadAnswerList");
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
        query{
          answerCreatedEvents(last: 1000, filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
            resultType:{
              equalTo: "ANSWER_HASH_IS_MATCH"
            }            
          }){
            nodes{
              id,
              whoId,
              answerContent,
              eventBn,
              resultType
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data. = ", result.data); // answerCreatedEvents
      setAnswerList(result.data.answerCreatedEvents.nodes);
    });
  }


  useEffect(() => {

    loadAnswerList();
  }, [pubRefresh]);


  return (
    <div>      
      <ul>
        {answerList.map((answerData, idx)=><li key={idx}>
          Solver: <UserHomeLink user_address={answerData.whoId} />, submitted <strong>{answerData.answerContent}</strong> on Block {answerData.eventBn}
        </li>)}
      </ul>
      {(puzzle_status=="UNSOLVED")?(<PuzzleAnswer puzzle_hash={puzzle_hash} answerList={answerList} />):(<p>Submissions closed.</p>)}    
    </div>
  );
}

export default function AnswerList (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash,  } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext();
  return api.query && puzzle_hash && apollo_client && gql
    ? <Main {...props} />
    : null;
}
