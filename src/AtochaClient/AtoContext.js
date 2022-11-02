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

import {useSubstrate, useSubstrateState} from "../substrate-lib";
import {Button, Form, Header, Image, Input, Modal} from "semantic-ui-react";
import utils from "../substrate-lib/utils";
import md5 from "md5";
import {web3Accounts, web3Enable} from "@polkadot/extension-dapp";
import {accounts} from "@polkadot/ui-keyring/observable/accounts";

// const isOpenSmooth = config.APP_IS_OPEN_SMOOTH == 1 ? true : false
console.log('config.IS_OPEN_SMOOTH  === ', config.APP_IS_OPEN_SMOOTH )

const AtoContext = createContext(null)

const AtoContextProvider = props => {
    const { apiState, apiError, keyringState, api, currentAccount} = useSubstrateState()

    // const {
    //     setCurrentAccount,
    //     state: { keyring },
    // } = useSubstrate()

    const [helloWorld, setHelloWorld] = useState('None--')
    const [currentAccountAddress, setCurrentAccountAddress] = useState(null)
    const [pubPuzzleList, setPubPuzzleList] = useState([])
    const [pubPuzzleListType, setPubPuzzleListType] = useState('UNSOLVED')
    const [pubBlockNumber, setPubBlockNumber] = useState(0)
    const [rewardRankList, setRewardRankList] = useState([])
    const [pubRefresh, setPubRefresh] = useState(0)
    const [userPoints, setUserPoints] = useState(null);
    const [pubPuzzleRelist, setPubPuzzleRelist] = useState([])
    const [bindModalOpen, setBindModalOpen] = React.useState(false)
    const [authPwdModalOpen, setAuthPwdModalOpen] = React.useState(false)
    const [recoverPwdModalOpen, setRecoverPwdModalOpen] = React.useState(false)

    const [authPassword, setAuthPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [authPwdModalTipMsg, setAuthPwdModalTipMsg] = React.useState('')

    const [used3Account, setUsed3Account] = useState(null)
    const CONST_LOCAL_STORAGE_USED_SMOOTH_STATUS = 'local_storage_usedSmoothStatus'
    const CONST_LOCAL_STORAGE_USED_WEB_ADDR = 'local_storage_usedWebAddr'
    const [usedSmoothStatus, setUsedSmoothStatus] = useState(false)
    const [smoothError, setSmoothError] = useState([null, ''])

    const [rebirthDone, setRebirthDone] = useState(false)

    const apollo_client = new ApolloClient({
        uri: config.SUBQUERY_HTTP,
        cache: new InMemoryCache(),
    });

    function connPolkadot() {
        return new Promise(async (resolve, reject) => {
            if (typeof window !== "undefined") {
                try {
                    const allInjected = await web3Enable('PostThread')
                    // console.log(allInjected);
                    const allAccounts = await web3Accounts()
                    // console.log(allAccounts);
                    resolve(allAccounts)
                } catch (err) {
                    reject(err)
                }
            } else {
                reject('Need window.')
            }
        })
    }

    function initUsedSmoothStatusWithLocalStorage() {
        if(window.localStorage){
            let storage=window.localStorage;
            const status = storage[CONST_LOCAL_STORAGE_USED_SMOOTH_STATUS] ;
            console.log('local stoage stauts = ', status)
            setUsedSmoothStatus(status=='true'? true: false)
        }
    }

    function setUsedSmoothStatusWithLocalStorage(status) {
        setUsedSmoothStatus(status)
        if(!window.localStorage){
            alert('The browser does not support LocalStorage, which may cause some functions to be unavailable.');
        }else{
            console.log('set with LocalStorage ', status)
            let storage=window.localStorage;
            storage[CONST_LOCAL_STORAGE_USED_SMOOTH_STATUS] = status;
        }
    }

    function initUsedWeb3AddressWithLocalStorage() {
        return new Promise(((resolve, reject) => {
            if(window.localStorage){
                let storage=window.localStorage;
                const web3Addr = storage[CONST_LOCAL_STORAGE_USED_WEB_ADDR] ;
                console.log('local stoage addr = ', web3Addr)
                connPolkadot().then(accounts => {
                    let findAcc =false
                    for(let idx in accounts) {
                        console.log('--------', accounts[idx].address , web3Addr)
                        if(accounts[idx].address == web3Addr) {
                            console.log('setUsed3Account == ', accounts[idx])
                            setUsed3Account(accounts[idx])
                            resolve(accounts[idx])
                            findAcc=true
                            break;
                        }
                    }
                    if(!findAcc) resolve(null)
                }).catch(err=>{
                    reject(err)
                })
            }
        }))
    }

    function setUsedWeb3AddressWithLocalStorage(web3acc) {
        setUsed3Account(web3acc)
        if(!window.localStorage){
            alert('The browser does not support LocalStorage, which may cause some functions to be unavailable.');
        }else{
            console.log('set with LocalStorage ', web3acc.address)
            let storage=window.localStorage;
            storage[CONST_LOCAL_STORAGE_USED_WEB_ADDR] = web3acc.address;
        }
    }

    function updatePubRefresh() {
        setPubRefresh(pubRefresh+1)
    }

    function submitTxWithSmooth(palletRpc, callable, inputParams) {
        return new Promise((resolve, rejects)=>{
            const instance = utils.atoApiRequestInstance()
            setSmoothError([null, 0])
            instance.post(`${config.API2_ATOCHA_URL}/web3/adapter`, {palletRpc, callable, inputParams}).then( res => {
                // console.log('/web3/adapter', res)
                if(res.data.status.toLowerCase() == 'success') {
                    resolve(res.data)
                }else{
                    rejects(res.data)
                }
            }).catch(err=>{
                setSmoothError(['/web3/adapter interface err', '220717-2'])
            })
        })
    }

    function checkUserLoggedIn() {
        return new Promise((resolve, reject)=>{
            const instance = utils.atoApiRequestInstance()
            setSmoothError([null, 0])
            instance.get(`/twitter/has_login`).then(response=>{
                console.log(' --- ---- User is already bound', response.data.data.isLogin)
                if(response.data.data.isLogin == true) {
                    resolve(true)
                }else{
                    resolve(false)
                }
            }).catch(err=>{
                setSmoothError(['/twitter/has_login interface err', '220717-1'])
                reject(err)
            })
        })
    }

    function getLoginInfos() {
        return new Promise((resolve, rejects)=>{
            const instance = utils.atoApiRequestInstance()
            instance.get(`/twitter/login_infos`).then(
              function (response) {
                  console.log("response.data", response.data)
                  if(response.data && response.data.status.toLowerCase() == 'success'){
                      resolve(response.data.data)
                  } else {
                      rejects('Can not find response.data.')
                  }
              }
            ).catch(
              function (error) {
                  console.log('/twitter/login_infos had an error.', error)
                  rejects('/twitter/login_infos had an error.')
              }
            )
        })
    }

    // Will remove and instead with common function
    function getTwitterAtoInfos(ato_address) {
        return new Promise((resolve, reject) => {
            const instance = utils.atoApiRequestInstance()
            instance.get(`/twitter/ato_info?addr=${ato_address}`).then(
              function (response) {
                  if(!response.data){
                      resolve(null)
                  } else if(response.data?.status.toLowerCase() == `success` && response.data?.data?.screen_name){
                      instance.get(`/twitter/show_user?screen_name=${response.data?.data.screen_name}`).then(twitter_user_info=>{
                          response.data.data.detail = twitter_user_info
                          resolve(response.data)
                      })
                  }else{
                      resolve(null)
                  }
              }
            ).catch(
              function (error) {
                  console.log('Bing request Error ================= ', error)
                  reject(error)
              }
            )
        })
    }

    function checkUserSmoothIn() {
        return new Promise((resolve, reject)=>{
            const instance = utils.atoApiRequestInstance()
            instance.get(`/twitter/has_to_sign`).then(response=>{
                console.log(' --- ---- has_to_sign', response.data.data)
                // if(response.data.data.hasLogin == true) {
                //     resolve(true)
                // }else{
                //     resolve(false)
                // }
                if(response.data.data){
                    resolve(response.data.data)
                }
                resolve(null)
            }).catch(err=>{
                reject(err)
            })
        })
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

    function fillCurrentAccountIdWithSmooth() {
        return new Promise(async (resolve, reject) => {
            const loginInfo = await getLoginInfos();
            console.log('loginInfo === ', loginInfo)
            if (!loginInfo.userId) {
                setBindModalOpen(true)
                reject('need twitter login.')
            } else if (!loginInfo.atoAddress) {
                setAuthPwdModalOpen(true)
                reject('need auth pwd.')
            } else {
                setCurrentAccountAddress(loginInfo.atoAddress)
                resolve(loginInfo.atoAddress)
            }
        })
    }

    function rebirthAccount() {
        return new Promise((resolve, reject) => {
            if(rebirthDone == false){
                if(usedSmoothStatus == true){
                    getLoginInfos().then(data=>{
                        if(data.userId > 0 && data.atoAddress == null){
                            setRebirthDone(true)
                            resolve(data)
                        }else if(data.atoAddress){
                            getTwitterAtoInfos(data.atoAddress).then(bindInfoData=>{
                                // console.log('bindInfoData', bindInfoData.data.screen_name)
                                setCurrentAccountAddress(data.atoAddress)
                                setUsed3Account({address: data.atoAddress, meta: {name: bindInfoData.data.screen_name}})
                                setRebirthDone(true)
                                resolve(data)
                            }).catch(err=>{
                                reject(err)
                            })
                        }
                    }).catch(err=>{
                        reject(err)
                    })
                }else{
                    initUsedWeb3AddressWithLocalStorage().then(data=>{
                        console.log("initUsedWeb3AddressWithLocalStorage -- ### ", data)
                        console.log('setRebirthDone = true ')
                        setRebirthDone(true)
                        setCurrentAccountAddress(data.address)
                        resolve(data)
                    }).catch(err=>{
                        reject(err)
                    })
                }
            }else{
                resolve(null)
            }
        })
    }

    function loadAccountPoints(accAddress) {
        return new Promise((resolve, reject)=>{
            accAddress &&
            api.query.atochaFinance.atoPointLedger(accAddress, points =>{
                setUserPoints(points.toHuman())
                resolve(points)
            })
        })
    }

    async function loadPuzlleList() {
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
        if (apiState === 'READY' ) {
            let unsubscribeAll = null
            api.derive.chain.bestNumber(number => {
                setPubBlockNumber(number.toString().toLocaleString('en-US'));
            }).then(unsub => {
                unsubscribeAll = unsub
            }).catch(console.error)
            loadPuzlleList();
            // loadAccountPoints();
        }
        initUsedSmoothStatusWithLocalStorage()
    }, [apiState, currentAccount, pubPuzzleListType, pubRefresh])

    return (
        <>
            <AtoContext.Provider value={{ helloWorld, apollo_client, gql,
                chainData: {pubBlockNumber, userPoints},
                puzzleSets: {
                    pubPuzzleList,
                    setPubPuzzleList,
                    pubPuzzleRelist,
                    setPubPuzzleListType,
                    pubRefresh,
                    currentAccountAddress,
                    setCurrentAccountAddress,
                    updatePubRefresh,
                    tryToPollCheck,
                    checkUserLoggedIn,
                    checkUserSmoothIn,
                    getLoginInfos,
                    getTwitterAtoInfos,
                    loadAccountPoints,
                    setBindModalOpen,
                    setAuthPwdModalOpen,
                    setRecoverPwdModalOpen,
                    fillCurrentAccountIdWithSmooth,
                    submitTxWithSmooth,
                    setUsed3Account,
                    setUsedSmoothStatus,
                    used3Account,
                    usedSmoothStatus,
                    setUsedSmoothStatusWithLocalStorage,
                    initUsedSmoothStatusWithLocalStorage,
                    initUsedWeb3AddressWithLocalStorage,
                    setUsedWeb3AddressWithLocalStorage,
                    smoothError,
                    setSmoothError,
                    rebirthDone,
                    rebirthAccount,
                    connPolkadot,
                },
                extractErrorMsg
            }}>
                <Modal
                  onClose={() => setBindModalOpen(false)}
                  onOpen={() => setBindModalOpen(true)}
                  open={bindModalOpen}
                  // trigger={<Button>Show Modal222</Button>}
                >
                    <Modal.Header>Operation requires login</Modal.Header>
                    <Modal.Content image>
                        <Modal.Description>
                            <Header>Registration via twitter</Header>
                            <p>
                                You may be able to login Atocha with twitter authorization!
                            </p>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black' onClick={() => setBindModalOpen(false)}>
                            Nope
                        </Button>
                        <Button
                          content="Yep, Go to authorization"
                          labelPosition='right'
                          icon='checkmark'
                          onClick={() => window.location=`${config.API2_ATOCHA_URL}/twitter/authorization?ref=${btoa(window.location.href.split('?')[0])}&uptime=${new Date().getTime()}`}
                          positive
                        />
                    </Modal.Actions>
                </Modal>
                <Modal
                  onClose={() => setAuthPwdModalOpen(false)}
                  onOpen={() => setAuthPwdModalOpen(true)}
                  open={authPwdModalOpen}
                >
                    <Modal.Header>Need input password</Modal.Header>
                    <Modal.Content image>
                        <Modal.Description>
                            <Header>Input password to create wallet</Header>
                            <p>
                                An account password is required to authorize the management of the fund account.
                            </p>
                            <p>
                                After this step, you will get an initial ATO airdrop and then you can play the puzzle game!
                            </p>
                            <Form>
                                <Form.Field>
                                    <Input
                                      label='Password'
                                      type='password'
                                      onChange={(_, { value }) => {
                                          setAuthPwdModalTipMsg('')
                                          setAuthPassword(value)
                                      }  }
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <Input
                                      label='Confirm'
                                      type='password'
                                      onChange={(_, { value }) => {
                                          setAuthPwdModalTipMsg('')
                                          setConfirmPassword(value)
                                      } }
                                    />
                                </Form.Field>
                            </Form>
                            {authPwdModalTipMsg?<p>{authPwdModalTipMsg}</p>:''}
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black' onClick={() => {
                            setAuthPwdModalOpen(false)
                        } }>
                            Nope
                        </Button>
                        <Button
                          content="Yep"
                          labelPosition='right'
                          icon='checkmark'
                          onClick={() => {
                              if(confirmPassword=='' || confirmPassword.length < 6){
                                  setAuthPwdModalTipMsg('Password length cannot be less than 6 characters')
                              }else if(confirmPassword != authPassword) {
                                  setAuthPwdModalTipMsg('Password must be the same')
                              }else{
                                  // Go to gen wallet
                                  const instance = utils.atoApiRequestInstance()
                                  instance.post(`${config.API2_ATOCHA_URL}/twitter/control_wallet`, {operation: 'create', pwd: md5(confirmPassword)}).then( res => {
                                      console.log('/twitter/create_wallet', res)
                                      if(res.data.status.toLowerCase() == 'success') {
                                          rebirthAccount()
                                      }else{
                                          setAuthPwdModalTipMsg(`Error code ${res.data.code}, ${res.data.msg}`)
                                      }
                                  })
                              }
                          } }
                          positive
                        />
                    </Modal.Actions>
                </Modal>
                <Modal
                  onClose={() => setAuthPwdModalOpen(false)}
                  onOpen={() => setAuthPwdModalOpen(true)}
                  open={authPwdModalOpen}
                >
                    <Modal.Header>Need input password</Modal.Header>
                    <Modal.Content image>
                        <Modal.Description>
                            <Header>Input password to create wallet</Header>
                            <p>
                                An account password is required to authorize the management of the fund account.
                            </p>
                            <p>
                                After this step, you will get an initial ATO airdrop and then you can play the puzzle game!
                            </p>
                            <Form>
                                <Form.Field>
                                    <Input
                                      label='Password'
                                      type='password'
                                      onChange={(_, { value }) => {
                                          setAuthPwdModalTipMsg('')
                                          setAuthPassword(value)
                                      }  }
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <Input
                                      label='Confirm'
                                      type='password'
                                      onChange={(_, { value }) => {
                                          setAuthPwdModalTipMsg('')
                                          setConfirmPassword(value)
                                      } }
                                    />
                                </Form.Field>
                            </Form>
                            {authPwdModalTipMsg?<p>{authPwdModalTipMsg}</p>:''}
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black' onClick={() => {
                            setAuthPwdModalOpen(false)
                        } }>
                            Nope
                        </Button>
                        <Button
                          content="Yep"
                          labelPosition='right'
                          icon='checkmark'
                          onClick={() => {
                              if(confirmPassword=='' || confirmPassword.length < 6){
                                  setAuthPwdModalTipMsg('Password length cannot be less than 6 characters')
                              }else if(confirmPassword != authPassword) {
                                  setAuthPwdModalTipMsg('Password must be the same')
                              }else{
                                  // Go to gen wallet
                                  const instance = utils.atoApiRequestInstance()
                                  instance.post(`${config.API2_ATOCHA_URL}/twitter/control_wallet`, {operation: 'create', pwd: md5(confirmPassword)}).then( res => {
                                      console.log('/twitter/create_wallet', res)
                                      if(res.data.status.toLowerCase() == 'success') {
                                          setAuthPwdModalOpen(false)
                                          rebirthAccount()
                                      }else{
                                          setAuthPwdModalTipMsg(`Error code ${res.data.code}, ${res.data.msg}`)
                                      }
                                  })
                              }
                          } }
                          positive
                        />
                    </Modal.Actions>
                </Modal>

                {/*---*/}
                <Modal
                  onClose={() => setRecoverPwdModalOpen(false)}
                  onOpen={() => setRecoverPwdModalOpen(true)}
                  open={recoverPwdModalOpen}
                >
                    <Modal.Header>Need input password</Modal.Header>
                    <Modal.Content image>
                        <Modal.Description>
                            <Header>Input password to unlock wallet</Header>
                            <Form>
                                <Form.Field>
                                    <Input
                                      label='Password'
                                      type='password'
                                      onChange={(_, { value }) => {
                                          setAuthPwdModalTipMsg('')
                                          setAuthPassword(value)
                                      }  }
                                    />
                                </Form.Field>
                            </Form>
                            {authPwdModalTipMsg?<p>{authPwdModalTipMsg}</p>:''}
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black' onClick={() => {
                            setRecoverPwdModalOpen(false)
                        } }>
                            Nope
                        </Button>
                        <Button
                          content="Yep"
                          labelPosition='right'
                          icon='checkmark'
                          onClick={() => {
                              // Go to gen wallet
                              const instance = utils.atoApiRequestInstance()
                              instance.post(`${config.API2_ATOCHA_URL}/twitter/control_wallet`, {operation: 'recover', pwd: md5(authPassword)}).then( res => {
                                  console.log('/twitter/create_wallet', res)
                                  if(res.data.status.toLowerCase() == 'success') {
                                      setRecoverPwdModalOpen(false)
                                      rebirthAccount()
                                  }else{
                                      setAuthPwdModalTipMsg(`Error code ${res.data.code}, ${res.data.msg}`)
                                  }
                              })
                          } }
                          positive
                        />
                    </Modal.Actions>
                </Modal>

                {props.children}
            </AtoContext.Provider>
        </>
    )
}

const useAtoContext = () => useContext(AtoContext)
const useAtoContextState = () => useContext(AtoContext).state
export { AtoContextProvider, useAtoContextState, useAtoContext }