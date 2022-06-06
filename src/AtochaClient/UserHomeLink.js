import React, { useEffect, useState } from 'react';
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {useSubstrate} from "../substrate-lib";
import getShortText from "../units/GetShortText";

function Main (props) {
  const { user_address } = props;
  const {
    state: { keyring, currentAccount },
  } = useSubstrate()

  function getKeyringName(addr) {
    for(let k in keyring.getPairs()) {
      let keyPair = keyring.getPairs()[k];
      let metaName = keyPair.meta.name.toUpperCase();
      let address = keyPair.address;
      if(addr == address) return metaName;
    }
    return getShortText(addr);
  }

  // Puzzle information.
  useEffect( () => {

  }, []);

  return (
    <>
      <Link to={`/user_home/${user_address}`}>{user_address?getKeyringName(user_address):'*'}</Link>
    </>
  );
}

export default function UserHomeLink (props) {
  const { user_address } = props;
  return user_address
    ? <Main {...props} />
    : null;
}
