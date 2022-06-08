import React, { useEffect, useState } from 'react';
import {useSubstrate} from "../substrate-lib";

function Main (props) {
  const {withThousand}=props;
  //alert(withThousand);
  
  function atoDeleteThousand(withThousand){
    if(withThousand && withThousand!=undefined && withThousand!=null){
      let _num = withThousand;
      _num = _num.toString();
      _num = _num.replace(/,/gi,'');
      _num = _num/(10**18);
      return _num;
      //return withThousand;
    }else{
      return "@@Error@@";
    }
  }

  useEffect( () => {
  }, []);

  return (
    <span>{atoDeleteThousand(withThousand)}</span>
  );
}

export default function AtoDeleteThousand (props) {
  const {withThousand} = props;
  return <Main {...props} />;
}
