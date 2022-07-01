import React,{useEffect,useState} from 'react';
import {Form,Input,Grid,Card,Statistic,TextArea,Label,Table,Container,Button} from 'semantic-ui-react';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";
import config from '../config';

import UserHomeLink from "./UserHomeLink";
import KButton from "./KButton";
import AtoDeleteThousand from "./AtoDeleteThousand";
import {hexToBigInt, hexToString} from "@polkadot/util";
import AtoBlock2Time from "./AtoBlock2Time";
import error_info from "../config/error.json";

var atoReloadTimes=0;

function Main (props) {
  const {api} = useSubstrateState();
  const apollo_client = new ApolloClient({
    uri: config.SUBQUERY_HTTP,
    cache: new InMemoryCache(),
  });  

  const [atoConfigAtochaFinance, setAtoConfigAtochaFinance] = useState(null);
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [previousExchangeInfo, setPreviousExchangeInfo] = useState([]);
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const [previousExchangeRewardEra, setPreviousExchangeRewardEra] = useState(0);
  const [atoAtochaFinanceConfigExchangeEraBlockLength,setAtoAtochaFinanceConfigExchangeEraBlockLength] = useState(-1);
  const [atoAtochaFinanceExchangeRewardEraStartBn, setAtoAtochaFinanceExchangeRewardEraStartBn] = useState(-1);

  const [atoBlockNo, setAtoBlockNo] = useState("-1");  
  const [atoSavedBlockNo, setAtoSavedBlockNo] = useState("-1"); 

  function getBlockNoLinked(){
    api.derive.chain.bestNumber(number => {
      console.log("WeeklyReward.js|main|getBlockNoLinked|derive");
      var bn=number.toString().toLocaleString('en-US');
      setAtoBlockNo(bn);
      if(atoReloadTimes==0){        
        setAtoSavedBlockNo(bn);
        atoReloadTimes=atoReloadTimes+1;        
      }
    }).then().catch(console.error);
  }

  function extractErrorMsg(index, error) {
    if(error_info[index]){
      if(error_info[index][error]){
        return error_info[index][error];
      }
    }
    return null;
  }

  useEffect(() => {
    console.log("WeeklyReward.js|main|useEffect");    
    //alert("WeeklyReward.js|main|useEffect");
    getBlockNoLinked();
    api.query.atochaFinance.atoConfig2().then(res => {
      //console.log("------------------------------",res);
      //console.log("------------------------------",res.toJSON().exchangeEraBlockLength);
      setAtoAtochaFinanceConfigExchangeEraBlockLength(res.toJSON().exchangeEraBlockLength);
      setAtoConfigAtochaFinance(res.toJSON());
    });    
    api.query.atochaFinance.pointExchangeInfo(currentExchangeRewardEra).then(res => {
      //console.log('exchangeInfo current = ', res.toHuman());
      //alert("pointExchangeInfo...current...done");
      setExchangeInfo(res.toHuman());
      //console.log("WeeklyReward.js|main|useEffect|pointExchangeInfo|currentExchangeRewardEra"); 
    });
    api.query.atochaFinance.pointExchangeInfo(previousExchangeRewardEra).then(res => {
      //console.log('exchangeInfo previous = ', res.toHuman());
      //alert("pointExchangeInfo...previous...done");
      setPreviousExchangeInfo(res.toHuman());
      //console.log("WeeklyReward.js|main|useEffect|pointExchangeInfo|previousExchangeRewardEra"); 
    });
    //alert("WeeklyReward.js|main|useEffect|44");
    api.query.atochaFinance.currentExchangeRewardEra((era_opt) => {
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
        setPreviousExchangeRewardEra(era_opt.value.toNumber()-1)
      }
    });
    api.query.atochaFinance.exchangeRewardEraStartBn(currentExchangeRewardEra).then(res => {
      setAtoAtochaFinanceExchangeRewardEraStartBn(res.toJSON());
    });
  },[api.query.atochaFinance.pointExchangeInfo, currentExchangeRewardEra,previousExchangeRewardEra,atoReloadTimes]);

  function handlerEvent(section, method, statusCallBack, data) {
    if(section == 'atochaFinance' &&  method == 'ApplyPointReward') {
      //console.log("ApplyTokenReward.js|handlerEvent|data",data);
      statusCallBack(1,"😉 Done.");      
      atoReloadTimes=0;
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error);
      if(failedMsg) {
        if(failedMsg=="TooFewPoints"){
          statusCallBack(2, "You do not have enough points.");                    
        }
        else{
          statusCallBack(2, `${failedMsg}`)  
        }        
      }else{
        statusCallBack(2, "Unknown Mistake")
      }
    }
  }

  function preCheckCall(buttonKey, currentStatus, statusCallBack) {  
    //console.log("currentStatus=", currentStatus);
    if(currentStatus == 3) {
      alert('Wait for pending process.');
      return false;
    }
    statusCallBack(0, "Submitting...");
    return true;
  }

  return (
    <div>
      <h1>Weekly Reward & Atocha Points Leaderboard</h1>
      <div className="ui two column stackable grid">
        <div className="eleven wide column">
          <h3>Weekly Reward guideline</h3>
          <ul>
          <li>The top 5 Atocha Points Leaderboard players who have already submitted their requests within the specific reward week will receive the weekly ATO reward automatically at the end of the reward week.</li>
          <li>The reward distribution will be based on the total Atocha Points of the top 5 players and distributed in pro-rate. Once ATO reward is sent to the winner, the Atocha Points of the winner will be cleared to zero.</li>
          <li>If you would like to win the ATO reward in the specific reward week, you will need to submit the request within the specific reward week.</li>
          <li> Anyone with positive points can submit their requests. </li>
          <li>You can request at any day of the reward week even you are not on the top 5 ranking yet. By end of the reward week, the protocol will distribute the reward automatically to you if you ended up at the top 5 leaderboard. </li>
          <li>When you submitted request but dropped from top 5 leaderboard by the end of the reward week, you will not be receiving the ATO rewards.</li>
          </ul>
        </div>
        <div className="five wide column">
          <h3>Weekly Reward parameters</h3>
          <ul>
            <li>ATO reward per block: <br/><span style={{fontSize:"125%"}}>{atoConfigAtochaFinance?(parseFloat(hexToBigInt(atoConfigAtochaFinance.issuancePerBlock)/BigInt(10**14)).toString())/10000:"Loading..."}</span></li>
            <li>Reward era length: <br/><span style={{fontSize:"125%"}}>{atoConfigAtochaFinance?atoConfigAtochaFinance.exchangeEraBlockLength:"Loading..."}</span> blocks<br/>1 block = 6 seconds, {atoConfigAtochaFinance?atoConfigAtochaFinance.exchangeEraBlockLength:"Loading..."} blocks = {atoConfigAtochaFinance?<AtoBlock2Time bigBlock={atoConfigAtochaFinance.exchangeEraBlockLength} smallBlock="0" />:""}</li>
            <li>ATO reward per era: <br/><span style={{fontSize:"125%"}}>{atoConfigAtochaFinance?Math.ceil((parseInt(hexToBigInt(atoConfigAtochaFinance.issuancePerBlock)/BigInt(10**14)).toString())/10000*atoConfigAtochaFinance.exchangeEraBlockLength):"Loading..."}</span></li>
            <li>Total winners: <br/><span style={{fontSize:"125%"}}>{atoConfigAtochaFinance?atoConfigAtochaFinance.exchangeMaxRewardListSize:"Loading..."}</span></li>            
          </ul>
        </div>        
      </div>

      <h3>Atocha Points Leaderboard of current reward era (week {currentExchangeRewardEra})</h3>
      <p>Current reward era (week {currentExchangeRewardEra}), from Block {atoAtochaFinanceExchangeRewardEraStartBn} to Block {atoAtochaFinanceExchangeRewardEraStartBn+atoAtochaFinanceConfigExchangeEraBlockLength}, <AtoBlock2Time bigBlock={atoAtochaFinanceExchangeRewardEraStartBn+atoAtochaFinanceConfigExchangeEraBlockLength} smallBlock={atoSavedBlockNo} /> left</p>
      {exchangeInfo.length>0?
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell><strong>Player</strong></Table.Cell>
            <Table.Cell style={{width:"25%"}}><strong>Points</strong></Table.Cell>
          </Table.Row>
          {exchangeInfo.map((infoData,idx) => <Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={infoData[0]} /></Table.Cell>
            <Table.Cell><AtoDeleteThousand withThousand={infoData[1]} /></Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
      :<p>No one submitted yet. Be the first one.</p>}
      <div style={{textAlign:"left",marginBottom:"3rem"}}>
      <div style={{margin:"auto"}}>
      <Form>
        <Form.Field style={{ textAlign: 'left' }}>
          <KButton
            label={`Submit your request`}
            type={`SIGNED-TX`}
            attrs={{
              palletRpc: 'atochaFinance',
              callable: 'applyPointReward',
              inputParams: [],
              paramFields: [],
            }}
            buttonKey={'atochaFinance_applyPointReward_onClick'}
            preCheckCall= {preCheckCall}
            handlerEvent= {handlerEvent}
          />            
        </Form.Field>
        <Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form.Field>
      </Form>
      </div>
      </div>
      <h3>Atocha Points Leaderboard of previous reward era (week {previousExchangeRewardEra})</h3>
      {previousExchangeInfo.length>0?
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell><strong>Player</strong></Table.Cell>
            <Table.Cell style={{width:"25%"}}><strong>Points</strong></Table.Cell>
            <Table.Cell style={{width:"15%"}}><strong>Proportion</strong></Table.Cell>
            <Table.Cell style={{width:"25%"}}><strong>Received token rewards</strong></Table.Cell>
          </Table.Row>
          {previousExchangeInfo.map((infoData, idx) => <Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={infoData[0]} /></Table.Cell>
            <Table.Cell><AtoDeleteThousand withThousand={infoData[1]} /></Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].proportion?infoData[2].proportion:'@Error@':'@Error@'}</Table.Cell>
            <Table.Cell>{infoData[2]?infoData[2].takeToken?<AtoDeleteThousand withThousand={infoData[2].takeToken} />:'@Error@':'@Error@'}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
      :<p>Nothing found.</p>}
      <br/>
      <div style={{textAlign:"right"}}><i>This page was generated at Block {atoSavedBlockNo}, current block number is {atoBlockNo}</i></div>
    </div>
  );
}

export default function WeeklyReward (props) {
  return <Main {...props} />;
}
