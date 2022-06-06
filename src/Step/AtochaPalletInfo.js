import React, { useEffect, useState } from 'react';
import { Card, Icon, Grid } from 'semantic-ui-react';

import {useSubstrate, useSubstrateState} from '../substrate-lib';

function Main (props) {
  const { api, socket } = useSubstrateState();
  const [palletInfo, setPalletInfo] = useState({});
  const [blockNumber, setBlockNumber] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');
  const [points, setPoints] = useState(-1);
  const [currentExchangeRewardEra, setCurrentExchangeRewardEra] = useState(0);
  const { accountPair } = props;
  const [atochaModuleConfig, setAtochaModuleConfig] = useState(null);
  const [atochaFinanceConfig, setatochaFinanceConfig] = useState(null);

  async function updateAtochaModuleConfig() {
    api.query.atochaModule.atoConfig().then(puzzleInfoOpt => {
      // challengePeriodLength: "20"
      // maxAnswerExplainLen: "1,024"
      // maxSponsorExplainLen: "256"
      // minBonusOfPuzzle: "100,000,000,000,000,000,000"
      // penaltyOfCp: "10.00%"
      // taxOfTcr: "10.00%"
      // taxOfTi: "10.00%"
      // taxOfTvo: "10.00%"
      // taxOfTvs: "5.00%"
      if (puzzleInfoOpt.isSome) {
        // console.log(puzzleInfoOpt.value.toHuman());
        const config_val = puzzleInfoOpt.value.toHuman();
        setAtochaModuleConfig(config_val);
      }
    });
  }

  async function updateatochaFinanceConfig() {
    api.query.atochaFinance.atoConfig().then(puzzleInfoOpt => {
      // exchangeEraLength: 60
      // exchangeHistoryDepth: 10
      // exchangeMaxRewardListSize: 3
      // issuancePerBlock: 1,902,587,519,025,900,000
      // perEraOfBlockNumber: 10
      // challengeThreshold: 60.00%
      // raisingPeriodLength: 100
      // storageBaseFee: 10,000
      if (puzzleInfoOpt.isSome) {
        // console.log(puzzleInfoOpt.value.toHuman());
        const config_val = puzzleInfoOpt.value.toHuman();
        setatochaFinanceConfig(config_val);
      }
    });
  }

  useEffect(() => {
    const getInfo = async () => {
      if (accountPair) {
        setCurrentAddress(accountPair.address);
        api.query.atochaFinance.atoPointLedger(accountPair.address).then(chain_point =>{
          setPoints(chain_point.toString());
        });
      }

      updateAtochaModuleConfig();
      updateatochaFinanceConfig();

      try {
        const [
          // challengePeriodLength,
          // minBonusOfPuzzle,
          exchangeMaxRewardListSize,
          // exchangeEraLength,
          // currentExchangeRewardEra,
          lastExchangeRewardEra,
          // perEraOfBlockNumber
        ] = await Promise.all([
          // api.consts.atochaModule.challengePeriodLength,
          // api.consts.atochaModule.minBonusOfPuzzle,
          // api.consts.atochaFinance.exchangeMaxRewardListSize,
          // api.consts.atochaFinance.exchangeEraLength,
          // api.query.atochaFinance.currentExchangeRewardEra(),
          api.query.atochaFinance.lastExchangeRewardEra(),
          // api.consts.atochaFinance.perEraOfBlockNumber
        ]);
        setPalletInfo({
          // challengePeriodLength: challengePeriodLength.toString(),
          // minBonusOfPuzzle: minBonusOfPuzzle.toString(),
          // exchangeMaxRewardListSize: exchangeMaxRewardListSize.toString(),
          // exchangeEraLength: exchangeEraLength.toString(),
          // currentExchangeRewardEra: currentExchangeRewardEra.isSome ? currentExchangeRewardEra.value.toNumber() : 'Null',
          lastExchangeRewardEra: lastExchangeRewardEra?lastExchangeRewardEra.isSome ? lastExchangeRewardEra.value.toNumber() : 'Null':'Null',
          // perEraOfBlockNumber: perEraOfBlockNumber.toNumber()
        });
        // console.log('exchangeMaxRewardListSize = ', minBonusOfPuzzle, exchangeMaxRewardListSize);
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();

    const unsubscribeAll = null;
    api.derive.chain.bestNumber(number => {
      setBlockNumber(number.toNumber());
    });

    api.query.atochaFinance.currentExchangeRewardEra((era_opt) => {
      console.log(`Chain currentExchangeRewardEra: #${era_opt}`);
      if (era_opt.isSome) {
        setCurrentExchangeRewardEra(era_opt.value.toNumber());
      }
    });

    return () => unsubscribeAll && unsubscribeAll();
  }, [
    api.derive.chain.bestNumber,
    api.query.atochaFinance.currentExchangeRewardEra,
    api.query.atochaFinance.atoPointLedger,
    api.query.atochaFinance.lastExchangeRewardEra,
    accountPair]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>Atocha Pallet</Card.Header>
          <Card.Description>Address: {currentAddress}</Card.Description>
          <Card.Description>Points: {points}</Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Puzzle settings:</Card.Description>
          <Card.Description>Min bouns: {atochaModuleConfig?atochaModuleConfig.minBonusOfPuzzle:'*'} </Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Point reward settings:</Card.Description>
          <Card.Description>Point reward era length: {atochaFinanceConfig?atochaFinanceConfig.perEraOfBlockNumber:'*'}b </Card.Description>
        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Challenge settings:</Card.Description>
          <Card.Description>Challenge period length: {atochaModuleConfig ?atochaModuleConfig.challengePeriodLength:'*'}b (0line 5 Days)</Card.Description>
          <Card.Description>Raising period length: {atochaFinanceConfig ?atochaFinanceConfig.raisingPeriodLength:'*'}b (0line 3 Days)</Card.Description>

        </Card.Content>
        <Card.Content>
          <Card.Description><Icon name='setting' />Exchange settings:</Card.Description>
          <Card.Description>Exchange era length: {atochaFinanceConfig?atochaFinanceConfig.exchangeEraLength:'*'}b (Online 1 Weeks)</Card.Description>
          <Card.Description>Exchange era calculation: [{atochaFinanceConfig?(blockNumber / atochaFinanceConfig.exchangeEraLength).toFixed(2):'*'}] </Card.Description>
          <Card.Description>Available exchange era: [{currentExchangeRewardEra}]</Card.Description>
          <Card.Description>Last completed exchange era: [{palletInfo.lastExchangeRewardEra}]</Card.Description>
          <Card.Description>Reward list size: {atochaFinanceConfig?atochaFinanceConfig.exchangeMaxRewardListSize:'*'}</Card.Description>
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function AtochaPalletInfo (props) {
  const { api } = useSubstrateState();
  return api.query &&
    api.query.atochaModule &&
    api.query.atochaFinance
    ? <Main {...props} />
    : null;
}
