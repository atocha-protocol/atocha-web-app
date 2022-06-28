import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";
import KButton from "./KButton";

function Main (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash, puzzleDepositList } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck}, extractErrorMsg} = useAtoContext()

  // Puzzle information.
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  const [sponsorshipExplain, setSponsorshipExplain] = useState("none");

  useEffect(() => {

  }, [api.query.atochaModule]);

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function handlerEvent(section, method, statusCallBack, data) {
    if(section == 'atochaFinance' &&  method == 'PuzzleDeposit') {
      if(data[4].toString()=="Sponsored"){
        statusCallBack(1, "😉 Thank you for your sponsorship.");
      }
      else{
        statusCallBack(1, data[4].toString());
      }
      setDeposit(0);
      setSponsorshipExplain("none");
      freshList(); // update list
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error)
      if(failedMsg){
        if(failedMsg=="PuzzleMinBonusInsufficient"){
          statusCallBack(2, "Amount too small.");
        }
        else{
          statusCallBack(2, `${failedMsg}`);
        }        
      }else{
        statusCallBack(2, "Sorry, there was an unknown mistake.");
      }
    }
  }

  function preCheckCall(buttonKey, currentStatus, statusCallBack) {
    if(deposit<=0){
      alert('Amount must be positive.');
      return false;
    }    
    if(sponsorshipExplain==""){
      setSponsorshipExplain("none");
    }
    //console.log("currentStatus = ", currentStatus);
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
          puzzleDepositEvents(last: 1000, filter: {
            puzzleInfoId:{
              equalTo: "${puzzle_hash}"
            }
          },orderBy: DEPOSIT_DESC){
            totalCount
          }
        }
    `;
    tryToPollCheck(query_str, updatePubRefresh, ()=>{}, puzzleDepositList.length);    
  }

  return (
    <Form>
      <Form.Field>
        <Input
          label='Amount (Min:10)'
          type='number'
          state='amount'
          onChange={(_, { value }) => countDeposit(value) }
        />
      </Form.Field>
      <Form.Field>
        <div>Short message (optional, text only)</div>
        <TextArea
          onChange={(_, { value }) => setSponsorshipExplain(value) }
        />
      </Form.Field>
      <Form.Field style={{ textAlign: 'left' }}>
        <KButton
          label={`Sponsor`}
          type={`SIGNED-TX`}
          attrs={{
            palletRpc: 'atochaModule',
            callable: 'additionalSponsorship',
            inputParams: [puzzle_hash, deposit, sponsorshipExplain],
            paramFields: [true, true, true],
          }}
          buttonKey={'sponsor_on_click'}
          preCheckCall= {preCheckCall}
          handlerEvent= {handlerEvent}
        />
      </Form.Field>
    </Form>
  );
}

export default function PuzzleCommitSponsorship (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const {apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
