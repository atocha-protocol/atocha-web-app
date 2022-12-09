import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {
  Form,
  Input,
  Grid,
  Card,
  Statistic,
  TextArea,
  Label,
  Table,
  TableRow,
  TableCell,
  TableHeader, TableBody
} from 'semantic-ui-react';
import axios from 'axios';

import config from '../config';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import MakeAnswerSha256WithSimple from '../units/MakeAnswerSha256';
import { web3FromSource } from '@polkadot/extension-dapp';
import {useAtoContext} from "./AtoContext";
import {hexToBigInt, hexToString} from "@polkadot/util";
import BindAddressToTwitter from "./BindAddressToTwitter";

function Main (props) {
  const { api, currentAccount } = useSubstrateState();
  const [ financeConfig, setFinanceConfig ] = useState(null);
  const [ moduleConfig, setModuleConfig ] = useState(null);

  useEffect( () => {
    async function fetchData() {
      // atochaFinance.atoConfig2
      if(financeConfig == null) {
        const conf1 = await api.query.atochaFinance.atoConfig2()
        setFinanceConfig(conf1.toJSON());
      }
      // atochaModule.atoConfig
      if(moduleConfig == null) {
        const conf2 = await api.query.atochaModule.atoConfig()
        setModuleConfig(conf2.toJSON())
      }

      console.log('financeConfig = ', financeConfig);
    }
    fetchData()

  }, [financeConfig, moduleConfig]);

  return (
    <Grid.Column width={12}>
      <h2>Atocha Main module configuration parameters</h2>
      {currentAccount?<BindAddressToTwitter ato_address={currentAccount.address} />:null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Parameter name</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Describes</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>moduleConfig.minBonusOfPuzzle</TableCell>
            <TableCell>{moduleConfig?(parseFloat(hexToBigInt(moduleConfig.minBonusOfPuzzle)/BigInt(10**14)).toString())/10000:'*'} ATO</TableCell>
            <TableCell>Puzzle最小的保证金(ATO)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.challengePeriodLength</TableCell>
            <TableCell>
              {moduleConfig?(moduleConfig.challengePeriodLength/600).toFixed(4):'*'}小时
              = {moduleConfig?moduleConfig.challengePeriodLength/10:'*'}分钟
              = {moduleConfig?moduleConfig.challengePeriodLength:'*'}区块
            </TableCell>
            <TableCell>接受挑战期</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.taxOfTcr</TableCell>
            <TableCell>{moduleConfig?moduleConfig.taxOfTcr/(10**7):'*'} %</TableCell>
            <TableCell>挑战者募集失败后，取回存款时扣除的惩罚费率</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.taxOfTvs</TableCell>
            <TableCell>{moduleConfig?moduleConfig.taxOfTvs/(10**7):'*'} %</TableCell>
            <TableCell>作者自问自答成功后，领取奖励所扣除的费率</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.taxOfTvo</TableCell>
            <TableCell>{moduleConfig?moduleConfig.taxOfTvo/(10**7):'*'} %</TableCell>
            <TableCell>非作者答题成功后，答题人领取奖励时扣除的费率</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.taxOfTi</TableCell>
            <TableCell>{moduleConfig?moduleConfig.taxOfTi/(10**7):'*'} %</TableCell>
            <TableCell>挑战成功后，挑战者领取奖励时扣除的税率</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.penaltyOfCp</TableCell>
            <TableCell>{moduleConfig?moduleConfig.penaltyOfCp/(10**7):'*'} %</TableCell>
            <TableCell>挑战成功后，扣除出题人Point的比例</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.maxSponsorExplainLen</TableCell>
            <TableCell>{moduleConfig?moduleConfig.maxSponsorExplainLen:'*'}</TableCell>
            <TableCell>赞助人可以留言的最大字符长度</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>moduleConfig.maxAnswerExplainLen</TableCell>
            <TableCell>{moduleConfig?moduleConfig.maxAnswerExplainLen:'*'}</TableCell>
            <TableCell>答题人最大的留言长度</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <h2>Atocha Financial module Parameters</h2>
      {/*atochaFinance.atoConfig2*/}
      {/*// "atochaFinance": {*/}
      {/*//   "exchangeEraBlockLength": 100800,  积分兑换奖励的长度 7 天*/}
      {/*//   "exchangeHistoryDepth": 12,  兑换记录的历史保留深度 12 个 era*/}
      {/*//   "exchangeMaxRewardListSize": 10,  兑换列表接受的最大长度TOP10*/}
      {/*//   "issuancePerBlock": 1902587519025900000,  每个Block增发的数量大于 1.902 个ATO，这些增发会给到参与答题的用户。*/}
      {/*//   "pointRewardEpochBlockLength": 14400,  积分生成的周期单位1天*/}
      {/*//   "challengeThreshold": 600000000,  成功挑战的门槛值 60%*/}
      {/*//   "raisingPeriodLength": 43200,  挑战成功后的募集期 3天*/}
      {/*//   "storageBaseFee": 1000 基础存储费用，用于防止Arweave 过度消耗。*/}
      {/*// },*/}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Parameter name</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Describes</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>financeConfig.exchangeEraBlockLength</TableCell>
            <TableCell>
              {financeConfig ? (financeConfig.exchangeEraBlockLength/600).toFixed(4) : "*"}小时
              = {financeConfig?financeConfig.exchangeEraBlockLength/10:'*'}分钟
              = {financeConfig?financeConfig.exchangeEraBlockLength:'*'}区块
            </TableCell>
          <TableCell>积分兑换奖励的长度</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.exchangeHistoryDepth</TableCell>
            <TableCell>{financeConfig ? financeConfig.exchangeHistoryDepth : "*"}</TableCell>
            <TableCell>兑换记录的历史保留深度(Era)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.exchangeMaxRewardListSize</TableCell>
            <TableCell>{financeConfig ? financeConfig.exchangeMaxRewardListSize : "*"}</TableCell>
            <TableCell>兑换列表所接受的最大长度</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.issuancePerBlock</TableCell>
            <TableCell>{financeConfig?(parseFloat(hexToBigInt(financeConfig.issuancePerBlock)/BigInt(10**14)).toString())/10000:'*'} ATO</TableCell>
            <TableCell>每个Block增发的数量，这些增发会给到参与答题的用户</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.pointRewardEpochBlockLength</TableCell>
            <TableCell>{financeConfig ? (financeConfig.pointRewardEpochBlockLength/600).toFixed(4) : "*"}小时
              = {financeConfig?financeConfig.pointRewardEpochBlockLength/10:'*'}分钟
              = {financeConfig?financeConfig.pointRewardEpochBlockLength:'*'}区块
            </TableCell>
            <TableCell>积分生成的基础周期单位</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.challengeThreshold</TableCell>
            <TableCell>{financeConfig?financeConfig.challengeThreshold/(10**7):'*'} %</TableCell>
            <TableCell>成功挑战的门槛值 60%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.raisingPeriodLength</TableCell>
            <TableCell>{financeConfig ? (financeConfig.raisingPeriodLength/600).toFixed(4) : "*"}小时
              = {financeConfig?financeConfig.raisingPeriodLength/10:'*'}分钟
              = {financeConfig?financeConfig.raisingPeriodLength:'*'}区块
            </TableCell>
            <TableCell>挑战成功发起后，保证金的募集期</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>financeConfig.storageBaseFee</TableCell>
            <TableCell>{financeConfig ? financeConfig.storageBaseFee : "*"}</TableCell>
            <TableCell>1000 基础存储费用，用于防止Arweave 过度消耗</TableCell>
          </TableRow>
        </TableBody>
      </Table>

    </Grid.Column>
  );
}

export default function ChainStatus (props) {
  const { api } = useSubstrateState();
  return api && api.query
    ? <Main {...props} />
    : null;
}
