import React, {useEffect, useState} from 'react';
import {useAtoContext} from "./AtoContext";
import BaseIdentityIcon from '@polkadot/react-identicon';
import AtoDeleteThousand from "./AtoDeleteThousand";
import {useSubstrateState} from "../substrate-lib";
import {Header} from "semantic-ui-react";

function Main(props) {
  const {api} = useSubstrateState('')
  const [freeBalance, setFreeBalance] = useState(0);
  const [showSS58, setShowSS58] = useState(null);
  const [metaName, setMetaName] = useState(null);

  const { puzzleSets: {used3Account, usedSmoothStatus} } = useAtoContext()

  useEffect(() => {
    console.log('RUN ### UserWindow')
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
    <>
      {showSS58?<Header icon>
        <div>{usedSmoothStatus?'On Smooth': 'Web module'}</div>
        <div>
          <BaseIdentityIcon value={showSS58} size={50} theme="polkadot"/>
        </div>
        <div>
          {metaName}
        </div>
        <div><AtoDeleteThousand withThousand={freeBalance}/> ATO</div>
      </Header>:null}
    </>
  );
}

export default function UserWindow(props) {
  return <Main {...props} />;
}
