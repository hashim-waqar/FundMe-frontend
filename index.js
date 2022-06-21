import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fund")
const withdrawButton = document.getElementById("withdrawFund")
const amount = document.getElementById("ethAmount")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdrawFund
balanceButton.onclick = getBalance

const checkingAccounts = await window.ethereum.request({
    method: "eth_accounts",
})

if (checkingAccounts.length !== 0) {
    connectButton.innerHTML = "connected"
} else if (checkingAccounts === 0) {
    connectButton.innerHTML = "connect"
}

async function connect() {
    if (typeof window.ethereum != "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        })
        console.log(accounts)
    } else {
        connectButton.innerHtml = "please connect metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = amount.value
    if (typeof window.ethereum != "undefined") {
        // provider / connection to blockchain
        // signer /wallet
        // contract to interact
        // ABI address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = await provider.getSigner()

        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
            // listen for the tx to be mined
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`${transactionResponse.hash} ....`)

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdrawFund() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        const contractBalance = await provider.getBalance(contractAddress)
        if (ethers.utils.formatEther(contractBalance) == 0.0) {
            console.log("contract has zero balance")
        } else {
            try {
                const transactionResponse = await contract.withdraw()
                await listenForTransactionMine(transactionResponse, provider)
            } catch (error) {
                console.log(error)
            }
        }
    }
}

//fund function

// withdraw
