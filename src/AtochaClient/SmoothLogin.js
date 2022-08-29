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
  // const [taskList, setTaskList] = useState([])
  // const [requestList, setRequestList] = useState([])
  // const [updateCount, setUpdateCount] = useState(0)

  useEffect(() => {

  }, []);

  return (
    <div>
      <h1>SmoothLogin</h1>
    </div>
  );
}

export default function SmoothLogin (props) {
  return <Main {...props} />;
}
