import React,{useEffect,useState} from 'react';
import {Form,Input,Grid,Card,Statistic,TextArea,Label,Table,Container,Button} from 'semantic-ui-react';
import {useSubstrate, useSubstrateState} from '../substrate-lib';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";
import config from '../config';

import ArweaveTitle from "./ArweaveTitle";
import UserHomeLink from "./UserHomeLink";
import AtoBlockWithLink from "./AtoBlockWithLink";
import BindAddressToTwitter from "./BindAddressToTwitter";

var atoReloadTimes=0;

function Main (props) {
  //console.log("PuzzleList2.js|main");
  const {api} = useSubstrateState();
  const apollo_client = new ApolloClient({
    uri: config.SUBQUERY_HTTP,
    cache: new InMemoryCache(),
  });

  const atoPageSize=30;

  const [atoBlockNo, setAtoBlockNo] = useState("-1");  
  const [atoSavedBlockNo, setAtoSavedBlockNo] = useState("-1");  
  const [atoCurrentPuzzleListStatusTitle, setAtoCurrentPuzzleListStatusTitle] = useState("UNSOLVED");
  const [atoCurrentPuzzleListStatusClass, setAtoCurrentPuzzleListStatusClass] = useState("ui tiny yellow label");
  const [atoCurrentPuzzleListStatusOrder, setAtoCurrentPuzzleListStatusOrder] = useState("ordered by creation time");
  const [atoCurrentPage, setAtoCurrentPage] = useState(1);
  const [atoCurrentPuzzleListArr, setAtoCurrentPuzzleListArr] = useState([]);

  function getBlockNoLinked(){    
    api.derive.chain.bestNumber(number => {
      console.log("PuzzleList2.js|main|getBlockNoLinked|derive");
      var bn=number.toString().toLocaleString('en-US');
      setAtoBlockNo(bn);
      if(atoReloadTimes==0){        
        setAtoSavedBlockNo(bn);
        atoReloadTimes=atoReloadTimes+1;        
      }
    }).then().catch(console.error);
  }

  function getPuzzleList() {
        //alert("PuzzleList.js|main|getPuzzleList");

        const filter_UNSOLVED = `
        filter: {
            dynHaveMatchedAnswer:{
                equalTo: false
            }
        }
        `

        const filter_CHALLENGABLE = `
        filter: {
            dynHaveMatchedAnswer:{
              equalTo: true,
            },
            or:[
              {
                dynChallengeDeadline:{
                greaterThan: "${atoSavedBlockNo}",
                },
              },{
                dynRaiseDeadline:{
                greaterThan: "${atoSavedBlockNo}"
              }
              }
            ],
            dynChallengeStatus:{
              equalTo: "Raise"
            }
          }
        `

        const filter_SOLVED = `
        filter: {
                or:[
                  {
                    dynPuzzleStatus:{
                      equalTo: "PUZZLE_STATUS_IS_FINAL"
                    },
                    dynChallengeStatus:{
                      notEqualTo: "JudgePassed"
                    }
                  },
                  
                  {
                    dynChallengeStatus:{
                      equalTo: "JudgeRejected"
                    }
                  },
                  
                  {
                    dynChallengeStatus:{
                      equalTo: "RaiseFundsBack"
                    }
                  },
                  
                  {
                    dynPuzzleStatus:{
                      equalTo: "PUZZLE_STATUS_IS_SOLVED"
                    },
                    dynRaiseDeadline: {
                      equalTo: "0"
                    },
                    dynChallengeDeadline: {
                      lessThan: "${atoSavedBlockNo}"
                    }
                  }, 
                  
                  {
                    dynPuzzleStatus:{
                      equalTo: "PUZZLE_STATUS_IS_SOLVED"
                    },
                    dynChallengeStatus: {
                      equalTo: "Raise"
                    },
                    dynRaiseDeadline: {
                      greaterThan: "0"
                    },
                    and: [
                      {
                        dynRaiseDeadline: {
                          lessThan: "${atoSavedBlockNo}"
                        }
                      }
                    ]
                  }
                ]
              }
        `

        const filter_INVALID = `
        filter: {
                dynChallengeStatus:{
                    equalTo:"JudgePassed"
                }
        }
        `

        const filter_JUDGING = `
            filter: {
                dynChallengeStatus:{
                    equalTo:"RaiseCompleted"
                }
            }
        `

        let filter_result = filter_UNSOLVED;

        switch (atoCurrentPuzzleListStatusTitle) {
            case 'UNSOLVED':
                filter_result = filter_UNSOLVED;
                break;
            case 'CHALLENGABLE':
                filter_result = filter_CHALLENGABLE;
                break;
            case 'SOLVED':
                filter_result = filter_SOLVED;
                break;
            case 'JUDGING':
                filter_result = filter_JUDGING;
                break;
            case 'INVALID':
                filter_result = filter_INVALID;
                break;
        }

        apollo_client.query({
            query: gql`
                query{
                    puzzleCreatedEvents(first:${atoPageSize},offset:${(atoCurrentPage-1)*atoPageSize},orderBy:EVENT_BN_DESC, ${filter_result}){
                        nodes{
                            whoId,
                            puzzleHash,
                            createBn,
                            eventBn,
                            eventHash,
                            dynRaiseDeadline,
                            dynChallengeDeadline,
                            dynPuzzleStatus,
                            dynHaveMatchedAnswer,
                            dynChallengeStatus,
                            dynTotalDeposit,
                            ref_challenge_infos{
                                totalCount
                            },
                            ref_challenge_status(orderBy:EVENT_BN_DESC){
                                totalCount,
                                nodes{
                                    challengeStatus
                                }
                            },
                            ref_answer_infos(orderBy:EVENT_BN_DESC){
                                totalCount,
                                nodes{
                                    answerContent,
                                    eventBn,
                                    resultType
                                }
                            }
                        }
                    }
                }
            `
        }).then(result => {
            //alert("PuzzleList2.js|main|queryPuzzleList|result");
            //console.log("**********PuzzleList2.js|main|queryPuzzleList|result");
            //console.log(result);
            //console.log("PuzzleList2.js|main|queryPuzzleList|result.data.puzzleCreatedEvents",result.data.puzzleCreatedEvents);
            //setPubPuzzleList(result.data.puzzleCreatedEvents.nodes);
            //setPubPuzzleList(result.data.puzzleCreatedEvents.nodes);

            var pl=new Array();
            var i=0;            
            result.data.puzzleCreatedEvents.nodes.forEach(function (item) {
                pl[i]=new Object();
                pl[i]["puzzleHash"]=item["puzzleHash"];
                pl[i]["whoId"]=item["whoId"];
                pl[i]["eventBn"]=item["eventBn"];
                pl[i]["eventHash"]=item["eventHash"];
                pl[i]["dynTotalDeposit"]=item["dynTotalDeposit"]/(10**18);
                i++;
            });
            if(atoCurrentPuzzleListStatusTitle=="11111UNSOLVED"){
                pl.sort(function(a,b){
                    return b.dynTotalDeposit - a.dynTotalDeposit
                });
            }            
            setAtoCurrentPuzzleListArr(pl);
        });
  }

  function handleStatusSelected(inStatus) {
    //alert("PuzzleList.js|main|handleStatusSelected");
    setAtoCurrentPage(1);

    if(inStatus=="UNSOLVED"){
      setAtoCurrentPuzzleListStatusTitle(inStatus);
      setAtoCurrentPuzzleListStatusClass("ui tiny yellow label");      
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }
    else if(inStatus=="CHALLENGABLE"){
      setAtoCurrentPuzzleListStatusTitle(inStatus);
      setAtoCurrentPuzzleListStatusClass("ui tiny orange label");      
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }
    else if(inStatus=="SOLVED"){
      setAtoCurrentPuzzleListStatusTitle(inStatus);
      setAtoCurrentPuzzleListStatusClass("ui tiny violet label");
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }    
    else if(inStatus=="JUDGING"){
      setAtoCurrentPuzzleListStatusTitle(inStatus);
      setAtoCurrentPuzzleListStatusClass("ui tiny grey label");      
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    } 
    else if(inStatus=="INVALID"){
      setAtoCurrentPuzzleListStatusTitle(inStatus);
      setAtoCurrentPuzzleListStatusClass("ui tiny black label");      
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }  
    else{
      setAtoCurrentPuzzleListStatusTitle(inStatus);
      setAtoCurrentPuzzleListStatusClass("ui tiny label");      
      setAtoCurrentPuzzleListStatusOrder("ordered by creation time");
    }
  }
  
  function handlePreviousPage(){
    //alert("PuzzleList.js|main|handlePreviousPage");
    if(atoCurrentPage<=1){
      setAtoCurrentPage(1);
    }
    else{
      setAtoCurrentPage(atoCurrentPage-1);  
    }    
  }

  function handleNextPage(){
    //alert("PuzzleList.js|main|handleNextPage");
    setAtoCurrentPage(atoCurrentPage+1);
  }

  useEffect(() => {
    //alert("PuzzleList2.js|main|useEffect");
    console.log("PuzzleList2.js|main|useEffect");
    atoReloadTimes=0;
    getBlockNoLinked();
    getPuzzleList();
  },[atoCurrentPuzzleListStatusTitle,atoCurrentPage]);

  return (
    <div>
      <h1>Puzzle list</h1>
      <div style={{textAlign:"center"}}>
        <Button className="ui small yellow button ReSeTs_statusButton" onClick={()=>handleStatusSelected('UNSOLVED')}>UNSOLVED</Button>
        <Button className="ui small orange button ReSeTs_statusButton" onClick={()=>handleStatusSelected('CHALLENGABLE')}>CHALLENGABLE</Button>
        <Button className="ui small violet button ReSeTs_statusButton" onClick={()=>handleStatusSelected('SOLVED')}>SOLVED</Button>
        <Button className="ui small grey button ReSeTs_statusButton" onClick={()=>handleStatusSelected('JUDGING')}>JUDGING</Button>
        <Button className="ui small black button ReSeTs_statusButton" onClick={()=>handleStatusSelected('INVALID')}>INVALID</Button>
      </div>
      <Table className="ui very basic celled table" style={{width:"100%"}}>
        <Table.Body>
          <Table.Row>
            <Table.Cell style={{width:"50%"}}><strong><div className={atoCurrentPuzzleListStatusClass}>{atoCurrentPuzzleListStatusTitle}</div>&nbsp;&nbsp;Puzzles - {atoCurrentPuzzleListStatusOrder}</strong></Table.Cell>
            <Table.Cell><strong>Creator</strong></Table.Cell>
            <Table.Cell><strong>Created</strong></Table.Cell>
            <Table.Cell><strong>Prize</strong></Table.Cell>
          </Table.Row>
          {atoCurrentPuzzleListArr.map(puzzleObj=><Table.Row key={puzzleObj.puzzleHash} style={atoBlackList4Puzzle[puzzleObj.puzzleHash]}>
            <Table.Cell><ArweaveTitle puzzle_hash={puzzleObj.puzzleHash}/></Table.Cell>
            <Table.Cell><UserHomeLink user_address={puzzleObj.whoId} /></Table.Cell>            
            <Table.Cell>
              <AtoBlockWithLink blockNo={puzzleObj.eventBn} />
            </Table.Cell>
            <Table.Cell>{puzzleObj.dynTotalDeposit}</Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table><br/>
      {atoCurrentPuzzleListArr.length<atoPageSize && atoCurrentPage==1?
        <></>  
      :
        <div style={{textAlign:"center"}}>
          <div className="ui buttons">
            <button className="ui button" onClick={()=>handlePreviousPage()}><i className="arrow left icon"></i>Prev</button>
            <div className="or" data-text={atoCurrentPage}></div>
            <button className="ui positive button" onClick={()=>handleNextPage()}>Next<i className="arrow right icon"></i></button>
          </div>
          <div><br/></div>
        </div>      
      }
      {atoCurrentPuzzleListStatusTitle=="JUDGING"?
        <div style={{textAlign:"center",marginBottom:"1rem"}}>Join our <a target="_blank" href="https://discord.com/channels/893699922581418044/993537799422750721"> <i class="discord icon"></i> puzzle-judging channel</a> where we gather all disputable Puzzles to be discussed and voted on by the community.</div>
      :
        ""
      }
      <div style={{textAlign:"center"}}><i>This page was generated at Block {atoSavedBlockNo}, current block number is {atoBlockNo}</i></div>      
    </div>
  );
}

export default function PuzzleList (props) {
  return <Main {...props} />;
}