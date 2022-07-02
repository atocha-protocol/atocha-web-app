import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table} from 'semantic-ui-react';
import config from '../config';
import axios from "axios";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import PuzzleList from "./PuzzleList";
import {gql} from "@apollo/client";
import StepCase from "../Step/StepCase";

import {
    useParams
} from "react-router-dom";
import PuzzleAnswer from "./PuzzleAnswer";
import AnswerList from "./AnswerList";
import ChallengeList from "./ChallengeList";
import SponsorList from "./SponsorList";
import {useAtoContext} from "./AtoContext";
import {useSubstrateState} from "../substrate-lib";
import UserHomeLink from "./UserHomeLink";
import AtoBlock2Time from "./AtoBlock2Time";
import AtoBlockWithLink from "./AtoBlockWithLink";

function Main (props) {
  const {apollo_client, gql, puzzleSets: {pubRefresh} , chainData: {pubBlockNumber}, } = useAtoContext();
  const {puzzle_hash} = useParams();
  const request = `${config.ARWEAVE_EXPLORE}/${puzzle_hash}`;
  const [arweaveInfo, setArweaveInfo] = useState(null);
  const [puzzleInfo, setPuzzleInfo] = useState(null);
  const [depositInfo, setDepositInfo] = useState([]);
  const [matchAnswerBn, setMatchAnswerBn] = useState(BigInt(0));
  const [financeConfig, setFinanceConfig] = useState(null);
  const [atoIfShowFull, setAtoIfShowFull] = useState(0);
  //alert(pubBlockNumber);


  // load json data.
  function loadJsonData() {
    axios.get(request, {}).then(function (response) {
      //console.log(response.data);
      setArweaveInfo(response.data);
    }).catch(function (error) {
      console.log(error);
    });
  }

  async function loadMatchAnswerBn() {
    //alert("PuzzleDetail.js|main|loadMatchAnswerBn");
    //console.log("PuzzleDetail.js|main|loadMatchAnswerBn");
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
          query{
              answerCreatedEvents(last:9999,filter:{
                  puzzleInfoId: {
                      equalTo: "${puzzle_hash}",
                  }
              }){
                  nodes{
                      id,
                      resultType,
                      eventBn
                  }
              }
          }
      `
    }).then(result => {
      //alert("PuzzleDetail.js|main|loadMatchAnswerBn|result|result.data.answerCreatedEvents.nodes.length="+result.data.answerCreatedEvents.nodes.length);
      if(result.data.answerCreatedEvents.nodes.length > 0) {
        for(const idx in result.data.answerCreatedEvents.nodes) {
          const answerData = result.data.answerCreatedEvents.nodes[idx]
          if(answerData.resultType == "ANSWER_HASH_IS_MATCH"){
            setMatchAnswerBn(BigInt(answerData.eventBn));
            //alert("PuzzleDetail.js|main|loadMatchAnswerBn|result|resultType="+answerData.resultType);
            //console.log("PuzzleDetail.js|main|loadMatchAnswerBn|matchAnswerBn",matchAnswerBn);
          }
        }
      }
    });
  }

  async function loadDepositInfo() {
      if (!puzzle_hash){
        return;
      }
      apollo_client.query({
        query: gql`
            query{
                puzzleDepositEvents(filter:{
                    puzzleInfoId: {
                        equalTo: "${puzzle_hash}"
                    }
                }){
                    nodes{
                        id,
                        whoId,
                        deposit,
                        eventBn,
                    }
                }
            }
        `
      }).then(result => {
        if(result.data.puzzleDepositEvents.nodes.length > 0) {
          // console.log("result.puzzleCreatedEvents. = ",result.data.puzzleCreatedEvents.nodes[0].eventBn ); // puzzle-onchain infos
          setDepositInfo(result.data.puzzleDepositEvents.nodes);
        }
      });
  }

  async function loadPuzzleInfoOnChain() {
      //alert("loadPuzzleInfoOnChain");
      if (!puzzle_hash){
        return;
      }
      apollo_client.query({
        query: gql`
            query{
                puzzleCreatedEvents (
                    filter:{
                        puzzleHash:{
                            equalTo:"${puzzle_hash}"
                        }
                    }
                ) {
                    nodes{
                        id,
                        whoId,
                        puzzleHash,
                        eventBn,
                        dynPuzzleStatus,
                        dynChallengeStatus,
                        dynChallengeDeadline,
                        dynRaiseDeadline,
                        dynTotalDeposit,
                        dynHaveMatchedAnswer,
                    }
                }
            }
        `
      }).then(result => {
        if(result.data.puzzleCreatedEvents.nodes.length == 1) {
          // console.log("result.puzzleCreatedEvents. = ",result.data.puzzleCreatedEvents.nodes[0].eventBn ); // puzzle-onchain infos
          console.log("@@@@@@@@@@PuzzleDetail_loadPuzzleInfoOnChain",result.data.puzzleCreatedEvents.nodes[0]);
          setPuzzleInfo(result.data.puzzleCreatedEvents.nodes[0]);
        }
      });
  }

  function getPuzzleStatus(infoObj) {
      //alert("getPuzzleStatus");
      //console.log("pubBlockNumber = ", pubBlockNumber, `infoObj.dynHaveMatchedAnswer = ${infoObj.dynHaveMatchedAnswer}`);
      //console.log(`${BigInt(infoObj.dynChallengeDeadline)} > ${BigInt(pubBlockNumber)} || ${BigInt(infoObj.dynRaiseDeadline)} > ${BigInt(pubBlockNumber)}`)
      if(infoObj.dynHaveMatchedAnswer == false) {
        return "UNSOLVED"
      }else if(
        infoObj.dynHaveMatchedAnswer == true &&
        ( BigInt(infoObj.dynChallengeDeadline) > BigInt(pubBlockNumber) || BigInt(infoObj.dynRaiseDeadline) > BigInt(pubBlockNumber) )  &&
        infoObj.dynChallengeStatus == "Raise"
      ) {
        return "CHALLENGABLE"
      }else if (
        ( infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL" && infoObj.dynChallengeStatus != "JudgePassed" ) ||
        ( infoObj.dynChallengeStatus == "JudgeRejected" ) ||
        ( infoObj.dynChallengeStatus == "RaiseFundsBack" ) ||
        ( infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&  infoObj.dynRaiseDeadline == 0 &&  BigInt(infoObj.dynChallengeDeadline) < BigInt(pubBlockNumber) ) ||
        ( infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&  infoObj.dynChallengeStatus == "Raise" && BigInt(infoObj.dynRaiseDeadline) > BigInt(0) && BigInt(infoObj.dynRaiseDeadline) < BigInt(pubBlockNumber) )
      ) {
        return "SOLVED"
      } else if ( infoObj.dynChallengeStatus == "JudgePassed" ) {
        return "INVALID"
      }else if ( infoObj.dynChallengeStatus == "RaiseCompleted" ) {
        return "JUDGING"
      }
      return "Error status."
  }

  function getEstimatedPoints(infoObj, preBn) {

      if( parseInt(preBn) <= 0) {
        return "System parameter error!"
      }

      if(depositInfo.length == 0 || !infoObj){
        return "Loading..."
      }

      let finalPointBn = pubBlockNumber
      if(infoObj.dynHaveMatchedAnswer == true) {
        finalPointBn = matchAnswerBn
      }

      let sumPoint = BigInt(0);
      for( const idx in depositInfo ) {
        // deposit: "300000000000000000000"
        // eventBn: "454081"
        // id: "454081-3"
        // whoId: "5Dth1UgcLMRYFyv6ykLTwmCpZC45uL1bmJ7S7uEvfLdu8y3f"
        const sponsorData = depositInfo[idx]
        //console.log("@@@@@@@@@@@@@@@@@@@@@PuzzleDetail.js|main|getEstimatedPoints|sponsorData",sponsorData);
        const diff = BigInt(finalPointBn) - BigInt(sponsorData.eventBn)
        const pointNum = diff * BigInt(1000) / BigInt(preBn) / BigInt(1000) * BigInt(sponsorData["deposit"]);
        //console.log("@@@@@@@@@@@@@@@@@@@@@PuzzleDetail.js|main|getEstimatedPoints|sponsorData","deposit="+sponsorData["deposit"],"finalPointBn="+finalPointBn,"diff="+diff,"pointNum="+pointNum);
        sumPoint+=pointNum;
      }
      sumPoint=sumPoint/BigInt(10**18);
      //console.log("sumPoint = ", sumPoint)
      if(infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL") {
        return sumPoint.toString()+" (claimed)";
      }
      else{
        return sumPoint.toString();  
      }      
  }

  var atoIfRemoteJsLoaded=false;
  if(typeof(atoFeatured)=="undefined" || typeof(atoIframe)=="undefined"){
    
  }
  else{
    atoIfRemoteJsLoaded=true;
  }

  // Puzzle information.
  useEffect(async () => {
        //alert("3222e");
        //console.log("PuzzleDetail.js|main|useEffect");
        if(arweaveInfo===null) {
            loadJsonData();
        }
        // atochaFinance.atoConfig2
        if(financeConfig == null) {
          const conf1 = await api.query.atochaFinance.atoConfig2()
          setFinanceConfig(conf1.toJSON());
        }
        loadPuzzleInfoOnChain()
        loadDepositInfo()
        loadMatchAnswerBn()
  }, [setArweaveInfo, setPuzzleInfo, pubRefresh]);

  //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",puzzleInfo);

  function atoShowIframe(){

  }

  function handleOpenFull(){
    setAtoIfShowFull(1);
  }

  function handleCloseFull(){
    setAtoIfShowFull(0);
  }
  //alert(puzzle_hash.slice(-6));
  return (
    <div>
    <div className="ui two column stackable grid">
      <div className="ten wide column">
        <h1 className="1ReSeTs_puzzleDetail_h1">{arweaveInfo?arweaveInfo.puzzle_title:'Loading...'}</h1>

        {arweaveInfo?arweaveInfo.puzzle_content.map((body, idx) => <div key={idx}>
          {body.type?body.type === 'file'?<div><img src={body.data} style={{'max-width':'100%'}} /><br/><br/></div>:'':''}
        </div>):'Loading...'}

        <div>Puzzle hash: {puzzleInfo?.puzzleHash}</div>
        <div>Creator: <UserHomeLink user_address={puzzleInfo?.whoId} /></div>
        <div>Created: <AtoBlock2Time bigBlock={pubBlockNumber} smallBlock={puzzleInfo?.eventBn} /> ago on <AtoBlockWithLink blockNo={puzzleInfo?.eventBn}  /></div>
        <div>Total prize: <strong>{puzzleInfo?.dynTotalDeposit/(10**18)}</strong>&nbsp;&nbsp;<i style={{cursor:"pointer"}} className="question circle outline icon" title="Total prize is a sum of all sponsored tokens."></i></div>
        <div title={`Points reward era length = ${financeConfig?financeConfig.pointRewardEpochBlockLength:"loading..."} blocks`}>Estimated points: <strong>{puzzleInfo?getEstimatedPoints(puzzleInfo, financeConfig?financeConfig.pointRewardEpochBlockLength:0):'Loading...'}</strong>&nbsp;&nbsp;<i style={{cursor:"pointer"}} className="question circle outline icon" title="1 ATO sponsored for 1 Day will contribute 1 POINT."></i></div>
        <div>Puzzle status:&nbsp;&nbsp;
        {puzzleInfo?(
          (getPuzzleStatus(puzzleInfo)=="UNSOLVED")?<div className="ui tiny yellow label">UNSOLVED</div>:
          (getPuzzleStatus(puzzleInfo)=="CHALLENGABLE")?<div className="ui tiny orange label">CHALLENGABLE</div>:
          (getPuzzleStatus(puzzleInfo)=="SOLVED")?<div className="ui tiny violet label">SOLVED</div>:
          (getPuzzleStatus(puzzleInfo)=="JUDGING")?<div className="ui tiny grey label">JUDGING</div>:
          (getPuzzleStatus(puzzleInfo)=="INVALID")?<div className="ui tiny black label">INVALID</div>:
          <div className="ui tiny label">UNKNOWN</div>
          ):""}
        </div>
        <br/>

        {arweaveInfo?arweaveInfo.puzzle_content.map((body, idx) => <div key={idx}>
          {body.type?body.type === 'text'?<h3 style={{lineHeight:'150%'}}>{body.data}</h3>:'':''}
        </div>):'Loading...'}<br/>

        {atoIfRemoteJsLoaded?typeof(atoIframe[puzzle_hash])!="undefined"?
        <a style={{cursor:"pointer"}} onClick={()=>handleOpenFull()}><i className="expand arrows alternate icon"></i> Enter full screen</a>
        :
        <></>
        :
        <></>
        }

        {atoIfShowFull==1?
        <div>  
          <iframe src={atoIframe[puzzle_hash]} className="ReSeTs_fixedFull" ></iframe>
          <div className="ReSeTs_fixedRight">
            <h1 className="1ReSeTs_puzzleDetail_h1">{arweaveInfo?arweaveInfo.puzzle_title:'Loading...'}</h1>
            {arweaveInfo?arweaveInfo.puzzle_content.map((body, idx) => <div key={idx}>
              {body.type?body.type === 'text'?<h3 style={{lineHeight:'150%'}}>{body.data}</h3>:'':''}
            </div>):'Loading...'}
            <AnswerList puzzle_hash={puzzle_hash} puzzle_status={puzzleInfo?getPuzzleStatus(puzzleInfo):'Loading...'} />
            <a style={{color:"white",cursor:"pointer"}} onClick={()=>handleCloseFull()}><i className="compress icon"></i> Exit full screen</a>
          </div>          
        </div>
        :<></>}
        
        <br/><div className="ui divider"></div>

        <h1 className="1ReSeTs_puzzleDetail_h2">>> Solve it</h1>
        <AnswerList puzzle_hash={puzzle_hash} puzzle_status={puzzleInfo?getPuzzleStatus(puzzleInfo):'Loading...'} />
        <br/><div className="ui divider"></div>
         
        <h1 className="1ReSeTs_puzzleDetail_h2">>> Challenge it</h1>
        <ChallengeList puzzle_hash={puzzle_hash} puzzle_status={puzzleInfo?getPuzzleStatus(puzzleInfo):'Loading...'} puzzle_prize={puzzleInfo?puzzleInfo.dynTotalDeposit:0} puzzle_challengeDeadline1={puzzleInfo?puzzleInfo.dynChallengeDeadline:0} puzzle_challengeDeadline2={puzzleInfo?puzzleInfo.dynRaiseDeadline:0}  atoConfigChallengeTarget={financeConfig?financeConfig.challengeThreshold:-1} />
      </div>
      <div className="six wide column">
        <h1 className="1ReSeTs_puzzleDetail_h2">>> Sponsor it</h1>
        <SponsorList puzzle_hash={puzzle_hash} puzzle_status={puzzleInfo?getPuzzleStatus(puzzleInfo):'Loading...'} />
      </div>
    </div>
    <br/><div className="ui divider"></div>
    <h1 className="1ReSeTs_puzzleDetail_h2" style={{textAlign:"center"}}>FAQ of How to Earn?</h1><br/>
    <div className="ui two column stackable grid">
      <div className="four wide column">
<h3>How to earn as a Creator?</h3>
<ul>
<li>Create a valid puzzle with sufficient sophistication to be unsolved for 24 hours.</li>
<li>Earn Atocha Points generated by the puzzle after 24 hours and received Atocha Points once puzzle solved.</li>
<li>Use Atocha Points to apply and win the weekly ATO rewards.</li>
</ul>
      </div>
      <div className="four wide column">
<h3>How to earn as a Solver?</h3>
<ul>
<li>Solve a puzzle and win the ATO and Atocha Points within the puzzle.</li>
<li>Use Atocha Points to apply and win the weekly ATO rewards.</li>
</ul>
<h3>Can I solve a puzzle I created?</h3>
Yes, you can. The main consideration that such behavior is allowed is as follow:
<ul>
<li>People want to know the answer of a puzzle, especially a good one.</li>
<li>Creator intends to close the puzzle and pursue the next puzzle creation, by solving the puzzle created, the Creator can unlock the ATO and proceed to use for the next puzzle creation.</li>
</ul>
      </div>
      <div className="four wide column">
<h3>How to earn as a Challenger?</h3>
<ul>
<li>Always on the look out for non-qualifying answers (as suggested by the guidelines) or non-related answers for the Challengable Puzzles.</li>
<li>Deposit sufficient ATO to challenge the in dispute puzzle.</li>
<li>Once judging stated that the challenged puzzle is INVALID, the Challenger will receive the puzzle's ATO.</li>
</ul>
      </div>
      <div className="four wide column">
<h3>What can I get as a Sponsor?</h3>
By sponsoring the puzzle, you can:
<ul>
<li>Increase the total prize of the puzzle.</li>
<li>Leave a short message from you to other players.</li>
<li>Publish image/video with link that drives traffic to you for brand awareness, lead generation, potential conversion and sales.(Coming soon...)</li>
</ul>
      </div>
    </div>
    </div>
  );
}

export default function PuzzleDetail (props) {
    const { api } = useSubstrateState();
    const { apollo_client, gql } = useAtoContext()
    return api.query && apollo_client && gql
        ? <Main {...props} />
        : null;
}
