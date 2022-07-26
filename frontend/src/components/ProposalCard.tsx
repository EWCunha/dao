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

const ProposalCard: React.FC<Props> = ({ contract, loading, setLoarding, isAdmin }) => {

    const [newProposalName, setNewProposalName] = useState<string>("")
    const [newProposalAmount, setNewProposalAmount] = useState<number>(0)
    const [newProposalAddress, setNewProposalAddress] = useState<string>("")
    const [voteProposalId, setVoteProposalId] = useState<number | undefined>(undefined)
    const [executeProposalId, setExecuteProposalId] = useState<number | undefined>(undefined)

    const createProposal = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.createProposal(
                    newProposalName,
                    ethers.utils.parseEther(newProposalAmount.toString()),
                    newProposalAddress
                )
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    const voteProposal = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.vote(voteProposalId)
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    const executeProposal = async (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (contract) {
                setLoarding(true)
                const tx = await contract.executeProposal(executeProposalId)
                await tx.wait(1)
            }
        } catch (err) {
            console.error(err)
        }
        setLoarding(false)
    }

    return (
        <Card sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 1, height: "100%" }}>
            <Typography variant="h4">Proposals</Typography>

            <Grid container>
                <Typography variant="h6">Create proposal:</Typography>
                <Grid container sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        sx={{ marginRight: 1, width: "20%" }}
                        required
                        onChange={e => setNewProposalName(e.target.value)}
                    />
                    <TextField
                        label="Amount"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                        }}
                        variant="outlined"
                        type="number"
                        sx={{ marginRight: 1, width: "20%" }}
                        required
                        onChange={e => setNewProposalAmount(parseFloat(e.target.value))}
                    />

                    <TextField
                        label="Recipient (address)"
                        variant="outlined"
                        sx={{ marginRight: 1, marginTop: 1, width: "60%" }}
                        required
                        onChange={e => setNewProposalAddress(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={e => createProposal(e)}
                        disabled={contract && !loading ? false : true}
                    >
                        Create
                    </Button>
                </Grid>

                <Typography variant="h6">Vote for proposal:</Typography>
                <Grid container sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Proposal ID"
                        variant="outlined"
                        type="number"
                        sx={{ marginRight: 1, width: "20%" }}
                        onChange={e => setVoteProposalId(parseInt(e.target.value))}
                        required
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={contract && !loading ? false : true}
                        onClick={e => voteProposal(e)}
                    >
                        Vote
                    </Button>
                </Grid>
            </Grid>

            {isAdmin ? (
                <>
                    <Typography variant="h6">Execute proposal:</Typography>
                    <Grid container sx={{ marginBottom: 2 }}>
                        <TextField
                            label="Proposal ID"
                            variant="outlined"
                            type="number"
                            sx={{ marginRight: 1, width: "20%" }}
                            onChange={e => setExecuteProposalId(parseInt(e.target.value))}
                            required
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={contract && !loading ? false : true}
                            onClick={e => executeProposal(e)}
                        >
                            Execute
                        </Button>
                    </Grid>
                </>
            ) : (
                <div></div>
            )}
        </Card >
    )
}

export default ProposalCard