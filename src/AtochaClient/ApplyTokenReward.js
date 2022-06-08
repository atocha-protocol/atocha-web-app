import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic, TextArea, Label, Table, Container } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import {useAtoContext} from "./AtoContext";
import UserHomeLink from "./UserHomeLink";
import KButton from "./KButton";
import AtoDeleteThousand from "./AtoDeleteThousand";

function Main (props) {
  const { api } = useSubstrateState();
  const { chainData: {userPoints}, puzzleSets: {pubRefresh, updatePubRefresh}, extractErrorMsg} = useAtoContext()
  // Puzzle information.
  const [exchangeInfo, setExchangeInfo] = useState([]);
  const [previousExchangeInfo, setPreviousExchangeInfo] = useState([]);

  const [status, setStatus] = useState(null);
  const [lastUpBn, setLastUpBn] = useState('*');
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const [previousExchangeRewardEra, setPreviousExchangeRewardEra] = useState(0);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  
  useEffect(() => {
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
        setPreviousExchangeRewardEra(era_opt.value.toNumber()-1)
      }
    });
    loadLastUpdateBN();
  }, [api.query.atochaModule, api.query.atochaFinance.pointExchangeInfo, currentExchangeRewardEra, previousExchangeRewardEra, pubRefresh]);

  function loadLastUpdateBN() {
    api.query.atochaFinance
      .lastUpdateBlockInfoOfPointExchage(bn =>{
        setLastUpBn(bn.toHuman())
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
      statusCallBack(1,"Done.");
      updatePubRefresh();
    }else if(section == 'system' &&  method == 'ExtrinsicFailed') {
      // module: {index: 22, error: 0}
      const failedData = data.toJSON()[0].module
      const failedMsg = extractErrorMsg(failedData.index, failedData.error)
      if(failedMsg) {
        statusCallBack(2, `${failedMsg}`)
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
      <h1>Ranking & rewards</h1>  
      <h2>Top players of current reward era <small style={{fontSize:"50%"}}>Reward era: {currentExchangeRewardEra}</small></h2>
      <ul>
        <li>You can apply for era rewards if your points is positive. Your current points: <AtoDeleteThousand withThousand={userPoints} /> on Block {lastUpBn}.</li>
        <li>
          You will receive era rewards automatically at the end of current era if...
          <ul>
            <li>You have applied for it during current era.</li>
            <li>You are in the top list at the end of current era.</li>
          </ul>
        </li>
        <li>Your points will be 0 once you have won era rewards.</li>
      </ul>
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
      :<p>No one applied for current era rewards.</p>}
      <Form>
        <Form.Field style={{ textAlign: 'left' }}>
          <KButton
            label={`Apply for rewards`}
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
      <h2>Top players of previous reward era <small style={{fontSize:"50%"}}>Reward era: {previousExchangeRewardEra}</small></h2>
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
      :<p>No one applied for previous era rewards.</p>}
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
