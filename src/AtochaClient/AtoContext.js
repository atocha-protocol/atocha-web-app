import React, {createContext, useContext, useEffect, useReducer, useState} from "react";

import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";

import config from "../config";
import error_info from "../config/error.json";

import {useSubstrateState} from "../substrate-lib";

const AtoContext = createContext(null)

const AtoContextProvider = props => {
    const { apiState, apiError, keyringState, api, currentAccount} = useSubstrateState()

    const [helloWorld, setHelloWorld] = useState('None--')
    const [pubPuzzleList, setPubPuzzleList] = useState([])
    const [pubPuzzleListType, setPubPuzzleListType] = useState('UNSOLVED')
    const [pubBlockNumber, setPubBlockNumber] = useState(0)
    const [rewardRankList, setRewardRankList] = useState([])
    const [pubRefresh, setPubRefresh] = useState(0)
    const [userPoints, setUserPoints] = useState(null);
    const [pubPuzzleRelist, setPubPuzzleRelist] = useState([]);

    const apollo_client = new ApolloClient({
        uri: config.SUBQUERY_HTTP,
        cache: new InMemoryCache(),
    });

    function updatePubRefresh() {
        setPubRefresh(pubRefresh+1)
    }

    function extractErrorMsg(index, error) {
        console.log("-----------", index, error)
        if(error_info[index]){
            if(error_info[index][error]){
                return error_info[index][error]
            }
        }
        return null
    }

    // successful call, failed call
    function tryToPollCheck(totalListenQueryStr, successfulCall, failedCall, threshold =0, maxRetry=10) {

        let tmpTimer = 0;
        let tmpRetry = maxRetry;
        let cleanAndUpdateRefreshCall = (isSuccessful) => {
            clearInterval(tmpTimer);
            if(isSuccessful){
                successfulCall();
            }else{
                failedCall();
            }
        };
        let pollCheck = () => {
            tmpRetry--;
            if(tmpRetry<=0){
                cleanAndUpdateRefreshCall(false);
            }
            apollo_client.query({
                query: gql(totalListenQueryStr),
                fetchPolicy: 'no-cache'
            }).then(result => {
                for (var key in result.data) {
                    console.log("key=",key);     //获取key值
                    if(result.data[key]['totalCount'] == undefined || result.data[key]['totalCount'] == null){
                        console.log("failed call result.data[key] = ", result.data[key]);
                        cleanAndUpdateRefreshCall(false);
                    }else{
                        console.log("result.data = ", tmpRetry, result.data[key]['totalCount']);
                        if (result.data[key]['totalCount'] > threshold && tmpTimer) {
                            cleanAndUpdateRefreshCall(true);
                        }
                    }
                }
            });
        }
        tmpTimer = setInterval(()=>{
            pollCheck();
        }, 3000);
    }

    function loadAccountPoints() {
        console.log("==========AtoContext.js|main|loadAccountPoints");
        currentAccount &&
        api.query.atochaFinance
          .atoPointLedger(currentAccount.address, points =>{
              setUserPoints(points.toHuman())
          }) .then(unsub => {
        }) .catch(console.error)
    }

    async function loadPuzlleList() {
        console.log("==========AtoContext.js|main|loadPuzzleList");
        //console.log('pubPuzzleListType = ', pubPuzzleListType);
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
                greaterThan: "${pubBlockNumber}",
                },
              },{
                dynRaiseDeadline:{
                greaterThan: "${pubBlockNumber}"
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
                      lessThan: "${pubBlockNumber}"
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
                          lessThan: "${pubBlockNumber}"
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

        let filter_result = filter_UNSOLVED
        switch (pubPuzzleListType) {
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

        // const qqq = `query{
        //             puzzleCreatedEvents(last:1000,orderBy:EVENT_BN_DESC, ${filter_result}){
        //                 nodes{
        //                     whoId,
        //                     puzzleHash,
        //                     createBn,
        //                     eventBn,
        //                     eventHash,
        //                     dynRaiseDeadline,
        //                     dynChallengeDeadline,
        //                     dynPuzzleStatus,
        //                     dynHaveMatchedAnswer,
        //                     dynChallengeStatus,
        //                     dynTotalDeposit,
        //                     ref_challenge_infos{
        //                         totalCount
        //                     },
        //                     ref_challenge_status(orderBy:EVENT_BN_DESC){
        //                         totalCount,
        //                         nodes{
        //                             challengeStatus
        //                         }
        //                     },
        //                     ref_answer_infos(orderBy:EVENT_BN_DESC){
        //                         totalCount,
        //                         nodes{
        //                             answerContent,
        //                             eventBn,
        //                             resultType
        //                         }
        //                     }
        //                 }
        //             }
        //         }`
        // console.log("qqq2 = ", qqq)

        apollo_client.query({
            query: gql`
                query{
                    puzzleCreatedEvents(last:1000,orderBy:EVENT_BN_DESC, ${filter_result}){
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
            //console.log("RUN KAMI- ", result.data.puzzleCreatedEvents);
            console.log("==========AtoContext.js|loadPuzzleList|result.data.puzzleCreatedEvents",result.data.puzzleCreatedEvents);
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
            if(pubPuzzleListType=="UNSOLVED"){
                pl.sort(function(a,b){
                    return b.dynTotalDeposit - a.dynTotalDeposit
                });
            }            
            setPubPuzzleRelist(pl);
        });
    }

    useEffect(() => {
        //console.log("==========AtoContext.js|main|useEffect");
        //alert("AtoContext.js|main|useEffect");
        if (apiState === 'READY' ) {
            let unsubscribeAll = null
            api.derive.chain.bestNumber(number => {
                setPubBlockNumber(number.toString().toLocaleString('en-US'));
                console.log("==========AtoContext.js|main|useEffect|setPubBlockNumber");
            }).then(unsub => {
                unsubscribeAll = unsub
            }).catch(console.error)
            loadPuzlleList();
            loadAccountPoints();
        }
    }, [apiState, currentAccount, pubPuzzleListType, pubRefresh])

    return (
        <>
            <AtoContext.Provider value={{ helloWorld, apollo_client, gql,
                chainData: {pubBlockNumber, userPoints},
                puzzleSets: {pubPuzzleList, setPubPuzzleList, pubPuzzleRelist, setPubPuzzleListType, pubRefresh, updatePubRefresh, tryToPollCheck},
                extractErrorMsg
            }}>
                {props.children}
            </AtoContext.Provider>
        </>
    )
}

const useAtoContext = () => useContext(AtoContext)
const useAtoContextState = () => useContext(AtoContext).state
export { AtoContextProvider, useAtoContextState, useAtoContext }