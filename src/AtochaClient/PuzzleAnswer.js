import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import AnswerList from "./AnswerList";
import {gql} from "@apollo/client";
import {useAtoContext} from "./AtoContext";
import {web3FromSource} from "@polkadot/extension-dapp";
import KButton from "./KButton";

function Main (props) {
  const { api, currentAccount } = useSubstrateState();
  const { puzzle_hash, answerList } = props;
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck, setBindModalOpen, setAuthPwdModalOpen, setRecoverPwdModalOpen, checkUserLoggedIn, checkUserSmoothIn, usedSmoothStatus}, extractErrorMsg} = useAtoContext()

  // Puzzle information.
  const [answerTxt, setAnswerTxt] = useState('');
  const [answerExplain, setAnswerExplain] = useState("none");
  const [statusTxt, setStatusTxt] = useState(null);
  useEffect(() => {
  }, [api.query.atochaModule]);


  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = currentAccount;
    let fromAcct;
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = null;
    }
    return fromAcct;
  };

  function handlerEvent(section, method, statusCallBack, data) {
    if(section == 'atochaModule' &&  method == 'AnswerCreated') {
      //statusCallBack(1, data[4].toString());
      if(data[4].toString()=="ANSWER_HASH_IS_MATCH"){
        statusCallBack(1,"😉 Bingo! Your answer is right.");
      }
      else if(data[4].toString()=="ANSWER_HASH_IS_MISMATCH"){
        statusCallBack(1,"Your answer is not right.");
      }
      else{
        //statusCallBack(1, data[4].toString());
        statusCallBack(1,"Your answer is not right (101).");
      }
      setAnswerTxt("");
      setAnswerExplain("none");
      freshList(); // update list
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error)
      if(failedMsg) {
        statusCallBack(2, "Your answer is not right (102).");
      }else{
        statusCallBack(2, "Sorry, there was an unknown mistake.");
      }
    }
  }

  async function preCheckCall(buttonKey, currentStatus, statusCallBack) {
    if (answerTxt == "") {
      alert('Answer can not be empty.');
      return false;
    }
    if (currentStatus == 3) {
      alert('Wait for pending process.');
      return false;
    }
    statusCallBack(0, "Submitting...");
    return true
  }

  async function freshList() {
    const query_str = `
             query{
              answerCreatedEvents(filter: {
                puzzleHash:{
                  equalTo: "${puzzle_hash}"
                }
                resultType:{
                  equalTo: "ANSWER_HASH_IS_MATCH"
                }                  
              }){
                totalCount
              }
            } `;
    tryToPollCheck(query_str, updatePubRefresh, ()=>{}, answerList.length);
  }

  return (
    <Form>
      <Form.Field>
          <Input
              label='Your answer'
              type='text'
              onChange={(_, { value }) => setAnswerTxt(value) }
          />
      </Form.Field>
      <Form.Field style={{display:'none'}}>
          <div>Answer explain (It will be published if you answer is the first matched.)</div>
          <TextArea
              onChange={(_, { value }) => setAnswerExplain(value) }
          />
      </Form.Field>
      <Form.Field style={{ textAlign: 'left' }}>
          <KButton
            label={`Submit your answer`}
            type={`SIGNED-TX`}
            attrs={{
              palletRpc: 'atochaModule',
              callable: 'answerPuzzle',
              inputParams: [puzzle_hash, answerTxt, answerExplain],
              paramFields: [true, true, true],

            }}
            buttonKey={'puzzle_answer_on_click'}
            preCheckCall= {preCheckCall}
            handlerEvent= {handlerEvent}
            isOpenSmooth= {usedSmoothStatus}
          />
      </Form.Field>
      <Form.Field>
        {statusTxt}
      </Form.Field>
    </Form>
  );
}

export default function PuzzleAnswer (props) {
  const { api } = useSubstrateState();
  const { puzzle_hash } = props;
  const { apollo_client, gql } = useAtoContext()
  return api.query && puzzle_hash && apollo_client && gql
      ? <Main {...props} />
      : null;
}
