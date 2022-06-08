import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import {useAtoContext} from "./AtoContext";
import PuzzleChallengeRaising from "./PuzzleChallengeRaising";
import UserHomeLink from "./UserHomeLink";
import AtoBlock2Time from "./AtoBlock2Time";

function Main (props) {
  const { api } = useSubstrateState();
  const {puzzle_hash,puzzle_status,puzzle_prize,puzzle_challengeDeadline1,puzzle_challengeDeadline2,atoConfigChallengeTarget} = props;

  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck}, chainData: {pubBlockNumber},} = useAtoContext()

  // Puzzle information.
  const [challengeDepositList, setChallengeDepositList] = useState([]);
  const [totalChallengeDeposit, setTotalChallengeDeposit] = useState(0);
  
  async function loadChallengeDepositList() {
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
        query{
          challengeDepositEvents(last: 1000, filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            nodes{
              whoId,
              eventBn,
              deposit,
              depositType
            }
          }
        }
      `
    }).then(result => {
      //console.log("result.data. = ", result.data); // challengeDepositEvents
      setChallengeDepositList(result.data.challengeDepositEvents.nodes);
      //alert("result.data.challengeDepositEvents.nodes.length="+result.data.challengeDepositEvents.nodes.length);
      var t=0;
      var l=result.data.challengeDepositEvents.nodes;
      l.forEach(function (item) {
        t=t+Number(item.deposit);
      });
      setTotalChallengeDeposit(t);
    });
  }

  useEffect(() => {
    loadChallengeDepositList();
    //alert("challengeDepositList.length="+challengeDepositList.length);
  }, [setChallengeDepositList, pubRefresh]);

  return (
    <div>
      <div>Requirement=Total price*{atoConfigChallengeTarget/(10**7)}%={puzzle_prize*atoConfigChallengeTarget/(10**27)}</div>
      <div>Total current={totalChallengeDeposit/(10**18)}</div>
      <ul>
        {challengeDepositList.map((challengeData, idx)=><li key={idx}>
          <UserHomeLink user_address={challengeData.whoId} /> challenged with {challengeData.deposit/(10**18)}, <AtoBlock2Time bigBlock={pubBlockNumber} smallBlock={challengeData.eventBn} /> ago.
        </li>)}
      </ul>
      {(puzzle_status=="CHALLENGABLE")?((challengeDepositList.length<=0)?(<PuzzleCommitChallenge puzzle_hash={puzzle_hash} challengeDepositList={challengeDepositList} puzzle_challengeDeadline={puzzle_challengeDeadline1} minDeposit={puzzle_prize*0.05*atoConfigChallengeTarget/(10**9)} />):(<PuzzleChallengeRaising puzzle_hash={puzzle_hash} challengeDepositList={challengeDepositList} puzzle_challengeDeadline={puzzle_challengeDeadline2} />)):(<p>Submission not open or closed.</p>)}
    </div>
  );
}

export default function ChallengeList (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql, puzzleSets: {updatePubRefresh, tryToPollCheck} } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
    ? <Main {...props} />
    : null;
}
