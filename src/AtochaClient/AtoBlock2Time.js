import React, { useEffect, useState } from 'react';
import {useSubstrate} from "../substrate-lib";
import config from '../config';

function Main (props) {
  const {bigBlock,smallBlock,ifShowSmallBlock}=props;
  //alert(bigBlock);
  //alert(smallBlock);
  
  function atoBlock2Time(bigBlock,smallBlock,ifShowSmallBlock){
    if(typeof(bigBlock)=="undefined" || typeof(smallBlock)=="undefined"){
      return "@Error@";
    }
    else{
      bigBlock=Number(bigBlock);
      smallBlock=Number(smallBlock);
      if(bigBlock>=smallBlock && smallBlock>=0){
        var s=(bigBlock-smallBlock)*6
        var day = Math.floor( s/ (24*3600) ); 
        var hour = Math.floor( (s - day*24*3600) / 3600); 
        var minute = Math.floor( (s - day*24*3600 - hour*3600) /60 ); 
        var second = s - day*24*3600 - hour*3600 - minute*60; 
        return day + " days "  + hour + " hours " + minute + " minutes " + second + " seconds";
      }
      else{
        return "@@Error@@";
      }      
    }
  }

  useEffect( () => {
  }, []);

  return (
    <span title={`Block ${bigBlock} - Block ${smallBlock} = ${bigBlock-smallBlock} blocks`}>{atoBlock2Time(bigBlock,smallBlock)}</span>
  );
}

export default function AtoBlock2Time (props) {
  const {bigBlock,smallBlock,ifShowSmallBlock} = props;
  return <Main {...props} />;
}
