import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table, Tab} from 'semantic-ui-react';

import config from '../config';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import ArweaveTitle from "./ArweaveTitle";

import ClientAtochaCreator from "./ClientAtochaCreator";
import {useAtoContext, useAtoContextState} from "./AtoContext";
import ApplyTokenReward from "./ApplyTokenReward";

function Main (props) {
  const {apollo_client, gql, puzzleSets: {pubPuzzleList, setPubPuzzleList, setPubPuzzleListType} , chainData: {pubBlockNumber} } = useAtoContext()
  const { api } = useSubstrateState();


  // Puzzle information.
  useEffect(async () => {

  }, []);

  return (
      <>
        <ApplyTokenReward />
      </>
  );
}

export default function PointsRankList (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext()
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : null;
}
