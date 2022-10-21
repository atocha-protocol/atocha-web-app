import React,{ useEffect, useState, createRef } from 'react';
import {
  Form,
  Input,
  Grid,
  Card,
  Statistic,
  TextArea,
  Label,
  Table,
  Container,
  Button,
  List,
  Image
} from 'semantic-ui-react';
import BaseIdentityIcon from '@polkadot/react-identicon';
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
import AtoSelector from "./AtoSelector";

function Main (props) {
  const { api, currentAccount } = useSubstrateState('')

  useEffect(() => {

  }, []);

  return (
    <div>
      <h1>SmoothLogin</h1>
      <AtoSelector/>
      <List selection verticalAlign='middle'>
        <List.Item>
          {/*<Image avatar src='https://react.semantic-ui.com/images/avatar/small/christian.jpg' />*/}
          <BaseIdentityIcon value={"5F7i55HuvXYjVyqeXLJ6bAv7Z1DCAw5ajUuZV4vZaWM9WDAV"} size={48} />
          <List.Content>
            <List.Header>Helen</List.Header>
          </List.Content>
        </List.Item>
        <List.Item>
          <Image avatar src='https://react.semantic-ui.com/images/avatar/small/christian.jpg' />
          <List.Content>
            <List.Header>Christian</List.Header>
          </List.Content>
        </List.Item>
        <List.Item>
          <Image avatar src='https://react.semantic-ui.com/images/avatar/small/christian.jpg' />
          <List.Content>
            <List.Header>Daniel</List.Header>
          </List.Content>
        </List.Item>
      </List>
    </div>
  );
}

export default function SmoothLogin (props) {
  return <Main {...props} />;
}
