import React, { useEffect, useState } from 'react';
import {Form, Input, Grid, Card, Statistic, TextArea, Label} from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';

function Main (props) {
  const { api } = useSubstrateState();

  // Puzzle information.
  const [answerTxt, setAnswerTxt] = useState('');
  const [answerExplain, setAnswerExplain] = useState('');
  const [status, setStatus] = useState(null);
  const [puzzleHash, setPuzzleHash] = useState('');
  useEffect(() => {

  }, [api.query.atochaModule]);


  function statusChange (newStatus) {
    if (newStatus.isFinalized) {
    }else{
    }
  }

  return (
    <Grid.Column width={8}>
      <h1>Atocha - Step 3 Puzzle answer usecase.</h1>
      <Form>
        <Form.Field>
          <Input
              label='Puzzle hash'
              type='text'
              onChange={(_, { value }) => setPuzzleHash(value) }
          />
        </Form.Field>
        <Form.Field>
          <Input
              label='Answer text'
              type='text'
              onChange={(_, { value }) => setAnswerTxt(value) }
          />
        </Form.Field>
        <Form.Field>
          <div>Answer explain:</div>
          <TextArea
              onChange={(_, { value }) => setAnswerExplain(value) }
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
              label='Submit'
              type='SIGNED-TX'
              setStatus={setStatus}
              refStatus={statusChange}
              attrs={{
                palletRpc: 'atochaModule',
                callable: 'answerPuzzle',
                inputParams: [puzzleHash, answerTxt, answerExplain],
                paramFields: [true, true, true]
              }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function AtochaPuzzleAnswer (props) {
  const { api } = useSubstrateState();
  return api.query
    ? <Main {...props} />
    : null;
}
