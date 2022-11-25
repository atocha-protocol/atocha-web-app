import React,{useEffect,useState} from 'react';
import {Routes,Route,Link,BrowserRouter} from "react-router-dom";
import {Form,Input,Checkbox,Grid,Card,Statistic,TextArea,Label,Table,Container,Button} from 'semantic-ui-react';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import sha256 from 'sha256';
import axios from 'axios';
import config from '../config';

import {TxButton} from '../substrate-lib/components';
import MakeAnswerSha256WithSimple from '../units/MakeAnswerSha256';
import {web3FromSource} from '@polkadot/extension-dapp';
import {hexToBigInt,hexToString} from "@polkadot/util";
import TextType from "../units/TextType";

function Main (props) {
  const {api, currentAccount} = useSubstrateState();

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = currentAccount;
    let fromAcct;
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }
    return fromAcct;
  };

  function getAnswerFormat(inAnswer){
    var a="";
    if(TextType.isType(inAnswer,TextType.TEXT_TYPE.FULL_ASCII)){
      if(TextType.isType(inAnswer,TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE)){
        if(/^[0-9 ]+$/.test(inAnswer)){          
          if(/^[ ]+$/.test(inAnswer)){
            a="all spaces";
          }
          else{
            a="all numbers (0-9)";  
          }
        }
        else{
          a="all lowercase english letters (a-z)";  
        }
      }
      else if(TextType.isType(inAnswer,TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE)){
        a="all uppercase english letters (A-Z)";
      }
      else{
        a="all english letters (a-z A-Z)";
      }
    }
    else{
      a="contains symbol/punctuation/non-english characters";
    }

    var b="";
    if(/\d/.test(inAnswer)){
      b="contains numbers (0-9)";
    }
    else{
      b="not contain numbers (0-9)"; 
    }

    var c="";
    if(TextType.isType(inAnswer,TextType.TEXT_TYPE.HAS_SPACE) && !TextType.isType(inAnswer,TextType.TEXT_TYPE.NO_SPACE)){
      //c="contains spaces";
    }
    else if(!TextType.isType(inAnswer,TextType.TEXT_TYPE.HAS_SPACE) && TextType.isType(inAnswer,TextType.TEXT_TYPE.NO_SPACE)){
      //c="not contain spaces";
    }
    else{
      //return false;
    }
    if(/\s/.test(inAnswer)){
      b="contains spaces";
    }
    else{
      b="not contain spaces"; 
    }


    var d="";
    if(a=="all numbers (0-9)"){
      d=a+", "+c;    
    }
    else{
      d=a+", "+b+", "+c;
    }    
    return d;
  }

  function getAnswerFormat2(inAnswer){
    const patternM=new RegExp(/^[a-zA-Z0-9 ]+$/);
    const patternL=new RegExp(/^[a-z]+$/);
    const patternU=new RegExp(/^[A-Z]+$/);

    if(patternM.test(inAnswer)){
      if(patternL.test(inAnswer)){
        return("Lower");
      }
      else if(patternU.test(inAnswer)){
        return("Upper");
      }
      else{
        return("Mixed");  
      }      
      
    }
    else{
      return("Other");
    }
  }

  function getAnswerFormat3(inAnswer){
    if(inAnswer==""){
      return("blank");
    }
    else if(/^[0-9 ]+$/.test(inAnswer)){      
      if(/^[0-9]+$/.test(inAnswer)){
        return("all numbers");
      }
      else{
        if(/^[ ]+$/.test(inAnswer)){
          return("all spaces");
        }
        else{
          return("all numbers and spaces");
        }
      }
    }
    else{
      if(/^[a-zA-Z0-9 ]+$/.test(inAnswer)){
        if(/^[a-z0-9 ]+$/.test(inAnswer)){
          if(/\d/.test(inAnswer)){
            if(/\s/.test(inAnswer)){
              return("all lowercase english letters, contains numbers, contains spaces");     
            }
            else{
              return("all lowercase english letters, contains numbers, not contain spaces");
            }
          }
          else{
            if(/\s/.test(inAnswer)){
              return("all lowercase english letters, not contain numbers, contains spaces");     
            }
            else{
              return("all lowercase english letters, not contain numbers, not contain spaces");
            }
          }
        }
        else if(/^[A-Z0-9 ]+$/.test(inAnswer)){
          if(/\d/.test(inAnswer)){
            if(/\s/.test(inAnswer)){
              return("all uppercase english letters, contains numbers, contains spaces");     
            }
            else{
              return("all uppercase english letters, contains numbers, not contains spaces");
            }
          }
          else{
            if(/\s/.test(inAnswer)){
              return("all uppercase english letters, not contain numbers, contains spaces");     
            }
            else{
              return("all uppercase english letters, not contain numbers, not contain spaces");
            }
          }
        } 
        else{
          if(/\d/.test(inAnswer)){
            if(/\s/.test(inAnswer)){
              return("all english letters, contains numbers, contains spaces");     
            }
            else{
              return("all english letters, contains numbers, not contains spaces");
            }
          }
          else{
            if(/\s/.test(inAnswer)){
              return("all english letters, not contain numbers, contains spaces");     
            }
            else{
              return("all english letters, not contain numbers, not contain spaces");
            }
          }
        }       
      }
      else{
        if(/\d/.test(inAnswer)){
          if(/\s/.test(inAnswer)){
            return("contains symbol/punctuation/non-english characters, contains numbers, contains spaces");     
          }
          else{
            return("contains symbol/punctuation/non-english characters, contains numbers, not contain spaces");
          }
        }
        else{
          if(/\s/.test(inAnswer)){
            return("contains symbol/punctuation/non-english characters, not contain numbers, contains spaces");     
          }
          else{
            return("contains symbol/punctuation/non-english characters, not contain numbers, not contain spaces");
          }
        }
      }      
    }
  }

  const [storageJson, setStorageJson] = useState({});
  const [storageLength, setStorageLength] = useState('');
  const [storageHash, setStorageHash] = useState('');
  
  const [maxFee, setMaxFee] = useState(0);

  const [status, setStatus] = useState(null);

  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [puzzleFileContent, setPuzzleFileContent] = useState({});
  const [puzzleTextContent, setPuzzleTextContent] = useState({});
  const [puzzleFullScreenContent, setPuzzleFullScreenContent] = useState({});
  const [atoIfShowFullScreenHelp, setAtoIfShowFullScreenHelp] = useState(0);
  const [atoIfPPTChecked, setAtoIfPPTChecked] = useState(false);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleAnswerHash, setPuzzleAnswerHash] = useState('');
  const [puzzleAnswerFormatContent, setPuzzleAnswerFormatContent] = useState('');
  const [puzzleDeposit, setPuzzleDeposit] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState(0);
  const [puzzleHash, setPuzzleHash] = useState('');

  const [configAtochaModule, setConfigAtochaModule] = useState(null);
  const [configAtochaFinance, setConfigAtochaFinance] = useState(null);
  const [configAtochaModuleMinBonusOfPuzzle, setConfigAtochaModuleMinBonusOfPuzzle] = useState(0);

  useEffect(() => { 
    const puzzleIfPPTContent={
      type: 'text',
      data: atoIfPPTChecked,
      fieldId: 'ifPPT'
    };

    const storageJson = {
      puzzle_title: puzzleTitle,
      puzzle_content: [
        puzzleTextContent,
        puzzleFileContent,
        puzzleFullScreenContent,
        puzzleAnswerFormatContent,
        puzzleIfPPTContent
      ]
    };
    const decimals = api.registry.chainDecimals;
    setMaxFee(BigInt(5000 * (10 ** decimals)));

    const jsonStr = JSON.stringify(storageJson);
    const jsonHash = sha256(encodeURIComponent(jsonStr));
    setStorageJson(storageJson);
    setStorageLength(jsonStr.length);
    setStorageHash(jsonHash);

    console.log('CreatePuzzle.js|main|useEffect|storageJson',storageJson);
    //console.log('CreatePuzzle.js|main|useEffect|currentAccount/storageJson/storageLength/storageHash',currentAccount,storageJson,storageLength,storageHash);
    //console.log('CreatePuzzle.js|main|useEffect|currentAccount', currentAccount);
    //console.log('CreatePuzzle.js|main|useEffect|storageJson', storageJson);
    //console.log('CreatePuzzle.js|main|useEffect|storageLength', storageLength);
    //console.log('CreatePuzzle.js|main|useEffect|storageHash', storageHash);
    //console.log('debug=', sha256(encodeURIComponent('加油加油，中文')));
  }, [api.query.atochaFinance, puzzleTitle, puzzleTextContent, puzzleFileContent, puzzleFullScreenContent,puzzleAnswerFormatContent,atoIfPPTChecked]);
  
  useEffect( () => {
    async function fetchData() {
      if(configAtochaModule == null) {
        const cam = await api.query.atochaModule.atoConfig();
        setConfigAtochaModule(cam.toJSON());
      }
      if(configAtochaFinance == null) {
        const caf = await api.query.atochaFinance.atoConfig2();
        setConfigAtochaFinance(caf.toJSON());
      }
      if(configAtochaModule){
        setConfigAtochaModuleMinBonusOfPuzzle((parseFloat(hexToBigInt(configAtochaModule.minBonusOfPuzzle)/BigInt(10**14)).toString())/10000);
      }
    }
    fetchData()

  }, [configAtochaModule, configAtochaFinance]);

  function handleFileChosen (file) {
    //console.log(file);
    const fileReader = new FileReader();
    fileReader.onloadend = e => {
      //console.log(fileReader.result);
      setPuzzleFileContent({
        type: 'file',
        data: fileReader.result
      });
    };
    fileReader.readAsDataURL(file);
  }

  function handleContent (content) {
    setPuzzleTextContent({
      type: 'text',
      data: content
    });
  }

  function handleFullScreen (content) {
    setPuzzleFullScreenContent({
      type: 'text',
      data: content,
      fieldId: 'fullScreen'
    });
  }  

  function handleIfPPT (content) {
    setAtoIfPPTChecked(!atoIfPPTChecked);

  }  

  function handleAnswer (inContent) {
    setPuzzleAnswer(inContent);
    setPuzzleAnswerFormatContent({
      type: 'text',
      data: getAnswerFormat3(inContent),
      fieldId: 'answerFormat'
    });
    console.log("CreatePuzzle.js|main|handleAnswer|puzzleAnswerFormatContent",puzzleAnswerFormatContent);
  }  

  function handleDeposit (num) {
    const decimals = api.registry.chainDecimals;
    setPuzzleDeposit(BigInt(num * (10 ** decimals)));
  }

  function txStatusChanged (inNewStatus) {
    console.log("CreatePuzzle.js|main|txStatusChanged|inNewStatus",inNewStatus)
    if (inNewStatus.isInBlock) {
      //console.log("Is InBlock")
      //setStatus("Extrinsic succeed.")
      //console.log('Submitting to arweave...');
      setStatus("Submitting to arweave...");
      axios.post(config.ARWEAVE_HTTP, storageJson).then(response => {
        //console.log('Request data: ', response.data);
        if (response.data.result == 'ok') {
          const ph = response.data.result_id;//puzzle hash
          const pah = MakeAnswerSha256WithSimple(puzzleAnswer, response.data.result_id);//puzzle answer hash
          setPuzzleHash(ph);
          setPuzzleAnswerHash(pah);
          submitPuzzle2Atocha(ph, pah);
        }else{
          //console.log('Ar storage error : ', response);
          setStatus("Something went wrong. Error code: TSC101");
        }
      }, err => {
        //console.log('Request err:', err);
        setStatus("Something went wrong. Error code: TSC102-2");
      }).catch((err) => {
        //console.log('Catch err:', err);
        setStatus("Something went wrong. Error code: TSC103");
      });
    } else {
      //console.log("Not InBlock")
      //setStatus("Extrinsic failed.");
      setStatus("Something went wrong. Error code: TSC104");
    }
  }

  async function submitPuzzle2Atocha (inPuzzleHash, inAnswerHash) {
    if(storageJson.puzzle_title=="") {
      setStatus("Puzzle title can not be empty!");
      alert("Puzzle title can not be empty!");
      return;
    }
    setStatus("Submitting to Atocha...");
    const fromAcct = await getFromAcct();
    const unsub = await api.tx.atochaModule
      .createPuzzle(inPuzzleHash, inAnswerHash, puzzleDeposit, 1, 0)
      .signAndSend(fromAcct, (result) => {
        //setStatus(`4444submit status: ${result.status}`);
        if (result.status.isInBlock) {
          //setStatus(`5555submit status: ${result.status} - ${result.status.asInBlock}`);
          //setStatus("InBlock...");
        } else if (result.status.isFinalized) {
          //setStatus(`6666submit status: ${result.status} - ${result.status.asFinalized}`);
          setStatus("😉 Done! This puzzle has been saved on the chain and will be showned on the puzzle list in a minute.");
          unsub();
        }
      });
  }

  return (
    <div>
      <h1>Create a puzzle</h1>
      <Form>
        <Form.Field>
          <Input
            label='1. Puzzle title'
            type='text'
            onChange={(_, { value }) => setPuzzleTitle(value) }
          /><div className='ato_form_div_explain'>States clearly in one phrase about the puzzle, eg: Guess a xxx, Name the xxx, Locate the xxx, etc</div>
        </Form.Field>
        <Form.Field>
          <Input
            type='file'
            id='file'
            label='2. Image (optional)'
            accept='.png,.jpeg,.jpg,.gif'
            onChange={e => handleFileChosen(e.target.files[0])}
          /><div className='ato_form_div_explain'>Recommended file size: 500k</div>
        </Form.Field>
        <Form.Field>
          <div className="ui large label"><strong>3. Puzzle content</strong></div>
          <TextArea
            onChange={(_, { value }) => handleContent(value) }
          />
          <div className='ato_form_div_explain'>Text only, HTML will be ignored. Make sure it contains the question, the clue/tips (optional), the expected answer format (full caps, numerical, mix, etc).</div>
        </Form.Field>
        <Form.Field>
          <Input
            label='4. Full screen media URL (optional)'
            type='text'
            onChange={(_, { value }) => handleFullScreen(value) }
          />
          <div className='ato_form_div_explain'>
            <p>
              Google map with street view and Youtube video can be used as full screen media for a puzzle.&nbsp;&nbsp;
              <Link to="/puzzle_detail/1rf1szPK4wEBh9ytHtLx5D9PfnhOwAhXtGlRH9uGRM0"><i className="angle right icon"></i>See a demo</Link>&nbsp;&nbsp;
              <a style={{cursor:"pointer"}} onClick={()=>setAtoIfShowFullScreenHelp(1)}><i className="angle down icon"></i>How to get the URL?</a>
            </p>
            {atoIfShowFullScreenHelp?
              <p>
                <h4>1. Google.com/maps</h4>
                <p><img src="https://atocha.io/wp-content/uploads/2022/07/atocha-fullscreen-help_001.png" /></p>
                <p>Goog2le.com/maps->Share or embed image->Embed a map->src of iframe<br/>eg: https://www.google.com/maps/embed?pb=!4v1656957228244!6m8!1m7!1sCAoSLEFGMVFpcE1vT0NScV9PbEp2MW1aRjRZOUQ5aVF4eDdpSHJacXRST1dZODZD!2m2!1d51.4865869576732!2d-0.09280428544605002!3f40!4f10!5f0.7820865974627469</p>
                <h4>2. Youtube.com</h4>
                <p><img src="https://atocha.io/wp-content/uploads/2022/07/atocha-fullscreen-help_002.png" /></p>
                <p>Youtube.com->Share->Embed->Embed video->src of iframe<br/>eg: https://www.youtube.com/embed/LFIEjmnvFm8</p>
                <p><a style={{cursor:"pointer"}} onClick={()=>setAtoIfShowFullScreenHelp(0)}><i className="angle up icon"></i> Close</a></p>
              </p>                
            :""}
          </div>
        </Form.Field>        





        <Form.Field>
          <div className="ui large label">5. Presentation mode (optional)</div>&nbsp;&nbsp;
          <Checkbox
            checked={atoIfPPTChecked}
            label="Enabled"
            onChange={() => setAtoIfPPTChecked(!atoIfPPTChecked)}
            style={{verticalAlign:"middle"}}
          />
          <div className='ato_form_div_explain'>Puzzles without full screen media can be shown in presentation mode. <Link to="/puzzle_detail/k9pDQBBuHUbWheaLTKS_ldxwmhp_hktGMrm633g0NPY"><i className="angle right icon"></i>See a demo</Link></div>  
        </Form.Field>




        <Form.Field>
          <Input
            label='6. Puzzle answer'
            type='text'
            onChange={(_, { value }) => handleAnswer(value) }
          /><div className='ato_form_div_explain'>Answer must be short and specific, recommended answer should be one to two combination.</div>
        </Form.Field>
        <Form.Field>
          <Input
            label='Answer format'
            type='text'
            value={puzzleAnswerFormatContent.data}
          /><div className='ato_form_div_explain'>Answer format is auto-generated from your input answer and it is non-editable. It will be stored and published with the puzzle.</div>
        </Form.Field>        
        <Form.Field>
          <Input
            label={`7. Prize sponsored by yourself`}
            type='number'
            state='amount'
            onChange={(_, { value }) => handleDeposit(value) }
          /><div className='ato_form_div_explain'>Minimum amount: {configAtochaModuleMinBonusOfPuzzle}</div>
        </Form.Field>
        <Form.Field style={{ textAlign: 'left' }}>
          <TxButton
            label='Submit your puzzle'
            className="ui primary button blue"
            color="blue"
            type='SIGNED-TX'
            setStatus={setStatus}
            refStatus={txStatusChanged}
            attrs={{
              palletRpc: 'atochaFinance',
              callable: 'preStorage',
              inputParams: [storageHash, storageLength, maxFee],
              paramFields: [true, true, true]
            }}
          /><div className='ato_form_div_explain'>You need to sign twice since your puzzle will be stored permanently on both Atocha blockchain and <a href="https://arweave.org">Arweave network</a>.</div>
        </Form.Field>
        <Form.Field>
          {status}
        </Form.Field>  
      </Form>
    </div>
  );
}

export default function CreatePuzzle (props) {
  return <Main {...props} />
}
