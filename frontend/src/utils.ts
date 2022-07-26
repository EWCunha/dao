import { ethers } from "ethers";
import ContractData from "./contracts/DAO.json"

const connectWeb3: (accountSetterFunction: Function) => Promise<void | string> = async (accountSetterFunction: Function) => {
    if (window.ethereum) {
        let accounts: string[] = []
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            accountSetterFunction(accounts[0])
            return accounts[0]
        } catch (err) {
            console.error(err)
        }
    } else {
        console.error("Metamask not found... install Metamask!")
    }
}

const getProvider: (providerSetterFunction: Function) => void | ethers.providers.Web3Provider = (providerSetterFunction: Function) => {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        providerSetterFunction(provider)

        return provider
    }
}

const getContract: (contractSetterFunction: Function, provider: ethers.providers.Web3Provider) => Promise<undefined | ethers.Contract> = async (contractSetterFunction: Function, provider: ethers.providers.Web3Provider) => {
    const signer = provider.getSigner()
    const chainId = (await provider.getNetwork()).chainId

    if (chainId.toString() in ContractData.networks) {
        const contract = new ethers.Contract(
            ContractData.networks[chainId.toString() as keyof typeof ContractData.networks].address,
            ContractData.abi, signer._address ? signer : provider
        )
        contractSetterFunction(contract)

        return contract
    } else {
        console.error("Wrong network")
    }
    return undefined
}

export { connectWeb3, getProvider, getContract }