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
    setUsed3Account,
    setUsedSmoothStatusWithLocalStorage,
    used3Account,
    usedSmoothStatus} } = useAtoContext()

  useEffect(() => {
    console.log('### usedSmoothStatus', usedSmoothStatus, typeof usedSmoothStatus)
    if(usedSmoothStatus == true){
      console.log('Smooth login useEffect , usedSmoothStatus = ', usedSmoothStatus)
      getSmoothLoginInfos()
    }
  }, [usedSmoothStatus]);

  function getSmoothLoginInfos() {
    getLoginInfos().then(data=>{
      console.log('data = ', data)
      console.log('data.data.atoAddress', data.atoAddress)
      if(data.userId > 0 && data.atoAddress == null){
        setTwitterButtonTxt('set wallet')
        twitterButtonClick()
      }else if(data.atoAddress){
        console.log('RUN 2 #############', data.atoAddress)
        setTwitterButtonTxt('logout with smooth')
        // Get smooth user infos
        setUsedSmoothStatusWithLocalStorage(true)
        getTwitterAtoInfos(data.atoAddress).then(bindInfoData=>{
          // console.log('bindInfoData', bindInfoData.data.screen_name)
          setUsed3Account({address: data.atoAddress, meta: {name: bindInfoData.data.screen_name}})
        })
      }
    }).catch(err=>{
      console.log('err = ', err)
    })
  }

  async function twitterButtonClick() {
    setOpenSelector(false)
    if (!await checkUserLoggedIn()) {
      setBindModalOpen(true)
      return false
    } else {
      const smoothData = await checkUserSmoothIn()
      if (smoothData && smoothData.hasLogin && smoothData.hasPwd && smoothData.hasAtoAcc) {
        getSmoothLoginInfos()
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

  // function chooseLoginAccount(acc) {
  //   // setSelectedWebAccount(acc)
  //
  //   setUsed3Account(acc)
  //   // setUsedSmoothStatusWithLocalStorage(false)
  //
  //   let unsubscribe
  //   acc &&
  //   api.query.system
  //     .account(acc.address, balance =>
  //       setFreeBalance(balance.data.free.toHuman())
  //     )
  //     .then(unsub => (unsubscribe = unsub))
  //     .catch(console.error)
  //   if (unsubscribe)
  //     unsubscribe()
  //
  // }

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
                    setOpenSelector(!openSelector)
                  }}>Change web3 account</Button>
                  <Button button size='tiny' onClick={()=>{
                    twitterButtonClick()
                  }}>or {twitterButtonTxt}</Button>
                </div>
             : true == usedSmoothStatus? <div>
                <div>
                  <Button size='tiny' onClick={()=>{
                    setOpenSelector(!openSelector)
                  }}>Change web3 account</Button>
                  <Button secondary button size='tiny' onClick={()=>{
                    twitterButtonClick()
                  }}>Log out with twitter</Button>
                </div>
              </div>:<div>
              <Button secondary size='tiny' onClick={()=>{
                setOpenSelector(!openSelector)
              }}>Login with polkadot wallet</Button>
              <Button secondary size='tiny' onClick={()=>{
                twitterButtonClick()
              }}>{twitterButtonTxt}</Button>
              </div>
            }
          </Grid.Column>
        </Grid.Row>
        {openSelector?<Grid.Row>
          <Grid.Column>
            <AtoSelector onSelected={(acc) => {
              console.log('############ setUsedSmoothStatus = false')
              setTwitterButtonTxt('Login with twitter')
              setOpenSelector(false)
              setUsedSmoothStatusWithLocalStorage(false)
              setUsed3Account(acc)
              console.log('------- END')
              // chooseLoginAccount(acc)
              // if(onWeb3Selected){
              //   onWeb3Selected(acc)
              // }
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
