import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import KButton from "./KButton";
import {useAtoContext} from "./AtoContext";
import AtoBlock2Time from "./AtoBlock2Time";

function Main (props) {
  const {api} = useSubstrateState();
  const {puzzle_hash,challengeDepositList,puzzle_challengeDeadline,minDeposit} = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck, isOpenSmooth}, extractErrorMsg, chainData: {pubBlockNumber}, } = useAtoContext();

  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  // const [puzzleHash, setPuzzleHash] = useState('');

  var newMinDeposit=-1;
  if(minDeposit<(10**18)){
    newMinDeposit=1;
  }
  else{
    newMinDeposit=minDeposit/(10**18);
  }

  useEffect(() => {


    // // Subscribe to system events via storage
    // api.query.system.events((events) => {
    //   console.log(`\nReceived ${events.length} events:`);
    //
    //   // Loop through the Vec<EventRecord>
    //   events.forEach((record) => {
    //     // Extract the phase, event and the event types
    //     const { event, phase } = record;
    //     const types = event.typeDef;
    //
    //     // Show what we are busy with
    //     console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
    //     console.log(`\t\t${event.meta}`);
    //
    //     // Loop through each of the parameters, displaying the type and data
    //     event.data.forEach((data, index) => {
    //       console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
    //     });
    //   });
    // });

  }, [api.query.atochaModule]);

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function handlerEvent(section, method, statusCallBack, data) {
    if(section == 'atochaFinance' &&  method == 'ChallengeDeposit') {
      //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",data);
      //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",data[0].toString());
      //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",data[1].toString());
      //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",data[2].toString());
      //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",data[3].toString());
      //statusCallBack(1, data[3].toString());
      if(data[3].toString()=="Issue"){
        statusCallBack(1, "😉 Challenge has been Launched.");
      }
      else{
        statusCallBack(1, data[3].toString());
      }
      setDeposit(0);
      freshList(); // update list
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error)
      if(failedMsg){
        if(failedMsg=="ChallengeDepositTooLow"){
          statusCallBack(2, "Amount too small.")
        }
        else{
          statusCallBack(2, `${failedMsg}`)  
        }        
      }else{
        statusCallBack(2, "Sorry, there was an unknown mistake.");
      }
    }
  }

  function preCheckCall(buttonKey, currentStatus, statusCallBack) {
    //console.log("currentStatus = ", currentStatus);
    if(deposit<=0){
      alert('Amount must be positive.');
      return false;
    }     
    if(currentStatus == 3) {
      alert('Wait for pending process.');
      return false;
    }
    statusCallBack(0, "Submitting...");
    return true;
  }

  async function freshList() {
    const query_str = `
        query{
          challengeDepositEvents(filter: {
            puzzleHash:{
              equalTo: "${puzzle_hash}"
            }
          }){
            totalCount
          }
    }`;
    tryToPollCheck(query_str, updatePubRefresh, ()=>{}, challengeDepositList.length);
  }
  
  return (
    <Form>
      <Form.Field>
        <AtoBlock2Time bigBlock={puzzle_challengeDeadline} smallBlock={pubBlockNumber} />left to the deadline.
      </Form.Field>
      <Form.Field>
        <Input
          label={`Amount (Min:${newMinDeposit})`}
          type='number'
          state='amount'
          onChange={(_, { value }) => countDeposit(value) }
        />
      </Form.Field>
      <Form.Field style={{ textAlign: 'left' }}>
        <KButton
          label={`Challenge`}
          type={`SIGNED-TX`}
          attrs={{
            palletRpc: 'atochaModule',
            callable: 'commitChallenge',
            inputParams: [puzzle_hash, deposit],
            paramFields: [true, true],
          }}
          buttonKey={'challenge_a_on_click'}
          preCheckCall= {preCheckCall}
          handlerEvent= {handlerEvent}
          isOpenSmooth= {isOpenSmooth}
        />          
      </Form.Field>
    </Form>
  );
}

export default function PuzzleCommitChallenge (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, challengeDepositList} = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext();
  return api.query && puzzle_hash && apollo_client && gql && challengeDepositList
      ? <Main {...props} />
      : null;
}
