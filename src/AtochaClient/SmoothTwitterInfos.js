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

  function getBindTwitter() {
    const instance = utils.atoApiRequestInstance()
    instance.get(`/twitter/ato_info?addr=${ato_address}`).then(
      function (response) {
        console.log(' --- ----333 User is already bound', response.data)
        if(!response.data){
          setTwitterBind(null)
        } else if(response.data?.status.toLowerCase() == `success` && response.data?.data?.screen_name){
          console.log(' --- --- Try to get twitter user infos.')
          // Try to get twitter infos
          instance.get(`/twitter/show_user?screen_name=${response.data?.data.screen_name}`).then(twitter_user_info=>{
            response.data.data.detail = twitter_user_info
            console.log(' --- ---- C', response.data)
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

  // Puzzle information.
  useEffect(async () => {
    getBindTwitter()
  }, []);

  return (
    <>
      { twitterBind?.status.toLowerCase() == `success`?
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
          </table>
        </div>:null
      }
    </>
  );
}

export default function SmoothTwitterInfos (props) {
  const { ato_address, displayMode} = props;
  return ato_address
    ? <Main {...props} />
    : null;
}
