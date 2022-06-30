import React, { useEffect, useState } from 'react';
// const axios = require('axios').default;
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import axios from "axios";
import config from "../config";
import getShortText from "../units/GetShortText";

function Main (props) {
  const { ato_address,displayMode } = props;
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

  function getBindTwitter() {
    const instance = axios.create({
      baseURL: config.API_ATOCHA_URL,
      timeout: 1000,
      responseType: 'json',
      responseEncoding: 'utf8',
    });
    instance.get(`/twitter_bind/${ato_address}`).then(
      function (response) {
        console.log(' --- ---- ', response.data)
        setTwitterBind(response.data)
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
      {twitterBind?.status == `success`?
        <>
          {displayMode=="icon_name_button"?
            <div>
              <table>
                <tr>
                  <td>
                    <img className="ui top aligned image" src={twitterBind.data.twitter_profile_image_url_https} />
                  </td>  
                  <td>
                    Connected Twitter account<br/>
                    <p><a target="_blank" href={`https://twitter.com/${twitterBind.data.twitter_screen_name}`}><h3>{twitterBind.data.twitter_screen_name} <i className="external alternate icon"></i></h3></a></p>            
                  </td>
                </tr>
              </table><br/>
              <p><a className="ui twitter button" href={`${config.API_ATOCHA_URL}/unbind/${ato_address}/${btoa(window.location.href.split('?')[0])}`}><i className="twitter icon"></i> Disconnect</a></p>
            </div>
          :
            <>
              {displayMode=="icon_name"?
                <div style={{textAlign:"center"}}>
                  <p><img className="ui top aligned small circular image" src={twitterBind.data.twitter_profile_image_url_https} /></p>
                  <p><a target="_blank" href={`https://twitter.com/${twitterBind.data.twitter_screen_name}`}><h3>{twitterBind.data.twitter_screen_name} <i className="external alternate icon"></i></h3></a></p>            
                </div>
              :
                <span>{twitterBind.data.twitter_screen_name}</span>
              } 
            </>
          }  
        </>   
      :
        <>
          {displayMode=="icon_name_button"?
            <div>
              <a className="ui twitter button" href={`${config.API_ATOCHA_URL}/bind/${ato_address}/${btoa(window.location.href.split('?')[0])}`}><i className="twitter icon"></i> Connect to Twitter</a>
            </div>
          :
            <>
              {displayMode=="icon_name"?
                <div style={{textAlign:"center"}}>
                  <img className="ui top aligned small image" src="https://atocha.io/wp-content/uploads/2021/12/img_210318.png" />
                </div>
              :
                <span><Link to={`/user_home/${ato_address}`}>{ato_address?getKeyringName(ato_address):'*'}</Link></span>
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
