import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Container} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import NodeInfo from '../NodeInfo';
import Metadata from '../Metadata';
import BlockNumber from '../BlockNumber';
import AtochaPalletInfo from './AtochaPalletInfo';
import AtochaArweaveStorage from './AtochaArweaveStorage';
import AtochaPuzzleCreator from './AtochaPuzzleCreator';
import AtochaPuzzleAnswer from './AtochaPuzzleAnswer';
import AtochaCommitChallenge from './AtochaCommitChallenge';
import AtochaApplyTokenReward from './AtochaApplyTokenReward';
import Balances from '../Balances';
import Transfer from '../Transfer';

function Main (props) {
  const { api } = useSubstrateState();

  // Puzzle information.
  const [answerHash, setAnswerHash] = useState('');
  const [blockNumber, setBlockNumber] = useState(0);
  const [challengePeriodLength, setChallengePeriodLength] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [status, setStatus] = useState(null);
  const [puzzleHash, setPuzzleHash] = useState('');
  const [puzzleInfo, setPuzzleInfo] = useState(null);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [atochaModuleConfig, setAtochaModuleConfig] = useState(null);

  async function updateAtochaModuleConfig () {
    api.query.atochaModule.atoConfig().then(puzzleInfoOpt => {
      if (puzzleInfoOpt.isSome) {
        const config_val = puzzleInfoOpt.value.toHuman();
        setAtochaModuleConfig(config_val);
        setChallengePeriodLength(config_val.challengePeriodLength);
      }
    });
  }

  async function refreshPuzzleInfo () {
    console.log('refreshPuzzleInfo puzzleHash = ', puzzleHash);
    api.query.atochaModule.puzzleInfo(puzzleHash).then(puzzleInfoOpt => {
      if (puzzleInfoOpt.isSome) {
        setPuzzleInfo(puzzleInfoOpt.value.toHuman());
      }
    });

    api.query.atochaFinance.puzzleChallengeInfo(puzzleHash).then(challengeInfoOpt => {
      if (challengeInfoOpt.isSome) {
        console.log('challengeInfoOpt.value.toHuman() 2 = ', challengeInfoOpt.value.toHuman());
        setChallengeInfo(challengeInfoOpt.value.toHuman());
      }
    });

    const allPuzzleInfoList = await api.query.atochaModule.puzzleInfo.entries();
    console.log('RUN DEBUG 1 ', allPuzzleInfoList);
    allPuzzleInfoList.forEach(([{ args: [key] }, value]) => {
      console.log(`puzzle info list = ${key.toHuman()}, ${value.toHuman()}`);
    });
  }

  useEffect( () => {
    console.log('Run use effect ... ');
    // Get puzzle infos.
    if (puzzleHash !== '') {
      refreshPuzzleInfo();
    }
    updateAtochaModuleConfig();
    api.derive.chain.bestNumber(number => {
      setBlockNumber(number.toNumber());
    });
  }, [api.query.atochaModule, api.query.atochaModule.puzzleInfo, puzzleHash, status]);

  return (
      <Container>
          <h1>Step case:</h1>
          <Grid stackable columns='equal'>
              <Grid.Row stretched>
                  <NodeInfo />
                  <Metadata />
                  <BlockNumber />
                  <BlockNumber finalized />
              </Grid.Row>
              <Grid.Row stretched>
                  <AtochaPalletInfo />
              </Grid.Row>
              <Grid.Row stretched>
                  <AtochaArweaveStorage />
              </Grid.Row>
              <Grid.Row stretched>
                  <AtochaPuzzleCreator />
              </Grid.Row>
              <Grid.Row stretched>
                  <AtochaPuzzleAnswer />
              </Grid.Row>
              <Grid.Row stretched>
                  <AtochaCommitChallenge />
              </Grid.Row>
              <Grid.Row stretched>
                  <AtochaApplyTokenReward />
              </Grid.Row>
              <Grid.Row stretched>
                  <Balances />
              </Grid.Row>
              <Grid.Row>
                  {/*<Transfer />*/}
              </Grid.Row>
          </Grid>
      </Container>
  );
}

export default function StepCase (props) {
  const { api } = useSubstrateState();
  return api.query
    ? <Main {...props} />
    : null;
}
