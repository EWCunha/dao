import React, { useEffect, useState } from 'react'
import { Box, AppBar, Toolbar, Button, Typography } from '@mui/material';
import { connectWeb3, getProvider, getContract } from "../utils"
import { Web3 } from "../models"

interface Props {
    account: string
    contract: Web3["contract"] | undefined
    provider: Web3["provider"] | undefined
    setAccount: React.Dispatch<React.SetStateAction<string>>
    setProvider: React.Dispatch<React.SetStateAction<Web3["provider"] | undefined>>
    setContract: React.Dispatch<React.SetStateAction<Web3["contract"] | undefined>>
    setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>
}

const Header: React.FC<Props> = ({ account, setAccount, setProvider, setContract, setIsAdmin, contract, provider }) => {

    const [buttonStr, setButtonStr] = useState<string>("Connect Wallet")
    const [ownedShares, setOwnedShares] = useState<string>("")

    const handleWeb3Connect = async (e: React.MouseEvent) => {
        e.preventDefault()

        if (account) {
            setAccount("")
            setButtonStr("Connect Wallet")
            setOwnedShares("")

            if (contract && provider) {
                setContract(contract.connect(provider))
            }
        } else {
            const account = await connectWeb3(setAccount) as string
            const provider = getProvider(setProvider) as Web3["provider"]
            const contract = await getContract(setContract, provider)

            if (contract) {
                const sharesAmount = await contract.shares(account)
                setOwnedShares(sharesAmount.toString())

                const admin = await contract.admin()
                setIsAdmin(account === admin)
            }
            setButtonStr(account.substr(0, 6) + "..." + account.substr(account.length - 4, account.length))
        }
    }

    const setProviderAndContract = async () => {
        const provider = getProvider(setProvider) as Web3["provider"]
        setProvider(provider)

        const contract = await getContract(setContract, provider)
        setContract(contract)
    }

    useEffect(() => {
        setProviderAndContract()
    }, [])

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar style={{ display: "flex" }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Total owned shares: {ownedShares}
                    </Typography>
                    <Button
                        variant="contained"
                        color={buttonStr === "Connect Wallet" ? "warning" : "success"}
                        onClick={e => handleWeb3Connect(e)}
                    >
                        {buttonStr}
                    </Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Header