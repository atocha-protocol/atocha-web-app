  import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Button} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import ArweaveTitle from "./ArweaveTitle";
import config from "../config";
import PuzzleAnswer from "./PuzzleAnswer";
import PuzzleCommitChallenge from "./PuzzleCommitChallenge";
import {useAtoContext} from "./AtoContext";
import PuzzleChallengeRaising from "./PuzzleChallengeRaising";
import {Link} from "react-router-dom";
import {
  useParams
} from "react-router-dom";
import PuzzleDetailLink from "./PuzzleDetailLink";
import {web3FromSource} from "@polkadot/extension-dapp";
import AtoDeleteThousand from "./AtoDeleteThousand";
import BindAddressToTwitter from "./BindAddressToTwitter";

function Main (props) {
  const { api, currentAccount } = useSubstrateState('');
  const { puzzle_hash } = props;
  const { account_id } = useParams();

  const { apollo_client, gql, puzzleSets:{usedSmoothStatus, fillCurrentAccountIdWithSmooth, loadAccountPoints, currentAccountAddress, setCurrentAccountAddress, rebirthAccount, rebirthDone, used3Account}, chainData: {pubBlockNumber, updatePubRefresh, userPoints} } = useAtoContext()

  // Atocha user information.
  const [userBalance, setUserBalance] = useState(null);
  const [relationInfos, setRelationInfos] = useState(null);

  const [atoPuzzleCreated, setAtoPuzzleCreated] = useState([]);
  const [atoPuzzleSolved, setAtoPuzzleSolved] = useState([]);
  const [atoPuzzleChallenged, setAtoPuzzleChallenged] = useState([]);
  const [atoPuzzleSponsored, setAtoPuzzleSponsored] = useState([]);
  const [pageAccount, setPageAccount] = useState(null);
  
  useEffect( () => {
    console.log("UserHome useEffect.")
    async function fetchData() {
      await rebirthAccount()
      console.log('UserHome rebirthAccount A', currentAccountAddress, usedSmoothStatus, used3Account, currentAccount, rebirthDone)
      console.log("DEBUG :  account_id === ", account_id)
      let _pageAccount = currentAccountAddress
      if(setCurrentAccountAddress && account_id && account_id!='self') {
        _pageAccount = account_id
      }

      setPageAccount(_pageAccount)

      console.log('Page account :: ', _pageAccount)
      loadAccountBalance(_pageAccount);
      await loadAccountPoints(_pageAccount);
      await loadReleationPuzzles(_pageAccount);
    }
    fetchData()
  }, [rebirthDone]); // [used3Account, userBalance, pubBlockNumber]

  function getDistinctPuzzleList(inputArr){
    //alert("in="+inputArr.length);
    var pl=new Array();
    var i=0;            
    for(i=0;i<inputArr.length;i++){
      pl[i]=new Object();
      pl[i]["puzzleInfoId"]=inputArr[i]["puzzleInfoId"];
    }
    pl.sort(function(a,b){
     return b.puzzleInfoId>a.puzzleInfoId
    });
    //return pl;

    var pll=new Array();
    var ii=0;            
    for(i=0;i<pl.length;i++){
      if(i==0){
        pll[ii]=new Object();
        pll[ii]["puzzleInfoId"]=pl[i]["puzzleInfoId"];
        ii++;
      }
      else{
        if(pl[i]["puzzleInfoId"]==pl[i-1]["puzzleInfoId"]){
        }
        else{
          pll[ii]=new Object();
          pll[ii]["puzzleInfoId"]=pl[i]["puzzleInfoId"];
          ii++;
        }
      }
    }
    //alert("out="+pll.length);
    return pll;
  }

  // function fillCurrentAccountId(){
  //   console.log("DEBUG :  account_id === ", account_id)
  //   console.log("DEBUG : currentAccountAddress == ", currentAccountAddress)
  //
  //   if(account_id == 'self') {
  //     console.log('used3Account.address= 1', currentAccountAddress)
  //     setCurrentAccountId(currentAccountAddress);
  //   } else if (account_id=='' || account_id==null || typeof(account_id)=="undefined"){
  //     console.log('used3Account.address= 2', currentAccountAddress)
  //     setCurrentAccountId(currentAccountAddress);
  //     console.log('used3Account.address= 2.1')
  //   } else {
  //     console.log('##### SET gusid', account_id)
  //     setCurrentAccountId(account_id);
  //   }
  // }


  function loadAccountBalance(acc) {
    console.log('loadAccountBalance , ', acc)
    acc &&
    api.query.system
      .account(acc, balance =>{
          setUserBalance(balance.data.free.toHuman());
      }) .then(unsub => {
    }) .catch(console.error)
  }

  // const getFromAcct = async () => {
  //   const {
  //     address,
  //     meta: { source, isInjected }
  //   } = used3Account;
  //   let fromAcct;
  //   if (isInjected) {
  //     const injected = await web3FromSource(source);
  //     fromAcct = address;
  //     api.setSigner(injected.signer);
  //   } else {
  //     fromAcct = accountPair;
  //   }
  //   return fromAcct;
  // };

  // async function takeAnswerReward(hash) {
  //   const fromAcct = await getFromAcct();
  //   //console.log(fromAcct);
  //   const unsub = await api.tx.atochaModule
  //     .takeAnswerReward(hash)
  //     .signAndSend(fromAcct, (result) => {
  //       // setStatus(`submit status: ${result.status}`);
  //       if (result.status.isInBlock) {
  //         // setStatus(`submit status: ${result.status} - ${result.status.asInBlock}`);
  //       } else if (result.status.isFinalized) {
  //         // setStatus(`submit status: ${result.status} - ${result.status.asFinalized}`);
  //         unsub();
  //         updatePubRefresh();
  //       }
  //     });
  // }

  // function remainBonusItems(nodes){
  //   let result = [];
  //   let duplication_keys = [];
  //   for(let k in nodes) {
  //     let dynPuzzleStatus = nodes[k].puzzleInfo.dynPuzzleStatus;
  //     let dynChallengeStatus = nodes[k].puzzleInfo.dynChallengeStatus;
  //     let dynRaiseDeadline = nodes[k].puzzleInfo.dynRaiseDeadline;
  //     let dynChallengeDeadline = nodes[k].puzzleInfo.dynChallengeDeadline;
  //     let remain = false;
  //     if(dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL" && dynChallengeStatus != "JudgePassed") {
  //       remain=true;
  //     }else if(dynChallengeStatus == "JudgeRejected") {
  //       remain=true;
  //     }else if(dynChallengeStatus == "RaiseFundsBack") {
  //       remain=true;
  //     }else if(dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&
  //       dynRaiseDeadline == 0 &&
  //       dynChallengeDeadline <= pubBlockNumber
  //     ){
  //       remain=true;
  //     }else if(dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&
  //       dynChallengeStatus =="Raise" &&
  //       dynRaiseDeadline > 0 &&
  //       dynRaiseDeadline <= pubBlockNumber
  //     ){
  //       remain=true;
  //     }
  //     if(remain){
  //       if(nodes[k].puzzleInfoId && !duplication_keys.includes(nodes[k].puzzleInfoId)){
  //         duplication_keys.push(nodes[k].puzzleInfoId);
  //         result.push(nodes[k]);
  //       }
  //     }
  //   }
  //   return result;
  // }

  function filterNotMatcha(nodes) {
    //return nodes;
    const resultArr = []
    for(const idx in nodes) {
      //console.log("XXXXXXXXX",nodes[idx].puzzleInfoId,nodes[idx].puzzleInfo.dynPuzzleStatus,nodes[idx].resultType);
      if(
        //nodes[idx].puzzleInfo.dynPuzzleStatus == 'PUZZLE_STATUS_IS_SOLVED' &&
        nodes[idx].resultType == 'ANSWER_HASH_IS_MATCH'
      ) {
        resultArr.push(nodes[idx]);
        //console.log("XXXXXXXXX",nodes[idx].puzzleInfoId,nodes[idx].puzzleInfo.dynPuzzleStatus,nodes[idx].resultType);
      }
    }
    return resultArr
  }

  async function loadReleationPuzzles(acc) {
    console.log('loadReleationPuzzles', acc)
    if (!acc){
      return;
    }

    apollo_client.query({
      query: gql`
          query{
              atochaUserStruct(id: "${acc}"){
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
                  },
                  ref_challenge_depoist_events(first: 0, last: 10000){
                      nodes{
                          puzzleInfoId,
                          depositType
                      }
                  },
                  ref_deposit_events(first: 0, last: 10000){
                      nodes{
                          puzzleInfoId,
                          kind
                      }
                  }
              }
          }
      `
    }).then(result => {
      setRelationInfos(result.data.atochaUserStruct);
      console.log("==========UserHome.js|main|loadReleationPuzzles|result.data.atochaUserStruct",result.data.atochaUserStruct);
      //setAtoPuzzleSolved(getDistinctPuzzleList(result.data.atochaUserStruct.ref_answer_events.nodes));
      setAtoPuzzleChallenged(getDistinctPuzzleList(result.data.atochaUserStruct.ref_challenge_depoist_events.nodes));
      setAtoPuzzleSponsored(getDistinctPuzzleList(result.data.atochaUserStruct.ref_deposit_events.nodes));      
    });
  }

  return (
    <div>
      <h1>Player profile</h1>
      <div style={{textAlign:"center"}}>
        {pageAccount?<BindAddressToTwitter ato_address={pageAccount} displayMode="icon_name" />:"Loading..."}
        <h3 style={{lineHeight:"150%",marginTop:"6px"}}>{pageAccount?(<span>{pageAccount}&nbsp;&nbsp;<a href={`${config.OCT_EXPLORER}/accounts/${pageAccount}`} target='_blank'><i className="external alternate icon"></i></a></span>):'loading...'}<br/>Points: {userPoints?<AtoDeleteThousand withThousand={userPoints} />:'Loading...'}</h3>
      </div>
      <br/>
      <div className="ui stackable four column grid">
        <div className="column">
          <h2>>> Created</h2>
          {relationInfos?
          <ul>
            {relationInfos.ref_create_events.nodes.map((data, idx)=><li key={idx}>
              {data?<ArweaveTitle  puzzle_hash={data.puzzleHash} /> : '*'}
            </li>)}
          </ul>
          :"Nothing here."}        
        </div>
        {/*<li key={idx}>*/}
        {/*  {data?<><ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> </> : '*'}*/}
        {/*</li>*/}

        <div className="column">
          <h2>>> Solved</h2>
          {relationInfos?
          <ul>
            {filterNotMatcha(relationInfos.ref_answer_events.nodes).map((data, idx)=><li key={idx}>
              {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
            </li>)}
          </ul>
          :"Nothing here."}        
        </div>
        <div className="column">
          <h2>>> Challenged</h2>
          {relationInfos?
          <ul>
            {atoPuzzleChallenged.map((data, idx)=><li key={idx}>
              {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
            </li>)}
          </ul>
          :"Nothing here."}          
        </div>
        <div className="column">
          <h2>>> Sponsored</h2>
          {relationInfos?
          <ul>
            {atoPuzzleSponsored.map((data, idx)=><li key={idx}>
              {data?<ArweaveTitle  puzzle_hash={data.puzzleInfoId} /> : '*'}
            </li>)}
          </ul>
          :"Nothing here."}          
        </div>
      </div>
    </div>
  );
}

export default function UserHome (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext()
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : <h1>No user infos.</h1>;
}
