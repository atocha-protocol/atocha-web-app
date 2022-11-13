import React, { useEffect, useState } from 'react';
// const axios = require('axios').default;
import {isFunction, stringToU8a, u8aToHex, u8aWrapBytes} from '@polkadot/util';
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import axios from "axios";
import config from "../config";
import getShortText from "../units/GetShortText";
import {web3FromSource} from "@polkadot/extension-dapp";
import {useSubstrateState, utils} from "../substrate-lib";
import {signatureVerify} from "@polkadot/util-crypto";
// import { keyring } from '@polkadot/ui-keyring';

function Main (props) {
  const { ato_address,displayMode } = props;
  const { api, currentAccount } = useSubstrateState();
  const [twitterBind, setTwitterBind] = useState(null)

  function getKeyringName(addr) {
    for(let k in keyring.getPairs()) {
      let keyPair = keyring.getPairs()[k];
      let metaName = keyPair.meta.name.toUpperCase();
      let address = keyPair.address;
      if(addr == address) return metaName;
    }
    return getShortText(addr);
  }

  function getKeyPairs(addr) {
    for(let k in keyring.getPairs()) {
      let keyPair = keyring.getPairs()[k];
      let metaName = keyPair.meta.name.toUpperCase();
      let address = keyPair.address;
      return keyPair
    }
    return null
  }


  // Will remove and instead with common function
  function getBindTwitter() {
    const instance = utils.atoApiRequestInstance()
    instance.get(`/twitter/ato_info?addr=${ato_address}`).then(
      function (response) {
        if(!response.data){
          setTwitterBind(null)
        } else if(response.data?.status.toLowerCase() == `success` && response.data?.data?.screen_name){
          // Try to get twitter infos
          instance.get(`/twitter/show_user?screen_name=${response.data?.data.screen_name}`).then(twitter_user_info=>{
            response.data.data.detail = twitter_user_info
            // console.log(' --- ---- B ', response.data)
            setTwitterBind(response.data)
          })
        }else{
          setTwitterBind(null)
        }
      }
    ).catch(
      function (error) {
        console.log('Bing request Error ================= ', error)
      }
    )
  }

  async function toBindTwitter() {
    const time = new Date().getTime()
    const message = `${currentAccount.address}${time}`
    // Try to sign
    const meta = (currentAccount && currentAccount.meta) || {}
    const isInjected = (meta.isInjected) || false
    if (meta.source && isInjected) {
      web3FromSource(meta.source)
        .catch(() => null)
        .then((injected) => {
          const signer = injected?.signer

          const wrapped = u8aWrapBytes(message);
          if (signer && isFunction(signer.signRaw)) {
            signer
              .signRaw({
                address: currentAccount.address,
                data: u8aToHex(wrapped),
                type: 'bytes'
              })
              .then(({ signature }) => {
                // console.log(signature)
                // console.log("currentAccount.verify = ", signatureVerify(message, signature, currentAccount.address))
                window.location=`${config.API2_ATOCHA_URL}/twitter/bind?addr=${currentAccount.address}&ref=${btoa(window.location.href.split('?')[0])}&signature=${signature}&uptime=${time}`
              }).catch(console.error);
          } else {
            throw new Error("Signer error.")
            // setSignature(u8aToHex(currentAccount.sign(wrapped)));
          }
        })
    }
  }

  async function toUnBindTwitter() {
    const time = new Date().getTime()
    const message = `${currentAccount.address}${time}`
    // Try to sign
    const meta = (currentAccount && currentAccount.meta) || {}
    const isInjected = (meta.isInjected) || false
    if (meta.source && isInjected) {
      web3FromSource(meta.source)
        .catch(() => null)
        .then((injected) => {
          const signer = injected?.signer

          const wrapped = u8aWrapBytes(message);
          if (signer && isFunction(signer.signRaw)) {
            signer
              .signRaw({
                address: currentAccount.address,
                data: u8aToHex(wrapped),
                type: 'bytes'
              })
              .then(({ signature }) => {
                // console.log(signature)
                // console.log("currentAccount.verify = ", signatureVerify(message, signature, currentAccount.address))
                window.location=`${config.API2_ATOCHA_URL}/twitter/unbind?addr=${currentAccount.address}&ref=${btoa(window.location.href.split('?')[0])}&signature=${signature}&uptime=${time}`
              }).catch(console.error);
          } else {
            throw new Error("Signer error.")
          }
        })
    }
  }

  // Puzzle information.
  useEffect( () => {
    console.log('+++++++ A0')
    getBindTwitter()
  }, []);

  return (
    <>
      { twitterBind?.status.toLowerCase() == `success`?
        <>
          {displayMode=="icon_name_button"?
            <div>
              <table>
                <tr>
                  <td>
                    <img className="ui top aligned image" src={twitterBind?.data?.detail?.data?.profile_image_url_https} />
                  </td>  
                  <td>
                    Connected Twitter account<br/>
                    <p><a target="_blank" href={`https://twitter.com/${twitterBind?.data?.screen_name}`}><h3>{twitterBind?.data?.detail?.data.name} <i className="external alternate icon"></i></h3></a></p>
                  </td>
                </tr>
              </table><br/>
              <p>
                {/*<a className="ui twitter button" href={`${config.API2_ATOCHA_URL}/twitter/unbind?addr=${ato_address}&ref=${btoa(window.location.href.split('?')[0])}`}><i className="twitter icon"></i> Disconnect</a>*/}
                <a className="ui twitter button" href={`#`} onClick={()=>toUnBindTwitter()}><i className="twitter icon"></i> Disconnect</a>
              </p>
            </div>
          :
            <>
              {displayMode=="icon_name"?
                <div style={{textAlign:"center"}}>
                  <p><img className="ui top aligned small circular image" src={twitterBind?.data?.detail?.data?.profile_image_url_https} /></p>
                  <p><a target="_blank" href={`https://twitter.com/${twitterBind?.data?.screen_name}`}><h3>{twitterBind?.data?.detail?.data.name} <i className="external alternate icon"></i></h3></a></p>
                </div>
              :
                <span>{twitterBind.data.detail.data.name}</span>
              } 
            </>
          }  
        </>   
      :
        <>
          {displayMode=="icon_name_button"?
            <div>
              {/*<a className="ui twitter button" href={`${config.API_ATOCHA_URL}/bind/${ato_address}/${btoa(window.location.href.split('?')[0])}`}><i className="twitter icon"></i> Connect to Twitter</a>*/}
              {/*<a className="ui twitter button" href={`${config.API2_ATOCHA_URL}/twitter/bind?addr=${ato_address}&ref=${btoa(window.location.href.split('?')[0])}`}><i className="twitter icon"></i> Connect to Twitter</a>*/}
              <a className="ui twitter button" href={`#`} onClick={()=>toBindTwitter()}><i className="twitter icon"></i> Connect to Twitter</a>
            </div>
          :
            <>
              {displayMode=="icon_name"?
                <div style={{textAlign:"center"}}>
                  <img className="ui top aligned small image" src="https://atocha.io/wp-content/uploads/2021/12/img_210318.png" />
                </div>
              :
                <span><Link to={`/user_home/${ato_address}`}>{ twitterBind?twitterBind?.data?.detail?.data.name:ato_address?getKeyringName(ato_address):'*'}</Link></span>
              } 
            </>
          }  
        </>
      }
    </>
  );
}

export default function BindAddressToTwitter (props) {
  const { ato_address,displayMode} = props;
  return ato_address
    ? <Main {...props} />
    : null;
}
