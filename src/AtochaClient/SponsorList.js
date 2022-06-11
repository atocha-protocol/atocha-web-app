import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import PuzzleCommitSponsorship from "./PuzzleCommitSponsorship";
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";
import AtoBlock2Time from "./AtoBlock2Time";
import AtoDeleteThousand from "./AtoDeleteThousand";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { puzzle_status } = props;

  // Puzzle information.
  const [puzzleDepositList, setPuzzleDepositList] = useState([]);
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck},chainData: {pubBlockNumber},} = useAtoContext()

  async function loadChallengeDepositList() {
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
        query{
          puzzleDepositEvents(last: 1000, filter: {
            puzzleInfoId:{
              equalTo: "${puzzle_hash}"
            }
          },orderBy: DEPOSIT_DESC){
            nodes{
              id,
              whoId,
              eventBn,
              deposit,
              puzzleInfo{
                id
              },
              tip
            }
          }
        }
      `
    }).then(result => {
      console.log("result.data. = ", result.data); // puzzleDepositEvents
      setPuzzleDepositList(result.data.puzzleDepositEvents.nodes);
    });
  }

  useEffect(() => {
    loadChallengeDepositList();
  }, [pubRefresh]);


  return (
    <div>
      <ul>
      {puzzleDepositList.map((sponsorDepositData, idx)=><li key={idx}>
        <UserHomeLink user_address={sponsorDepositData.whoId} /> sponsored {sponsorDepositData.deposit/(10**18)}, <AtoBlock2Time bigBlock={pubBlockNumber} smallBlock={sponsorDepositData.eventBn} /> ago.
        {(sponsorDepositData.tip=="" || sponsorDepositData.tip=="none") ? (
          <></>
        ):(
        <i style={{color:'gray'}}> {sponsorDepositData.tip}</i>
        )} 
        </li>)}
      </ul>
      {(puzzle_status=="UNSOLVED")?(<PuzzleCommitSponsorship puzzle_hash={puzzle_hash} puzzleDepositList={puzzleDepositList} />):(<p>Submission closed.</p>)}
    </div>
  );
}

export default function SponsorList (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
    ? <Main {...props} />
    : null;
}
