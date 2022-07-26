import { ethers } from "ethers";

export interface Web3 {
    provider: ethers.providers.Web3Provider
    contract: ethers.Contract
}