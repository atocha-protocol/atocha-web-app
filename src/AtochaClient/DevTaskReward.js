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

function Main (props) {
  const taskList = [
      {taskId: 101,taskTitle:"Share a puzzle to Twitter",taskDetail:"Share a puzzle to Twitter...",taskPrize:100,taskStatus:1},
      {taskId: 102,taskTitle:"Follow us on Twitter",taskDetail:"Follow us on Twitter...",taskPrize:200,taskStatus:1},
      {taskId: 103,taskTitle:"Follow us on Facebook",taskDetail:"Follow us on Facebook...",taskPrize:300,taskStatus:0}
  ];

  const myRequestList = [
      {requestId:1001,taskId: 101,taskTitle:"Share a puzzle to Twitter",taskPrize:100,requestDetail:"xxxxxxxx",requestDate:"xxxxxxxx",requestStatus:"1/Pending"},
      {requestId:1002,taskId: 101,taskTitle:"Share a puzzle to Twitter",taskPrize:100,requestDetail:"xxxxxxxx",requestDate:"xxxxxxxx",requestStatus:"2/Rewarded"},
      {requestId:1003,taskId: 102,taskTitle:"Follow us on Twitter",taskPrize:200,requestDetail:"xxxxxxxx",requestDate:"xxxxxxxx",requestStatus:"3/Rejected"}
  ];

  useEffect(() => {
  });

  return (
    <div>
      <h1>Task reward</h1>
      <h3>All tasks</h3>
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell><strong>taskId</strong></Table.Cell>
            <Table.Cell><strong>taskTitle</strong></Table.Cell>
            <Table.Cell><strong>taskDetail</strong></Table.Cell>
            <Table.Cell><strong>taskPrize</strong></Table.Cell>
            <Table.Cell><strong>taskStatus & action</strong></Table.Cell>
          </Table.Row>
          {taskList.map((item, idx)=><Table.Row key={idx}>
            <Table.Cell>{item.taskId}</Table.Cell>
            <Table.Cell>{item.taskTitle}</Table.Cell>
            <Table.Cell>{item.taskDetail}</Table.Cell>
            <Table.Cell>{item.taskPrize}</Table.Cell>
            <Table.Cell>taskStatus={item.taskStatus}<br/>{item.taskStatus==1?<div><input defaultValue="requestDetail" />&nbsp;&nbsp;&nbsp;&nbsp;<button className="ui tiny blue button">Submit</button></div>:""}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>            
      <h3>My requests</h3>
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell><strong>requestId</strong></Table.Cell>
            <Table.Cell><strong>taskId</strong></Table.Cell>
            <Table.Cell><strong>taskTitle</strong></Table.Cell>
            <Table.Cell><strong>taskPrize</strong></Table.Cell>
            <Table.Cell><strong>requestDetail</strong></Table.Cell>
            <Table.Cell><strong>requestDate</strong></Table.Cell>
            <Table.Cell><strong>requestStatus</strong></Table.Cell>
          </Table.Row>
          {myRequestList.map((item, idx)=><Table.Row key={idx}>
            <Table.Cell>{item.requestId}</Table.Cell>
            <Table.Cell>{item.taskId}</Table.Cell>
            <Table.Cell>{item.taskTitle}</Table.Cell>
            <Table.Cell>{item.taskPrize}</Table.Cell>
            <Table.Cell>{item.requestDetail}</Table.Cell>
            <Table.Cell>{item.requestDate}</Table.Cell>
            <Table.Cell>{item.requestStatus}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </div>
  );
}

export default function DevTaskReward (props) {
  return <Main {...props} />;
}
