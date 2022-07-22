import React, {createRef, useState} from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Routes, Route, Link, BrowserRouter} from "react-router-dom";
import config from './config';

import { SubstrateContextProvider, useSubstrateState } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
import Balances from './Balances'
import BlockNumber from './BlockNumber'
// import Events from './Events'
// import Interactor from './Interactor'
import Metadata from './Metadata'
import NodeInfo from './NodeInfo'
import TemplateModule from './TemplateModule'
import Transfer from './Transfer'
import PuzzleList from "./AtochaClient/PuzzleList";
import PuzzleList2 from "./AtochaClient/PuzzleList2";
import StepCase from "./Step/StepCase";
// import Upgrade from './Upgrade'

import AtochaHome from "./AtochaClient/AtochaHome";
import PuzzleDetail from "./AtochaClient/PuzzleDetail";
import PuzzleDetail2 from "./AtochaClient/PuzzleDetail2";
import {AtoContextProvider} from "./AtochaClient/AtoContext";
import PointsRankList from "./AtochaClient/PointsRankList";
import WeeklyReward from "./AtochaClient/WeeklyReward";
import UserHome from "./AtochaClient/UserHome";
import ClientAtochaCreator from "./AtochaClient/ClientAtochaCreator";
import CreatePuzzle from "./AtochaClient/CreatePuzzle";
import MyHome from "./AtochaClient/MyHome";
import MyProfile from "./AtochaClient/MyProfile";
import ChainStatus from "./AtochaClient/ChainStatus";
import DevTest from "./AtochaClient/DevTest";
import DevTaskReward from "./AtochaClient/DevTaskReward";

function Main() {
  const { apiState, apiError, keyringState} = useSubstrateState();
  const [menuItemCss, setMenuItemCss] = useState({
    itemHome: 'item active',
    itemPuzzleList: 'item',
    itemRanklist: 'item',
    itemCreate: 'item',
    itemUser: 'item',
    itemMyProfile: 'item',
    itemParm: 'item',
  });

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  function menuClick(menuName){
    let newClass = {
      itemHome: 'item',
      itemPuzzleList: 'item',
      itemCreate: 'item',
      itemMyProfile: 'item',
      itemUser: 'item',
      itemRanklist: 'item',      
      itemParm: 'item',
    };
    switch (menuName) {
      case 'home':
        newClass.itemHome='item active';
        break;
      case 'puzzlelist':
        newClass.itemPuzzleList='item active';
        break;                  
      case 'create':
        newClass.itemCreate='item active';
        break;
      case 'user':
        newClass.itemUser='item active';
        break;
      case 'MyProfile':
        newClass.itemMyProfile='item active';
        break;        
      case 'ranklist':
        newClass.itemRanklist='item active';
        break;         
      case 'chain_status':
        newClass.itemParm='item active';
        break;
    }
    setMenuItemCss(newClass);
  }

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <br/><br/>
      <Container>
        <h1 className="ui header ReSeTs_h1">Atocha <i>Puzzles</i></h1>
        <h3>Hello world! Finally, we meet. I am the first web-application of the decentralized <a href="https://atocha.io">Atocha Protocol</a>.</h3>
        <BrowserRouter>
        <div className="ui secondary pointing menu" style={{marginBottom:"2rem"}}>
          <Link className={menuItemCss.itemHome} to="/" onClick={()=>{menuClick("home")}}>Home</Link>                
          <Link className={menuItemCss.itemPuzzleList} to="/puzzle-list" onClick={()=>{menuClick("puzzlelist")}}>Puzzle list</Link>
          <Link className={menuItemCss.itemCreate} to="/create-puzzle" onClick={()=>{menuClick("create")}}>Create a puzzle</Link>          
          <Link className={menuItemCss.itemMyProfile} to="/my_profile" onClick={()=>{menuClick("MyProfile")}}>My profile</Link>
          <Link className={menuItemCss.itemUser} to="/my_home" onClick={()=>{menuClick("user")}}>My account</Link>                
          <Link className={menuItemCss.itemRanklist} to="/points_rank_list" onClick={()=>{menuClick("ranklist")}}>Weekly reward</Link>
          {/*<Link className={menuItemCss.itemParm} to="/chain_status" onClick={()=>{menuClick("chain_status")}}>Chain parms</Link>*/}
        </div>
        <Routes>
          <Route path="/" element={<AtochaHome />} />
          <Route path="/puzzle-list" element={<PuzzleList2 />} />          
          <Route path="/create" element={<ClientAtochaCreator />} />
          <Route path="/create-puzzle" element={<CreatePuzzle />} />
          <Route path="/my_profile" element={<MyProfile />} />
          <Route path="/my_home" element={<MyHome />} />          
          <Route path="/points_rank_list" element={<WeeklyReward />} />
          <Route path="/chain_status" element={<ChainStatus />} />
          <Route path="/user_home/:account_id" element={<UserHome />} />
          <Route path="/puzzle_detail/:puzzle_hash" element={<PuzzleDetail2 />} />
          <Route path="/puzzle_detail2/:puzzle_hash" element={<PuzzleDetail2 />} />
          <Route path="/dev-test" element={<DevTest />} />
          <Route path="/dev-task-reward" element={<DevTaskReward />} />
        </Routes>
        </BrowserRouter>
        <DeveloperConsole />

        <br/>
        <div className="ui divider"></div>
        <div className="ui text menu">
          <div className="header item">Atocha Puzzles v220722b</div>
          <a className="item" href="https://app.ref.finance/#wrap.near|atocha-token.near" target="_blank">Get ATO</a>
          <a className="item" href="https://atochaprotocol.gitbook.io/atocha-protocol-wiki">Doc/Wiki/Help</a>
          <a className="item" href="https://polkadot.js.org/extension/">PolkadotJS wallet browser extension</a>          
          <a className="item" href={`${config.POLKADOT_EXPLORE}/?rpc=${config.PROVIDER_SOCKET}#/explorer`} target="_blank">PolkadotJS online wallet</a>
          <a className="item" href={`${config.OCT_EXPLORER}`} target="_blank">Octopus chain explorer</a>
          <a className="item" href="https://mainnet.oct.network/bridge/near/atocha">Octopus network bridge</a>
        </div>
        <br/>
      </Container>
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <AtoContextProvider>
        <Main />
      </AtoContextProvider>
    </SubstrateContextProvider>
  )
}
