import React, {useEffect, useState} from 'react';
import {useAtoContext} from "./AtoContext";
import BaseIdentityIcon from '@polkadot/react-identicon';
import AtoDeleteThousand from "./AtoDeleteThousand";
import {useSubstrateState} from "../substrate-lib";
import {Button, Container, Dropdown, Grid, Header, Icon, Image, Menu, Segment} from "semantic-ui-react";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import AtochaHome from "./AtochaHome";
import PuzzleList2 from "./PuzzleList2";
import ClientAtochaCreator from "./ClientAtochaCreator";
import CreatePuzzle from "./CreatePuzzle";
import CreatePuzzle3 from "./CreatePuzzle3";
import MyProfile from "./MyProfile";
import MyHome from "./MyHome";
import WeeklyReward from "./WeeklyReward";
import ChainStatus from "./ChainStatus";
import UserHome from "./UserHome";
import PuzzleDetail2 from "./PuzzleDetail2";
import PuzzleDetail3 from "./PuzzleDetail3";
import DevTest from "./DevTest";
import DevTaskReward from "./DevTaskReward";
import SmoothLogin from "./SmoothLogin";
import SmoothRegister from "./SmoothRegister";

function Main(props) {
  const {mode} = props
  const {api} = useSubstrateState('')
  const [freeBalance, setFreeBalance] = useState(0);
  const [showSS58, setShowSS58] = useState(null);
  const [metaName, setMetaName] = useState(null);


  const { puzzleSets: {used3Account, usedSmoothStatus, rebirthAccount} } = useAtoContext()

  useEffect(() => {
    if(usedSmoothStatus==false && used3Account) {
      console.log('RUN 1 ')
      setShowSS58(used3Account.address)
      getFreeBalance(used3Account.address)
      setMetaName(used3Account.meta.name)
    }else if(usedSmoothStatus == true && used3Account){
      console.log('RUN 2 ')
      // Get smooth infos.
      setShowSS58(used3Account.address)
      getFreeBalance(used3Account.address)
      setMetaName(used3Account.meta.name)
    }else{
      console.log('RUN 3 ')
      setFreeBalance(0)
      setShowSS58(null)
      setMetaName(null)
    }
  }, [used3Account, usedSmoothStatus]);

  function getFreeBalance(acc) {
    let unsubscribe
    acc &&
    api.query.system.account(acc, balance =>
        setFreeBalance(balance.data.free.toHuman())
      )
      .then(unsub => (unsubscribe = unsub))
      .catch(console.error)
    if (unsubscribe)
      unsubscribe()
  }

  return (
    mode=='bar'?
      showSS58?
        <Container style={{color:'gray'}}>
          <Menu secondary>
            <Menu.Item>
              <BaseIdentityIcon value={showSS58} size={40} theme="polkadot"/>
            </Menu.Item>
            <Menu.Item>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '18px'}}><b>{metaName}</b></div>
                <AtoDeleteThousand withThousand={freeBalance}/> ATO
              </div>
            </Menu.Item>
            <Menu.Item>
              <a href="/login">Change</a>
            </Menu.Item>
          </Menu>
        </Container>
        :
        <Container>
          <Menu secondary>
            <Menu.Item>
              <a href="/login">Login</a>
            </Menu.Item>
          </Menu>
        </Container>
      :
    showSS58?<Header icon>
      <div>{usedSmoothStatus?'On Smooth': 'Web module'}</div>
      <div>
        <BaseIdentityIcon value={showSS58} size={50} theme="polkadot"/>
      </div>
      <div>
        {metaName}
      </div>
      <div><AtoDeleteThousand withThousand={freeBalance}/> ATO</div>
    </Header>:null
  );
}

export default function UserWindow(props) {
  return <Main {...props} />;
}
