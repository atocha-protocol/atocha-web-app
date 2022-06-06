import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label} from 'semantic-ui-react';
import axios from 'axios';

import config from '../config';


import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import MakeAnswerSha256WithSimple from "../units/MakeAnswerSha256";

function Main (props) {
  const { api } = useSubstrateState();

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



  useEffect(() => {
    let storageJson = {
      puzzle_title: puzzleTitle,
      puzzle_content: [
        puzzleTextContent,
        puzzleFileContent
      ]
    };
    const decimals = api.registry.chainDecimals;
    setMaxFee(BigInt(5000 * (18 ** decimals)));

    const jsonStr = JSON.stringify(storageJson);
    const jsonHash = sha256(jsonStr);
    setStorageJson(storageJson);
    setStorageLength(jsonStr.length);
    setStorageHash(jsonHash);
    console.log('JSON:', jsonStr, jsonStr.length);
    console.log('user Effect.', jsonHash);
  }, [api.query.atochaFinance, puzzleTitle, puzzleTextContent, puzzleFileContent]);

  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
      console.log('Send data to arweave.');
      axios.post(config.ARWEAVE_HTTP, storageJson).then(response => {
        console.log('Request data: ', response.data);
        setPuzzleHash(response.data.puzzle_hash);
        setAnswerHash(MakeAnswerSha256WithSimple(puzzleAnswer, response.data.puzzle_hash));
      }, err => {
        console.log('Request err:', err);
      }).catch((err) => {
        console.log('Catch err:', err);
      });
    }else{
      setPuzzleHash('');
      setAnswerHash('');
    }
  }
  function handleContent(content) {
    setPuzzleTextContent({
      type: 'text',
      data: content
    })
  }
  function handleFileChosen (file) {
    console.log(file);
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      console.log(fileReader.result)
      setPuzzleFileContent({
        type: 'file',
        data: fileReader.result
      });
    };
    fileReader.readAsDataURL(file);
  }
  return (
    <Grid.Column width={8}>
      <h1>Atocha - Step 1 Arwave storage usecase.</h1>
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
        <Form.Field style={{ textAlign: 'center' }}>
          {/*<TxButton*/}
          {/*    accountPair={accountPair}*/}
          {/*    label='Submit'*/}
          {/*    type='SIGNED-TX'*/}
          {/*    setStatus={setStatus}*/}
          {/*    refStatus={statusChange}*/}
          {/*    attrs={{*/}
          {/*      palletRpc: 'atochaFinance',*/}
          {/*      callable: 'preStorage',*/}
          {/*      inputParams: [storageHash, storageLength, maxFee],*/}
          {/*      paramFields: [true, true, true]*/}
          {/*    }}*/}
          {/*/>*/}

          <TxButton
              label="Submit"
              type="SIGNED-TX"
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
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
          <div style={{ overflowWrap: 'break-word' }}>Puzzle hash: {puzzleHash}</div>
          <div style={{ overflowWrap: 'break-word' }}>Answer hash: {answerHash}</div>
        </Form>
    </Grid.Column>
  );
}

export default function AtochaArweaveStorage (props) {
  const { api } = useSubstrateState();
  return api.query
    ? <Main {...props} />
    : null;
}
