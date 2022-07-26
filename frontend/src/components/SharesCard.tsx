import React, { useState } from 'react'
import { Card, Typography, Button, TextField, Grid, InputAdornment } from '@mui/material';
import { Web3 } from "../models"
import { ethers } from 'ethers';

interface Props {
    contract: undefined | Web3["contract"]
    loading: boolean
    setLoarding: React.Dispatch<React.SetStateAction<boolean>>
    isAdmin: boolean
}

const SharesCard: React.FC<Props> = ({ contract, loading, setLoarding, isAdmin }) => {

    const [contributionAmount, setContributionAmount] = useState<number>(0)
    const [redeemShareAmount, setRedeemShareAmount] = useState<number>(0)
    const [transferShareAmount, setTransferShareAmount] = useState<number>(0)
    const [transferShareAddress, setTransferAddress] = useState<undefined | string>(undefined)
    const [withdrawAmount, setWithdrawAmount] = useState<number>(0)
    const [withdrawAddress, setWithdrawAddress] = useState<undefined | string>(undefined)

    const contribute = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.contribute({ value: ethers.utils.parseEther(contributionAmount.toString()) })
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    const redeemShare = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.redeemShare(ethers.utils.parseEther(redeemShareAmount.toString()))
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    const transferShare = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.transferShare(ethers.utils.parseEther(transferShareAmount.toString()), transferShareAddress)
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    const withdraw = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.withdrawEther(ethers.utils.parseEther(withdrawAmount.toString()), withdrawAddress)
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    const handleSharesNumber = () => {
        if (contributionAmount > 0) {
            const numBN = ethers.utils.parseEther(contributionAmount.toString())
            let currNumBn = numBN
            let expon = 0
            while (currNumBn.mod(ethers.BigNumber.from(10)).toNumber() === 0) {
                expon++
                currNumBn = currNumBn.div(ethers.BigNumber.from(10))
            }

            return currNumBn.toString() + "e" + expon.toString()
        }
        return "--"
    }

    return (
        <Card sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 1, height: "100%" }}>
            <Typography variant="h4">Shares</Typography>

            <Grid container>
                <Typography variant="h6">Invest:</Typography>
                <Grid container sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Amount"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                        }}
                        variant="outlined"
                        type="number"
                        sx={{ marginRight: 1, width: "20%" }}
                        required
                        onChange={e => setContributionAmount(parseFloat(e.target.value))}
                    />
                    <Typography
                        variant="subtitle1"
                        sx={{ margin: 2 }}
                    >
                        Total shares: {handleSharesNumber()}
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={e => contribute(e)}
                        disabled={contract && !loading ? false : true}
                    >
                        Contribute
                    </Button>
                </Grid>

                <Typography variant="h6">Redeem share:</Typography>
                <Grid container sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Amount"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">e18</InputAdornment>
                        }}
                        variant="outlined"
                        type="number"
                        sx={{ marginRight: 1, width: "20%" }}
                        onChange={e => setRedeemShareAmount(parseFloat(e.target.value))}
                        required
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={contract && !loading ? false : true}
                        onClick={e => redeemShare(e)}
                    >
                        Redeem
                    </Button>
                </Grid>
            </Grid>

            <Typography variant="h6">Transfer share:</Typography>
            <Grid container sx={{ marginBottom: 2 }}>
                <TextField
                    label="Amount"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">e18</InputAdornment>
                    }}
                    variant="outlined"
                    type="number"
                    sx={{ marginRight: 1, width: "20%" }}
                    onChange={e => setTransferShareAmount(parseFloat(e.target.value))}
                    required
                />
                <TextField
                    label="To (address)"
                    variant="outlined"
                    sx={{ marginRight: 1, width: "60%" }}
                    onChange={e => setTransferAddress(e.target.value)}
                    required
                />
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={contract && !loading ? false : true}
                    onClick={e => transferShare(e)}
                >
                    Transfer
                </Button>
            </Grid>
            {isAdmin ? (
                <>
                    <Typography variant="h6">Withdraw:</Typography>
                    <Grid container sx={{ marginBottom: 2 }}>
                        <TextField
                            label="Amount"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                            }}
                            variant="outlined"
                            type="number"
                            sx={{ marginRight: 1, width: "20%" }}
                            onChange={e => setWithdrawAmount(parseFloat(e.target.value))}
                            required
                        />
                        <TextField
                            label="To (address)"
                            variant="outlined"
                            sx={{ marginRight: 1, width: "60%" }}
                            onChange={e => setWithdrawAddress(e.target.value)}
                            required
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={contract && !loading ? false : true}
                            onClick={e => withdraw(e)}
                        >
                            Transfer
                        </Button>
                    </Grid>
                </>
            ) : (
                <div></div>
            )}
        </Card >
    )
}

export default SharesCard