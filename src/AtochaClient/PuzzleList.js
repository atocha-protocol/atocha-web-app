import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table, Tab} from 'semantic-ui-react';

import config from '../config';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import ArweaveTitle from "./ArweaveTitle";

import ClientAtochaCreator from "./ClientAtochaCreator";
import {useAtoContext, useAtoContextState} from "./AtoContext";
import PointsRankList from "./PointsRankList";
import UserHomeLink from "./UserHomeLink";
import AtoBlockWithLink from "./AtoBlockWithLink";
import BindAddressToTwitter from "./BindAddressToTwitter";

var atoPuzzleList=new Array();

function Main (props) {
  const {apollo_client, gql, puzzleSets: {pubPuzzleList, setPubPuzzleList, pubPuzzleRelist, setPubPuzzleListType, pubRefresh, updatePubRefresh} , chainData: {pubBlockNumber} } = useAtoContext()
  const { api } = useSubstrateState();
  const [newPuzzle, setNewPuzzle] = useState(null);
  const [atoCurrentPuzzleListStatusClass, setAtoCurrentPuzzleListStatusClass] = useState("ui tiny yellow label");
  const [atoCurrentPuzzleListStatusTitle, setAtoCurrentPuzzleListStatusTitle] = useState("UNSOLVED");
  const [atoCurrentPuzzleListStatusOrder, setAtoCurrentPuzzleListStatusOrder] = useState("ordered by prize");

  function updatePuzzleList(type) {
    //alert("updatePuzzleList");
    if(type=="UNSOLVED"){
      setAtoCurrentPuzzleListStatusClass("ui tiny yellow label");
      setAtoCurrentPuzzleListStatusTitle(type);
      setAtoCurrentPuzzleListStatusOrder("ordered by prize");
    }
    else if(type=="CHALLENGABLE"){
      setAtoCurrentPuzzleListStatusClass("ui tiny orange label");
      setAtoCurrentPuzzleListStatusTitle(type);
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }
    else if(type=="SOLVED"){
      setAtoCurrentPuzzleListStatusClass("ui tiny violet label");
      setAtoCurrentPuzzleListStatusTitle(type);
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }    
    else if(type=="JUDGING"){
      setAtoCurrentPuzzleListStatusClass("ui tiny grey label");
      setAtoCurrentPuzzleListStatusTitle(type);
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    } 
    else if(type=="INVALID"){
      setAtoCurrentPuzzleListStatusClass("ui tiny black label");
      setAtoCurrentPuzzleListStatusTitle(type);
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }  
    else{
      setAtoCurrentPuzzleListStatusClass("ui tiny label");
      setAtoCurrentPuzzleListStatusTitle(type);
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }                    
    setPubPuzzleListType(type);
  }
  
  // Puzzle information.
  useEffect(() => {
    updatePuzzleList(atoCurrentPuzzleListStatusTitle);
  }, [pubRefresh]);

  return (
    <div>
      <h1>Puzzle list</h1>
      <div style={{textAlign:"center"}}>
        <Button className="ui small yellow button ReSeTs_statusButton" onClick={()=>updatePuzzleList('UNSOLVED')}>UNSOLVED</Button>
        <Button className="ui small orange button ReSeTs_statusButton" onClick={()=>updatePuzzleList('CHALLENGABLE')}>CHALLENGABLE</Button>
        <Button className="ui small violet button ReSeTs_statusButton" onClick={()=>updatePuzzleList('SOLVED')}>SOLVED</Button>
        <Button className="ui small grey button ReSeTs_statusButton" onClick={()=>updatePuzzleList('JUDGING')}>JUDGING</Button>
        <Button className="ui small black button ReSeTs_statusButton" onClick={()=>updatePuzzleList('INVALID')}>INVALID</Button>
      </div>
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell style={{width:"50%"}}><strong><div className={atoCurrentPuzzleListStatusClass}>{atoCurrentPuzzleListStatusTitle}</div> Puzzles</strong> <small><i>{atoCurrentPuzzleListStatusOrder}</i></small></Table.Cell>
            <Table.Cell><strong>Creator</strong></Table.Cell>
            <Table.Cell><strong>Created</strong></Table.Cell>
            <Table.Cell><strong>Prize</strong></Table.Cell>
          </Table.Row>
          {pubPuzzleRelist.map(puzzleObj=><Table.Row key={puzzleObj.puzzleHash}>
            <Table.Cell><ArweaveTitle puzzle_hash={puzzleObj.puzzleHash}/></Table.Cell>
            <Table.Cell><UserHomeLink user_address={puzzleObj.whoId} /></Table.Cell>            
            <Table.Cell>
              <AtoBlockWithLink blockNo={puzzleObj.eventBn} />
            </Table.Cell>
            <Table.Cell>{puzzleObj.dynTotalDeposit}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </div>
  );
}

export default function PuzzleList (props) {
  const { api } = useSubstrateState();
  const { apollo_client, gql } = useAtoContext();
  return api.query && apollo_client && gql
    ? <Main {...props} />
    : null;
}
