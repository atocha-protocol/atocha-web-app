import React, { useEffect, useState } from 'react'
import {
    web3Accounts,
    web3Enable,
    web3FromSource,
} from '@polkadot/extension-dapp';
import { stringToHex } from "@polkadot/util";
import {Feed, List, Segment} from "semantic-ui-react";
import BaseIdentityIcon from "@polkadot/react-identicon";
import {useAtoContext} from "./AtoContext";

function Main (props) {
    const {onSelected} = props
    const [accounts, setAccounts] = useState([]);
    const [connected, setConnected] = useState(false)
    const {puzzleSets: {connPolkadot} } = useAtoContext()

    useEffect(() => {
        connPolkadot().then(accounts => {
            setAccounts(accounts);
            setConnected(true);
        })
    }, []);

    // const connect = async () => {
    //     if (typeof window !== "undefined") {
    //         try {
    //             const allInjected = await web3Enable('PostThread');
    //             // console.log(allInjected);
    //             const allAccounts = await web3Accounts();
    //             // console.log(allAccounts);
    //             setAccounts(allAccounts);
    //             setConnected(true);
    //         } catch (e) {
    //             console.log(e);
    //         }
    //     }
    // }

    const signMessage = async () => {
        try {
            const injector = await web3FromSource(selectedAccount.meta.source);
            const signRaw = injector?.signer?.signRaw;
            if (!!signRaw) {
                // after making sure that signRaw is defined
                // we can use it to sign our message
                const { signature } = await signRaw({
                    address: selectedAccount.address,
                    data: stringToHex('Confirm your wallet address'),
                    type: 'bytes'
                });
                console.log("Signature: " + signature)
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div>
            <Segment raised style={{
                height: 400,
                overflow:'auto'
            }}>
            {connected ?
              <List selection verticalAlign='middle'>
                  {accounts.map((account, index) => {
                      return <List.Item key={index}>
                          <List.Content>
                              <Feed>
                                  <Feed.Event onClick={()=>{ onSelected(account) }} >
                                      <Feed.Label>
                                          <BaseIdentityIcon value={account.address} size={30} theme="polkadot" />
                                      </Feed.Label>
                                      <Feed.Content>
                                          <Feed.Summary>
                                              <List.Header>{account.meta.name}</List.Header>
                                          </Feed.Summary>
                                      </Feed.Content>
                                  </Feed.Event>
                              </Feed>
                          </List.Content>
                      </List.Item>
                  })}
              </List>:<div>Need polkadot plugin</div>
            }
            </Segment>

        </div>
    )
}

export default function AtoSelector (props) {
    return <Main {...props} />;
}