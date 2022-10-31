import React, {useEffect, useState, createRef} from 'react';
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
  Image, Feed, Icon, Header
} from 'semantic-ui-react';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import BaseIdentityIcon from '@polkadot/react-identicon';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import AtoSelector from "./AtoSelector";
import AtoDeleteThousand from "./AtoDeleteThousand";
import {useAtoContext} from "./AtoContext";
import UserWindow from "./UserWindow";

function Main(props) {
  const {api, currentAccount} = useSubstrateState('')
  // const {onWeb3Selected, smoothSelected } = props
  // const [selectedWebAccount, setSelectedWebAccount] = useState(null);
  const [freeBalance, setFreeBalance] = useState(0);
  const [openSelector, setOpenSelector] = useState(false);
  const [twitterButtonTxt, setTwitterButtonTxt] = useState('Login with twitter')

  const { puzzleSets: {
    setBindModalOpen,
    getLoginInfos,
    getTwitterAtoInfos,
    checkUserLoggedIn,
    checkUserSmoothIn,
    setAuthPwdModalOpen,
    setRecoverPwdModalOpen,
    setUsedWeb3AddressWithLocalStorage,
    setUsedSmoothStatusWithLocalStorage,
    used3Account,
    usedSmoothStatus,
    smoothError,
    setSmoothError,
    rebirthAccount,
  } } = useAtoContext()

  useEffect(() => {
    console.log('### usedSmoothStatus', usedSmoothStatus, typeof usedSmoothStatus)
    rebirthAccount().then(data=>{
      if(usedSmoothStatus == true){
        if(data.userId > 0 && data.atoAddress == null){
          twitterButtonClick()
        }
      }
    })
  }, [usedSmoothStatus]);

  async function web3ButtonClick(isOpen) {
    if (isOpen) {
      const extensions = await web3Enable('Atocha dapp.');
      if (extensions.length === 0) {
        alert(`Need to install polkadot plugin: https://polkadot.js.org/extension/`)
        return
      }
    }
    setOpenSelector(isOpen)
  }

  async function twitterButtonClick() {
    setOpenSelector(false)
    if (!await checkUserLoggedIn()) {
      setBindModalOpen(true)
      return false
    } else {
      const smoothData = await checkUserSmoothIn()
      if (smoothData && smoothData.hasLogin && smoothData.hasPwd && smoothData.hasAtoAcc) {
        return true
      } else {
        if (smoothData.hasLogin && !smoothData.hasPwd && !smoothData.hasAtoAcc) {
          setAuthPwdModalOpen(true)
          return false
        } else if (smoothData.hasLogin && !smoothData.hasPwd && smoothData.hasAtoAcc) {
          setRecoverPwdModalOpen(true)
          return false
        } else {
          // impossible
          console.log('warn! impossible hear')
          setBindModalOpen(true)
          return false
        }
      }
    }
  }

  return (
    <>
      <h1>SmoothLogin</h1>
      <Grid columns={2} stackable textAlign='center'>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column>
            <UserWindow />
            {used3Account && false == usedSmoothStatus?
                <div>
                  <Button secondary size='tiny' onClick={()=>{
                    setUsedSmoothStatusWithLocalStorage(false)
                    setSmoothError([null, 0])
                    web3ButtonClick(!openSelector)
                  }}>Change web3 account</Button>
                  <Button button size='tiny' onClick={()=>{
                    setUsedSmoothStatusWithLocalStorage(true)
                    twitterButtonClick()
                  }}>or {twitterButtonTxt}</Button>
                </div>
             : true == usedSmoothStatus? <div>
                <div>
                  <Button size='tiny' onClick={()=>{
                    setUsedSmoothStatusWithLocalStorage(false)
                    setSmoothError([null, 0])
                    web3ButtonClick(!openSelector)
                  }}>Change web3 account</Button>
                  <Button secondary button size='tiny' onClick={()=>{
                    setUsedSmoothStatusWithLocalStorage(true)
                    twitterButtonClick()
                  }}>Log out with twitter</Button>
                </div>
              </div>:<div>
              <Button secondary size='tiny' onClick={()=>{
                setUsedSmoothStatusWithLocalStorage(false)
                setSmoothError([null, 0])
                web3ButtonClick(!openSelector)
              }}>Login with polkadot wallet</Button>
              <Button secondary size='tiny' onClick={()=>{
                setUsedSmoothStatusWithLocalStorage(true)
                twitterButtonClick()
              }}>{twitterButtonTxt}</Button>
              </div>
            }
          </Grid.Column>
        </Grid.Row>
        {smoothError[0]?<Grid.Row><Grid.Column>
          <p style={{color: 'RED'}}>ERR:{smoothError[0]} CODE:{smoothError[1]}</p>
        </Grid.Column></Grid.Row>:null}
        {openSelector?<Grid.Row>
          <Grid.Column>
            <AtoSelector onSelected={(acc) => {
              setTwitterButtonTxt('Login with twitter')
              web3ButtonClick(false)
              setUsedSmoothStatusWithLocalStorage(false)
              setUsedWeb3AddressWithLocalStorage(acc)
            }}/>
          </Grid.Column>
        </Grid.Row>:null}
      </Grid>
    </>
  );
}

export default function SmoothLogin(props) {
  return <Main {...props} />;
}
