import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ethers, Contract, utilis, providers } from 'ethers'
import { useState, useEffect, useRef } from 'react'
import { Web3Provider } from 'web3'
import Web3Modal, { setLocal } from 'web3modal'
import { TypeAnimation } from 'react-type-animation'

//Import contract things
import { TIME_LOCK_ADDRESS, abi } from '../constants'

export default function Home() {
  //Check if wallet is connect
  const [isConnected, setIsConnected] = useState(false)
  //Lets get address
  const [accountAddress, setAccountAddress] = useState('')
  //check if something is loading
  const [isLoading, setIsLoading] = useState(false)
  //Get balance of Contract(not current account balance);
  const [balance, setBalance] = useState()
  // Set Eth Balance
  const [ethBalance, setEthBalance] = useState(0)
  //Know the withdraw date
  const [withDrawDate, setWithDrawDate] = useState()
  //Get the deposit amoount,
  const [depositAmount, setDepositAmount] = useState('')
  const web3modal = useRef()

  useEffect(() => {
    if (!isConnected) {
      web3modal.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false,
      })
      Connect()
      thisContractBalance()
    }
  }, [])

  //GetProvider or Signer
  const getProviderOrSigner = async (needSigner = false) => {
    //get a hold of provider
    const provider = await web3modal.current.connect()
    const web3provider = new providers.Web3Provider(provider)

    //lets get access of the signer
    const signer = web3provider.getSigner()
    //lets get hold of the address
    const address = await signer.getAddress()

    setAccountAddress(address)

    // const {chainId} = await web3provider.getNetwork();

    // if(chainId !==4) {
    //   window.alert("YOU ARE ON WRONG NETWORK CRYPTONITES");
    // }

    if (needSigner) {
      const signer = web3provider.getSigner()
      return signer
    }

    return web3provider
  }

  //Connect to Web3 Interface
  const Connect = async () => {
    try {
      await getProviderOrSigner()
      setIsConnected(true)
    } catch (err) {
      console.error(err)
    }
  }
  //lets get the balance of the contract
  const getBalancesXD = async () => {
    try {
      console.log('wprking get balance')
      const provider = await getProviderOrSigner()
      console.log(provider)
      const timeLockContract = new Contract(
        //Address ABI and Signer(Provider)
        TIME_LOCK_ADDRESS,
        abi,
        provider,
      )

      let bal = await timeLockContract.getBalances(accountAddress)

      console.log('balance ' + bal)
      bal = ethers.utils.formatEther(bal)
      console.log(`${bal} Uah`)
      setEthBalance(bal)
      let indBal = bal * 145244.47
      setBalance(indBal)
      console.log('Balance is ', indBal)
      return balance
    } catch (err) {
      console.error('Error is here' + err)
    }
  }

  const thisContractBalance = async () => {
    try {
      const provider = await getProviderOrSigner()
      console.log(provider)
      const timeLockContract = new Contract(TIME_LOCK_ADDRESS, abi, provider)
      console.log(timeLockContract)
      let tx = await timeLockContract.returnThisContract()
      console.log(tx.toString())
    } catch (err) {
      console.error(err)
    }
  }

  //deposit ze money
  const depoist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const timeLockContract = new Contract(
        //Address ABI and Signer(Provider)
        TIME_LOCK_ADDRESS,
        abi,
        signer,
      )
      //we want to call the deposit function
      const depositAmountX = ethers.utils.parseEther(depositAmount.toString()) // deposit 1 ETH
      const options = { value: depositAmountX } // set the options object to include the deposit value
      const tx = await timeLockContract.deposit(options)
      // const tx = await timeLockContract.deposit();
      isLoading(true)
      await tx.wait()
      setIsLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  // I want my money back function
  const withdraw = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const timeLockContract = new Contract(
        //Address ABI and Signer(Provider)
        TIME_LOCK_ADDRESS,
        abi,
        signer,
      )

      console.log(timeLockContract)

      const tx = await timeLockContract.withdraw()
      setIsLoading(true)
      await tx.wait()
      setIsLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  //get the lockTime
  const getLockTime = async () => {
    try {
      const provider = await getProviderOrSigner()
      const timeLockContract = new Contract(TIME_LOCK_ADDRESS, abi, provider)
      console.log(await timeLockContract)
      // let locktime = await timeLockContract.getLocktime();
      let locktime = new Date()
      locktime.setDate(locktime.getDate() + 1)
      console.log('Here locktime ' + locktime)
      setWithDrawDate(locktime.toString())
      // locktime = new Date(locktime * 1000);
      console.log('Get LockTime', locktime.toString())
      setWithDrawDate(locktime.toString())
    } catch (err) {
      console.error(err)
    }
  }

  const loading = () => {
    return <h1>This may take a few seconds</h1>
  }

  //RenderThisIfConnected
  const renderConnected = () => {
    if (isConnected) {
      return (
        <>
          <div>
            <p className="text-center my-2 font-bold">
              Wallet Address Connected{' '}
              <span className="text-rose-500">{accountAddress}</span>
            </p>
            <p className="text-center my-2">
              Total Amount Locked UP{' '}
              <span className="text-green-500">
                Rs: {balance} or {ethBalance}eth
              </span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center mt-5">
            <label>
              Deposit:
              <input
                className="border-2 border-blue-500 px-2 rounded-xl mx-2  focus:outline-none focus:ring focus:ring-blue-600"
                id="deposit"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount Of Eth"
                onChange={(e) => setDepositAmount(e.target.value || '0')}
              ></input>
              <button
                className="bg-blue-500 px-5 py-2 text-white rounded-xl mx-2"
                onClick={depoist}
              >
                Depost!!!
              </button>
            </label>
            <button
              className="bg-blue-500 px-5 py-2 text-white rounded-xl mx-2"
              onClick={withdraw}
            >
              withdraw
            </button>
            <button
              className="bg-blue-500 px-5 py-2 text-white rounded-xl mx-2"
              onClick={getBalancesXD}
            >
              Return Balance
            </button>
            <button
              className="bg-blue-500 px-5 py-2 text-white rounded-xl mx-2"
              onClick={getLockTime}
            >
              Return The LockTime
            </button>
          </div>
          <div className="mt-2">
            {balance && <p> Available Balance:Rs. {balance}</p>}
            {ethBalance && <p>Available Balance Eth: {ethBalance}</p>}
            {withDrawDate && <p> Available remaining: {withDrawDate}</p>}
          </div>
        </>
      )
    }
  }

  return (
    <>
      <div className="p-20">
        <div className="p-16 bg-white rounded-xl drop-shadow-2xl">
          <h1 className="text-center text-6xl font-extrabold text-blue-500">
            Lock and Forget
          </h1>
          {/* <div className="flex justify-center  mt-5">
            <TypeAnimation
              // Same String at the start will only be typed once, initially
              sequence={[
                'App develop by Om Bhamare',
                2000,
                'App develop by Lalit Barad',
                2000,
                'App develop by Aman Lohani',
                1000,
              ]}
              speed={50} // Custom Speed from 1-99 - Default Speed: 40
              wrapper="span" // Animation will be rendered as a <span>
              repeat={Infinity} // Repeat this Animation Sequence infinitely
            />
          </div> */}
          <div className="flex justify-center my-5">
            <Image src="/wallet.png" width={300} height={200}></Image>
          </div>
          <div>{renderConnected()}</div>
          {isLoading == true ? loading() : null}
        </div>
      </div>
    </>
  )
}
