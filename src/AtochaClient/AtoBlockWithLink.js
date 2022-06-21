import React, { useEffect, useState } from 'react';
import {useSubstrate} from "../substrate-lib";
import config from '../config';

function Main (props) {
  const {blockNo}=props;

  useEffect( () => {
  }, []);

  return (
    <span><a href={`${config.OCT_EXPLORER}/blocks/${blockNo}`} target='_blank'>Block {blockNo} <i class="external alternate icon"></i></a></span>
  );
}

export default function AtoBlockWithLink (props) {
  const {blockNo} = props;
  return <Main {...props} />;
}
