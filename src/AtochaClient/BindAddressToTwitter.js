import React, {useEffect, useState} from 'react';
// const axios = require('axios').default;
import axios from "axios";
import config from "../config";

function Main(props) {
  const {ato_address} = props;
  const [twitterBind, setTwitterBind] = useState(null)

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
  }, [ato_address]);

  return (
    <div>
      {twitterBind?.status == `success` ? <>
          <img src={twitterBind.data.twitter_profile_image_url_https}/>
          <div>{twitterBind.data.twitter_screen_name}</div>
          <div>
            <a href={`${config.API_ATOCHA_URL}/unbind/${ato_address}/${btoa(window.location)}`}>Unbind twitter</a>
          </div>
        </> :
        <>
          <span>{ato_address} </span>
          <a href={`${config.API_ATOCHA_URL}/bind/${ato_address}/${btoa(window.location)}`}>Bind twitter</a>
        </>
      }
    </div>
  );
}

export default function BindAddressToTwitter (props)
{
  const {ato_address} = props;
  return ato_address
    ? <Main {...props} />
    : null;
}
