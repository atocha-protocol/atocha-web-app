import React, {createRef, useState} from 'react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider, useSubstrateState } from './substrate-lib'
import {AtoContextProvider} from "./AtochaClient/AtoContext";

function Main() {
  const contextRef = createRef()
  return (
    <div ref={contextRef}>
      Smooth
    </div>
  )
}

export default function AppSmooth() {
  return (
    <SubstrateContextProvider>
      <AtoContextProvider>
        <Main />
      </AtoContextProvider>
    </SubstrateContextProvider>
  )
}
