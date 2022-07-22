import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Button} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import ArweaveTitle from "./ArweaveTitle";
import {useAtoContext} from "./AtoContext";
import {web3FromSource} from "@polkadot/extension-dapp";
import config from '../config';

import UserHomeLink from "./UserHomeLink";
import AtoDeleteThousand from "./AtoDeleteThousand";
import BindAddressToTwitter from "./BindAddressToTwitter";

function Main (props) {
  const { api, currentAccount } = useSubstrateState('');
  const { puzzle_hash } = props;
  const { apollo_client, gql,  chainData: {pubBlockNumber, updatePubRefresh, userPoints} } = useAtoContext()

  // Atocha user information.
  const [userBalance, setUserBalance] = useState(null);
  const [relationInfos, setRelationInfos] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  
  useEffect(async () => {
    console.log("currentAccount = ", currentAccount)
    if (currentAccount) {
      fillCurrentAccountId();
      loadAccountBalance();
      await loadReleationPuzzles();
    }
  }, [currentAccount, userBalance, pubBlockNumber]);

  function fillCurrentAccountId(){
    setCurrentAccountId(currentAccount.address);
  }

  function loadAccountBalance() {
    currentAccount &&
    api.query.system
      .account(currentAccountId, balance =>{
          //setUserBalance(balance.data.free.toHuman());
          setUserBalance(balance.data.free.toHuman());
      }) .then(unsub => {
    }) .catch(console.error)
  }

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
      fromAcct = accountPair;
    }
    return fromAcct;
  };

  async function takeAnswerReward(hash) {
    const fromAcct = await getFromAcct();
    //console.log(fromAcct);
    const unsub = await api.tx.atochaModule
      .takeAnswerReward(hash)
      .signAndSend(fromAcct, (result) => {
        if (result.status.isInBlock) {
        } else if (result.status.isFinalized) {
          unsub();
          updatePubRefresh();
        }
      });
  }

  function remainBonusItems(nodes){
    let result = [];
    let duplication_keys = [];
    for(let k in nodes) {
      let dynPuzzleStatus = nodes[k].puzzleInfo.dynPuzzleStatus;
      let dynChallengeStatus = nodes[k].puzzleInfo.dynChallengeStatus;
      let dynRaiseDeadline = nodes[k].puzzleInfo.dynRaiseDeadline;
      let dynChallengeDeadline = nodes[k].puzzleInfo.dynChallengeDeadline;
      let remain = false;
      if(dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL" && dynChallengeStatus != "JudgePassed") {
        remain=true;
      }else if(dynChallengeStatus == "JudgeRejected") {
        remain=true;
      }else if(dynChallengeStatus == "RaiseFundsBack") {
        remain=true;
      }else if(dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&
        dynRaiseDeadline == 0 &&
        dynChallengeDeadline <= pubBlockNumber
      ){
        remain=true;
      }else if(dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&
        dynChallengeStatus =="Raise" &&
        dynRaiseDeadline > 0 &&
        dynRaiseDeadline <= pubBlockNumber
      ){
        remain=true;
      }
      if(remain){
        if(nodes[k].puzzleInfoId && !duplication_keys.includes(nodes[k].puzzleInfoId)){
          duplication_keys.push(nodes[k].puzzleInfoId);
          result.push(nodes[k]);
        }
      }
    }
    return result;
  }

  async function loadReleationPuzzles() {
    if (!currentAccountId){
      return;
    }
    //console.log("currentAccount.address = ", currentAccountId);
    apollo_client.query({
      query: gql`
          query{
              atochaUserStruct(id: "${currentAccountId}"){
                  id,
                  ref_create_events(first: 0, last: 10000){
                      nodes{
                          puzzleHash
                      }
                  },
                  ref_answer_events(first: 0, last: 10000,filter:{
                      resultType:{
                          equalTo:"ANSWER_HASH_IS_MATCH"
                      }
                  }){
                      nodes{
                          puzzleInfoId,
                          resultType,
                          whoId,
                          puzzleInfo{
                              dynPuzzleStatus,
                              dynChallengeStatus,
                              dynRaiseDeadline,
                              dynChallengeDeadline
                          }
                      }
                  }
              }
          }
      `
    }).then(result => {
      setRelationInfos(result.data.atochaUserStruct)
    });
  }

  return (
    <div>
      <h1>My account</h1>
      <h3>Basic information</h3>
      <div>
        <div className="ui basic label">Address</div>&nbsp;&nbsp;&nbsp;&nbsp;{currentAccountId}&nbsp;&nbsp;&nbsp;&nbsp;
        <div className="ui basic label">Balance</div>&nbsp;&nbsp;&nbsp;&nbsp;{userBalance?<AtoDeleteThousand withThousand={userBalance} />:'Loading...'}&nbsp;&nbsp;&nbsp;&nbsp;
        <div className="ui basic label">Points</div>&nbsp;&nbsp;&nbsp;&nbsp;{userPoints?<AtoDeleteThousand withThousand={userPoints} />:'Loading...'}
      </div>
      <h3>Account management</h3>
      <div>      
        <ul>
          <li>Browse your account for ATO balance and transactions: <a href={`${config.OCT_EXPLORER}/accounts/${currentAccountId}`} target="_blank">Octopus explorer <i className="external alternate icon"></i></a></li>
          <li>Create new accounts, backup and restore existing accounts: use your PolkadotJS wallet browser extension.</li>
          <li>Transfer ATO to other accounts:  <a href={`${config.POLKADOT_EXPLORE}/?rpc=${config.PROVIDER_SOCKET}#/accounts`} target="_blank">PolkadotJS online wallet <i className="external alternate icon"></i></a></li>
          <li>Bridge ATO from your near accounts: <a href="https://mainnet.oct.network/bridge/near/atocha" target="_blank">Octopus network bridge <i className="external alternate icon"></i></a></li>
        </ul>
      </div>
      <h3>Social connection</h3>
      <div>{currentAccountId?<BindAddressToTwitter ato_address={currentAccountId} displayMode="icon_name_button" />:"Loading..."}</div>
      <h3>As a creator/solver/challenger, claim your ATO from the following puzzles:</h3>
      {relationInfos?
        <Table className="ui very basic celled table" style={{width:"100%"}}>
          <Table.Body>
            <Table.Row>
              <Table.Cell><h4>Related puzzles</h4></Table.Cell>
              <Table.Cell style={{width:"20%"}}><h4>Status</h4></Table.Cell>
              <Table.Cell style={{width:"20%"}}><h4>Action</h4></Table.Cell>
            </Table.Row> 
            {remainBonusItems(relationInfos.ref_answer_events.nodes).map((data, idx)=><Table.Row key={idx}>
              <Table.Cell>
                {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
              </Table.Cell>
              <Table.Cell>
                {data? data.puzzleInfo.dynPuzzleStatus == 'PUZZLE_STATUS_IS_FINAL'?'Claimed':'Ready to claim':'*'}
              </Table.Cell>
              <Table.Cell>
                {data? data.puzzleInfo.dynPuzzleStatus == 'PUZZLE_STATUS_IS_FINAL'?'-':
                  <Button className="ui button small blue" onClick={() => { takeAnswerReward(data.puzzleInfoId) }}>Claim</Button>:'*'}
              </Table.Cell>
            </Table.Row>)}
          </Table.Body>
        </Table>
        :<p>Nothing here.</p>}
    </div>
  );
}

export default function MyHome (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext()
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : <h1>No user infos.</h1>;
}
