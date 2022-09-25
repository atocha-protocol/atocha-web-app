import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Container } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";
import KButton from "./KButton";
import AtoDeleteThousand from "./AtoDeleteThousand";
import {hexToBigInt, hexToString} from "@polkadot/util";
import AtoBlock2Time from "./AtoBlock2Time";


function Main (props) {
  const { api, currentAccount } = useSubstrateState('');
  const { chainData: {userPoints,pubBlockNumber},puzzleSets: {pubRefresh, updatePubRefresh, isOpenSmooth, loadAccountPoints, fillCurrentAccountIdWithSmooth}, extractErrorMsg} = useAtoContext()
  // Puzzle information.
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [previousExchangeInfo, setPreviousExchangeInfo] = useState([]);

  const [status, setStatus] = useState(null);
  const [lastUpBn, setLastUpBn] = useState('*');
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const [previousExchangeRewardEra, setPreviousExchangeRewardEra] = useState(0);
  
  const [atoConfigAtochaFinance, setAtoConfigAtochaFinance] = useState(null);

  const [atoAtochaFinanceConfigExchangeEraBlockLength,setAtoAtochaFinanceConfigExchangeEraBlockLength] = useState(-1);

  const [atoAtochaFinanceExchangeRewardEraStartBn, setAtoAtochaFinanceExchangeRewardEraStartBn] = useState(-1);
  
  useEffect(async () => {
    api.query.atochaFinance.pointExchangeInfo(currentExchangeRewardEra).then(res => {
      console.log('exchangeInfo current = ', res.toHuman());
      setExchangeInfo(res.toHuman());
    });
    api.query.atochaFinance.pointExchangeInfo(previousExchangeRewardEra).then(res => {
      console.log('exchangeInfo previous = ', res.toHuman());
      setPreviousExchangeInfo(res.toHuman());
    });
    api.query.atochaFinance.currentExchangeRewardEra((era_opt) => {
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
        setPreviousExchangeRewardEra(era_opt.value.toNumber() - 1)
      }
    });

    api.query.atochaFinance.atoConfig2().then(res => {
      console.log("------------------------------", res);
      console.log("------------------------------", res.toJSON().exchangeEraBlockLength);
      setAtoAtochaFinanceConfigExchangeEraBlockLength(res.toJSON().exchangeEraBlockLength);
      setAtoConfigAtochaFinance(res.toJSON());
    });

    api.query.atochaFinance.exchangeRewardEraStartBn(currentExchangeRewardEra).then(res => {
      setAtoAtochaFinanceExchangeRewardEraStartBn(res.toJSON());
    });

    loadLastUpdateBN();

    if(isOpenSmooth){
      const _accountAddr = await fillCurrentAccountIdWithSmooth()
      await loadAccountPoints(_accountAddr)
    }else if(currentAccount){
      await loadAccountPoints(currentAccount.address)
    }

  }, [api.query.atochaModule, api.query.atochaFinance.lastUpdateBlockInfoOfPointExchage, api.query.atochaFinance.pointExchangeInfo, currentExchangeRewardEra, previousExchangeRewardEra, pubRefresh]);

  function loadLastUpdateBN() {
    api.query.atochaFinance
      .lastUpdateBlockInfoOfPointExchage(bn =>{
        setLastUpBn(bn.toHuman());
        console.log("@@@@@ApplyTokenReward.js|main|loadLastUpdateBN|bn",bn);
        console.log("@@@@@ApplyTokenReward.js|main|loadLastUpdateBN|bn.toHuman",bn.toHuman());
      }) .then(unsub => {
    }) .catch(console.error)
  }

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      console.log("Refresh list")
      updatePubRefresh()
    } else {
    }
  }

  function handlerEvent(section, method, statusCallBack, data) {
    if(section == 'atochaFinance' &&  method == 'ApplyPointReward') {
      console.log("ApplyTokenReward.js|handlerEvent|data",data);
      statusCallBack(1,"😉 Done.");
      updatePubRefresh();
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error)
      if(failedMsg) {
        if(failedMsg=="TooFewPoints"){
          statusCallBack(2, "You do not have enough points.")
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
        <div className="five wide column">
          <h3>Weekly Reward parameters</h3>
          <ul>
            <li>ATO reward per block: <span style={{fontSize:"150%"}}>{atoConfigAtochaFinance?(parseFloat(hexToBigInt(atoConfigAtochaFinance.issuancePerBlock)/BigInt(10**14)).toString())/10000:"Loading..."}</span></li>
            <li>Reward era length: <span style={{fontSize:"150%"}}>{atoConfigAtochaFinance?atoConfigAtochaFinance.exchangeEraBlockLength:"Loading..."}</span> blocks<br/>1 block = 6 seconds<br/>{atoConfigAtochaFinance?atoConfigAtochaFinance.exchangeEraBlockLength:"Loading..."} blocks = {atoConfigAtochaFinance?<AtoBlock2Time bigBlock={atoConfigAtochaFinance.exchangeEraBlockLength} smallBlock="0" />:""}</li>
            <li>ATO reward per era: <span style={{fontSize:"150%"}}>{atoConfigAtochaFinance?Math.ceil((parseInt(hexToBigInt(atoConfigAtochaFinance.issuancePerBlock)/BigInt(10**14)).toString())/10000*atoConfigAtochaFinance.exchangeEraBlockLength):"Loading..."}</span></li>
            <li>Total winners: <span style={{fontSize:"150%"}}>{atoConfigAtochaFinance?atoConfigAtochaFinance.exchangeMaxRewardListSize:"Loading..."}</span></li>
            <li>Current reward era: week <span style={{fontSize:"150%"}}>{currentExchangeRewardEra}</span></li>
            <li>Previous reward era: week <span style={{fontSize:"150%"}}>{previousExchangeRewardEra}</span></li>
          </ul>        
        </div>
        <div className="eleven wide column">
          <h3>Weekly Reward guideline</h3>
          <ul>
          <li>The top 5 Atocha Points Leaderboard players who have already submitted their requests within the specific reward week will receive the weekly ATO reward automatically at the end of the reward week.</li>
          <li>The reward distribution will be based on the total Atocha Points of the top 5 players and distributed in pro-rate. Once ATO reward is sent to the winner, the Atocha Points of the winner will be cleared to zero.</li>
          <li>If you would like to win the ATO reward in the specific reward week, you will need to submit the request within the specific reward week.</li>
          <li>Anyone with positive points can submit their requests. Your current points: <AtoDeleteThousand withThousand={userPoints} />.</li>
          <li>You can request at any day of the reward week even you are not on the top 5 ranking yet. By end of the reward week, the protocol will distribute the reward automatically to you if you ended up at the top 5 leaderboard. </li>
          <li>When you submitted request but dropped from top 5 leaderboard by the end of the reward week, you will not be receiving the ATO rewards.</li>
          </ul>
        </div>        
      </div>

      <h3>Atocha Points Leaderboard of current reward era (week {currentExchangeRewardEra})</h3>
      <p>Current reward week started from Block {atoAtochaFinanceExchangeRewardEraStartBn}, <AtoBlock2Time bigBlock={atoAtochaFinanceExchangeRewardEraStartBn+atoAtochaFinanceConfigExchangeEraBlockLength} smallBlock={pubBlockNumber} /> left</p>
      {exchangeInfo.length>0?
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell><strong>Address</strong></Table.Cell>
            <Table.Cell style={{width:"25%"}}><strong>Points</strong></Table.Cell>
          </Table.Row>
          {exchangeInfo.map((infoData,idx) => <Table.Row key={idx}>
            <Table.Cell><UserHomeLink user_address={infoData[0]} /></Table.Cell>
            <Table.Cell><AtoDeleteThousand withThousand={infoData[1]} /></Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
      :<p>Nothing found.</p>}
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
            isOpenSmooth= {isOpenSmooth}
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
            <Table.Cell><strong>Address</strong></Table.Cell>
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
    </div>
  );
}

export default function ApplyTokenReward (props) {
  const { api } = useSubstrateState();
  const { chainData: {userPoints} } = useAtoContext()
  return api.query && userPoints
    ? <Main {...props} />
    : null;
}
