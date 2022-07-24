import React,{ useEffect, useState, createRef } from 'react';
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
import axios from "axios";

function Main (props) {

  const { api, currentAccount } = useSubstrateState('')
  const [taskList, setTaskList] = useState([])
  const [requestList, setRequestList] = useState([])
  const [updateCount, setUpdateCount] = useState(0)

  // const taskList = [
  //     {taskId: 101,taskTitle:"Share a puzzle to Twitter 2",taskDetail:"Share a puzzle to Twitter...",taskPrize:100,taskStatus:1},
  //     {taskId: 102,taskTitle:"Follow us on Twitter 2",taskDetail:"Follow us on Twitter...",taskPrize:200,taskStatus:1},
  //     {taskId: 103,taskTitle:"Follow us on Facebook 2",taskDetail:"Follow us on Facebook...",taskPrize:300,taskStatus:0}
  // ];

  // const myRequestList = [
  //     {requestId:1001,taskId: 101,taskTitle:"Share a puzzle to Twitter",taskPrize:100,requestDetail:"xxxxxxxx",requestDate:"xxxxxxxx",requestStatus:"1/Pending"},
  //     {requestId:1002,taskId: 101,taskTitle:"Share a puzzle to Twitter",taskPrize:100,requestDetail:"xxxxxxxx",requestDate:"xxxxxxxx",requestStatus:"2/Rewarded"},
  //     {requestId:1003,taskId: 102,taskTitle:"Follow us on Twitter",taskPrize:200,requestDetail:"xxxxxxxx",requestDate:"xxxxxxxx",requestStatus:"3/Rejected"}
  // ];

  function initRewardTask(){
    const instance = axios.create({
      baseURL: config.API_ATOCHA_URL,
      timeout: 1000,
      responseType: 'json',
      responseEncoding: 'utf8',
    });
    instance.get(`/task/rewardList`).then(
      function (response) {
        // console.log(' --- ---- ', response.data)
        let resultArr = []
        response.data.map(item=>{
          resultArr.push(item)
        })
        setTaskList(resultArr)
      }
    ).catch(
      function (error) {
        console.log('Get ERROR!!! ', error)
      }
    )
  }

  function fillRequestList(){
    if(!currentAccount){
      return
    }
    const instance = axios.create({
      baseURL: config.API_ATOCHA_URL,
      timeout: 1000,
      responseType: 'json',
      responseEncoding: 'utf8',
    });
    instance.get(`/task/requestList/${currentAccount.address}`).then(
      function (response) {
        let resultArr = []
        response.data.map(item=>{
          resultArr.push(item)
        })
        setRequestList(resultArr)
      }
    ).catch(
      function (error) {
        console.log('Get ERROR!!! ', error)
      }
    )
  }

  function getTaskById(taskId) {
    for(const idx in taskList) {
      if(taskList[idx].id === taskId) return taskList[idx]
    }
    return null
  }

  function submitATask(taskId) {
    const request_detail = document.getElementById(`request_detail_${taskId}`).value
    console.log(taskId, request_detail, currentAccount.address)
    const instance = axios.create({
      baseURL: config.API_ATOCHA_URL,
      timeout: 1000,
      responseType: 'json',
      responseEncoding: 'utf8',
    });

    instance.post(`/task/do`, {
      "task_id": taskId,
      "request_owner": currentAccount.address,
      "request_detail": request_detail,
    }).then(function (response) {
        console.log(response);
        setUpdateCount(updateCount+1)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  useEffect(() => {
    console.log("################## ################## ################## ################## ################## ")
    initRewardTask()
    fillRequestList()
  }, [currentAccount, updateCount]);

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
            <Table.Cell>{item.id}</Table.Cell>
            <Table.Cell>{item.task_title}</Table.Cell>
            <Table.Cell>{item.task_detail}</Table.Cell>
            <Table.Cell>{item.task_prize}</Table.Cell>
            <Table.Cell>taskStatus={item.task_status}<br/>{item.task_status==1?<div><input id={`request_detail_${item.id}`} defaultValue="requestDetail" />&nbsp;&nbsp;&nbsp;&nbsp;<button className="ui tiny blue button" onClick={()=>submitATask(item.id)}>Submit</button></div>:""}</Table.Cell>
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
          {requestList.map((item, idx)=><Table.Row key={idx}>
            <Table.Cell>{item.id}</Table.Cell>
            <Table.Cell>{item.task_id}</Table.Cell>
            <Table.Cell>{getTaskById(item.task_id)?.task_title}</Table.Cell>
            <Table.Cell>{getTaskById(item.task_id)?.task_prize}</Table.Cell>
            <Table.Cell>{item.request_detail}</Table.Cell>
            <Table.Cell>{item.created_at}</Table.Cell>
            <Table.Cell>{item.request_status}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </div>
  );
}

export default function DevTaskReward (props) {
  return <Main {...props} />;
}
