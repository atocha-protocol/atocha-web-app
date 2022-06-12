import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import { Form, Input, Grid, Card, Statistic, TextArea, Label } from 'semantic-ui-react';
import axios from 'axios';

import config from '../config';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import MakeAnswerSha256WithSimple from '../units/MakeAnswerSha256';
import { web3FromSource } from '@polkadot/extension-dapp';
import {useAtoContext} from "./AtoContext";
import {hexToBigInt, hexToString} from "@polkadot/util";

function Main (props) {
  const { api, currentAccount } = useSubstrateState();
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} , chainData: {pubBlockNumber} } = useAtoContext()

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = currentAccount;
    let fromAcct;
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }
    return fromAcct;
  };

  // Puzzle information.
  const [answerHash, setAnswerHash] = useState('');
  const [status, setStatus] = useState(null);
  const [storageLength, setStorageLength] = useState('');
  const [storageHash, setStorageHash] = useState('');
  const [storageJson, setStorageJson] = useState({});

  const [maxFee, setMaxFee] = useState(0);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleFileContent, setPuzzleFileContent] = useState({});
  const [puzzleHash, setPuzzleHash] = useState('');
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [puzzleTextContent, setPuzzleTextContent] = useState({});
  const [deposit, setDeposit] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState(0);
  // const [puzzleStatusInterval, setPuzzleStatusInterval] =  useState(null);

  const [configAtochaModule, setConfigAtochaModule] = useState(null);
  const [configAtochaFinance, setConfigAtochaFinance] = useState(null);
  const [configAtochaModuleMinBonusOfPuzzle, setConfigAtochaModuleMinBonusOfPuzzle] = useState(0);

  useEffect(() => {
    const storageJson = {
      puzzle_title: puzzleTitle,
      puzzle_content: [
        puzzleTextContent,
        puzzleFileContent
      ]
    };
    const decimals = api.registry.chainDecimals;
    setMaxFee(BigInt(5000 * (10 ** decimals)));

    const jsonStr = JSON.stringify(storageJson);
    const jsonHash = sha256(encodeURIComponent(jsonStr));
    setStorageJson(storageJson);
    setStorageLength(jsonStr.length);
    setStorageHash(jsonHash);
    console.log('JSON:', jsonStr, jsonStr.length, jsonHash);
    console.log('user Effect.', currentAccount);
    console.log('debug=', sha256(encodeURIComponent('加油加油，中文')));
  }, [api.query.atochaFinance, puzzleTitle, puzzleTextContent, puzzleFileContent]);
  
  useEffect(async () => {
    if(configAtochaModule == null) {
      const cam = await api.query.atochaModule.atoConfig();
      setConfigAtochaModule(cam.toJSON());
    }

    if(configAtochaFinance == null) {
      const caf = await api.query.atochaFinance.atoConfig2();
      setConfigAtochaFinance(caf.toJSON());
    }

    setConfigAtochaModuleMinBonusOfPuzzle((parseFloat(hexToBigInt(configAtochaModule.minBonusOfPuzzle)/BigInt(10**14)).toString())/10000);

  }, [configAtochaModule, configAtochaFinance]);

  function statusChange (newStatus) {
    console.log(newStatus)
    if (newStatus.isInBlock) {
      console.log("Is InBlock")
      setStatus("Extrinsic succeed.")
      console.log('Send data to arweave.');
      axios.post(config.ARWEAVE_HTTP, storageJson).then(response => {
        console.log('Request data: ', response.data);
        if (response.data.result == 'ok') {
          const puzzle_hash = response.data.result_id;
          const answer_hash = MakeAnswerSha256WithSimple(puzzleAnswer, response.data.result_id);
          setPuzzleHash(puzzle_hash);
          setAnswerHash(answer_hash);
          handleSubmitPuzzle(puzzle_hash, answer_hash);
        }else{
          console.log('Ar storage error : ', response);
        }
      }, err => {
        console.log('Request err:', err);
      }).catch((err) => {
        console.log('Catch err:', err);
      });
    } else {
      console.log("Not InBlock")
      setStatus("Extrinsic failed.")
    }
  }

  // Submit puzzle on chain
  async function handleSubmitPuzzle (puzzle_hash, answer_hash) {
    if(puzzle_hash=="" || answer_hash=="" ) {
      alert("Puzzle or Answer hash not be empty!");
      return;
    }
    console.log(`Puzzle hash: ${puzzle_hash}, Puzzle answer: ${answer_hash}, deposit = ${deposit}`);
    setStatus("Submitting to the chain...")
    const fromAcct = await getFromAcct();
    const unsub = await api.tx.atochaModule
      .createPuzzle(puzzle_hash, answer_hash, deposit, 1)
      .signAndSend(fromAcct, (result) => {
        //setStatus(`4444submit status: ${result.status}`);
        if (result.status.isInBlock) {
          //setStatus(`5555submit status: ${result.status} - ${result.status.asInBlock}`);
          //setStatus("InBlock...");
        } else if (result.status.isFinalized) {
          //setStatus(`6666submit status: ${result.status} - ${result.status.asFinalized}`);
          setStatus("😉 Done! This puzzle has been saved on the chain and will be listed on the app in a minute.");
          unsub();
          const query_str = `
            query{
                puzzleCreatedEvents(filter:{
                  puzzleHash: {equalTo: "${puzzle_hash}"}
                }){
                  totalCount
                }
              }
          `;
          tryToPollCheck(query_str, updatePubRefresh, ()=>{});
        }
      });
  }

  function countDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setDeposit(BigInt(num * (10 ** decimals)));
  }

  function handleContent (content) {
    setPuzzleTextContent({
      type: 'text',
      data: content
    });
  }

  function handleFileChosen (file) {
    console.log(file);
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      console.log(fileReader.result);
      setPuzzleFileContent({
        type: 'file',
        data: fileReader.result
      });
    };
    fileReader.readAsDataURL(file);
  }

  return (
    <div>
      <h1>Create a puzzle</h1>
      <Form>
        <Form.Field>
          <Input
            label='Puzzle title'
            type='text'
            onChange={(_, { value }) => setPuzzleTitle(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
            type='file'
            id='file'
            label='Upload png or jpeg'
            accept='.png,.jpeg'
            onChange={e => handleFileChosen(e.target.files[0])}
          />
        </Form.Field>
        <Form.Field>
          <div>Puzzle content:</div>
          <TextArea
            onChange={(_, { value }) => handleContent(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='Puzzle answer'
            type='text'
            onChange={(_, { value }) => setPuzzleAnswer(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
            label={`Prize sponsored by you (Minimum=${configAtochaModuleMinBonusOfPuzzle})`}
            type='number'
            state='amount'
            onChange={(_, { value }) => countDeposit(value) }
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'left' }}>
          <TxButton
            label='Submit your puzzle'
            className="ui primary button blue"
            color="blue"
            type='SIGNED-TX'
            setStatus={setStatus}
            refStatus={statusChange}
            attrs={{
              palletRpc: 'atochaFinance',
              callable: 'preStorage',
              inputParams: [storageHash, storageLength, maxFee],
              paramFields: [true, true, true]
            }}
          />
        </Form.Field>
        <Form.Field>
          {status}
        </Form.Field>  
      </Form>
    </div>
  );
}

export default function ClientAtochaCreator (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext()
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : null;
}
