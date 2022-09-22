import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table} from 'semantic-ui-react';
import config from '../config';
import axios from "axios";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import PuzzleList from "./PuzzleList";
import {gql} from "@apollo/client";
import StepCase from "../Step/StepCase";

import {
    useParams
} from "react-router-dom";
import PuzzleAnswer from "./PuzzleAnswer";
import AnswerList from "./AnswerList";
import ChallengeList from "./ChallengeList";
import SponsorList from "./SponsorList";
import {useAtoContext} from "./AtoContext";
import {useSubstrateState} from "../substrate-lib";
import {web3FromSource} from "@polkadot/extension-dapp";
import utils from "../substrate-lib/utils";
import {func} from "prop-types";

function Main (props) {
  const {label, type, attrs, handlerEvent, buttonKey, preCheckCall} = props
  const { api, currentAccount } = useSubstrateState();
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck, setBindModalOpen, setAuthPwdModalOpen, setRecoverPwdModalOpen, checkUserLoggedIn, checkUserSmoothIn, isOpenSmooth} } = useAtoContext()
  // 0 == nothing, 1 = ok , 2= failed, 3=loading
  const [callStatus, setCallStatus] = useState(0)
  const [callMessage, setCallMessage] = useState("")

  const statusCallBack = (codeNum, message) => {
    setCallStatus(codeNum)
    setCallMessage(message)
  }

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
      fromAcct = null;
    }
    return fromAcct;
  };

  const isNumType = type =>
    utils.paramConversion.num.some(el => type.indexOf(el) >= 0)

  const transformParams = (
    paramFields,
    inputParams,
    opts = { emptyAsNull: true }
  ) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map(inputParam => {
      // To cater the js quirk that `null` is a type of `object`.
      if (
        typeof inputParam === 'object' &&
        inputParam !== null &&
        typeof inputParam.value === 'string'
      ) {
        return inputParam.value.trim()
      } else if (typeof inputParam === 'string') {
        return inputParam.trim()
      }
      return inputParam
    })
    const params = paramFields.map((field, ind) => ({
      ...field,
      value: paramVal[ind] || null,
    }))

    return params.reduce((memo, { type = 'string', value }) => {
      if (value == null || value === '')
        return opts.emptyAsNull ? [...memo, null] : memo

      let converted = value

      // Deal with a vector
      if (type.indexOf('Vec<') >= 0) {
        converted = converted.split(',').map(e => e.trim())
        converted = converted.map(single =>
          isNumType(type)
            ? single.indexOf('.') >= 0
            ? Number.parseFloat(single)
            : Number.parseInt(single)
            : single
        )
        return [...memo, converted]
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted =
          converted.indexOf('.') >= 0
            ? Number.parseFloat(converted)
            : Number.parseInt(converted)
      }
      return [...memo, converted]
    }, [])
  }

  async function preCheckSmooth() {
    if (!await checkUserLoggedIn()) {
      setBindModalOpen(true)
      return false
    } else {
      const smoothData = await checkUserSmoothIn()
      if (smoothData && smoothData.hasLogin && smoothData.hasPwd && smoothData.hasAtoAcc) {
        return true
      }else {
        if(smoothData.hasLogin && !smoothData.hasPwd && !smoothData.hasAtoAcc){
          setAuthPwdModalOpen(true)
          return false
        }else if(smoothData.hasLogin && !smoothData.hasPwd && smoothData.hasAtoAcc){
          setRecoverPwdModalOpen(true)
          return false
        } else{
          // impossible
          console.log('warn! impossible hear')
          setBindModalOpen(true)
          return false
        }
      }
    }
    return false
  }

  async function doClick() {

    if(isOpenSmooth && false == await preCheckSmooth()) {
      return ;
    }

    if(false == await preCheckCall(buttonKey, callStatus, statusCallBack)) {
      return ;
    }

    const fromAcct = await getFromAcct();
    const {palletRpc, callable, inputParams, paramFields} = attrs
    const transformed = transformParams(paramFields, inputParams, {
      emptyAsNull: false,
    })

    const txExecute = attrs
      ? api.tx[palletRpc][callable](...transformed)
      : api.tx[palletRpc][callable]()

    const unsub = await txExecute
      .signAndSend(fromAcct, {}, ({events = [], status}) => {
        //alert("KButton.js|doClick");
        if (status.isInBlock) {
          statusCallBack(3)
          events.forEach(({event: {data, method, section}, phase}) => {
            console.log("phase === ", phase)
            handlerEvent(section, method, statusCallBack, data)
          });
        } else if (status.isFinalized) {
          console.log("RUN finalized.111111111111111")
        }
      })
  }

  function loadSystemEvents() {
    // Subscribe to system events via storage
    api.query.system.events((events) => {
      console.log(`\nReceived ${events.length} events:`);

      // Loop through the Vec<EventRecord>
      events.forEach((record) => {
        // Extract the phase, event and the event types
        const { event, phase } = record;
        const types = event.typeDef;

        // Show what we are busy with
        console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        console.log(`\t\t${event.meta}`);

        // Loop through each of the parameters, displaying the type and data
        event.data.forEach((data, index) => {
          console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
        });
      });
    });
  }

    // Puzzle information.
    useEffect(async () => {
      // loadSystemEvents()
    }, [callStatus, setCallStatus]);

  return (
      <>
        <Button className="ui primary button" onClick={()=>doClick()}>{label}</Button>&nbsp;&nbsp;
        <span style={{color:'gray'}}>
          {callStatus?callStatus == 1?"Transaction successed.":
                      callStatus == 2?"Transaction failed.":
                      callStatus == 3?"Submitting":"":""}
        </span>&nbsp;&nbsp;
        <span style={{color:'gray'}}>
          {callMessage}
        </span>
      </>
  );
}

export default function KButton (props) {
    const { api } = useSubstrateState();
    return api.query
        ? <Main {...props} />
        : null;
}
