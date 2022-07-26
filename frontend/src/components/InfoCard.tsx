import React, { useEffect, useState } from 'react'
import { Card, Typography, Grid, Chip, Tooltip } from '@mui/material';
import { Web3 } from "../models"

interface Props {
    contract: Web3["contract"] | undefined
}

const InfoCard: React.FC<Props> = ({ contract }) => {
    const [totalShares, setTotalShares] = useState<string>("")
    const [availableFunds, setAvailableFunds] = useState<string>("")
    const [proposalCounts, setProposalCounts] = useState<number>(0)
    const [quorum, setQuorum] = useState<number>(0)
    const [admin, setAdmin] = useState<string>("")

    const getInfos = async () => {
        if (contract) {
            const totalShares = (await contract.totalShares()).toString()
            const availableFunds = (await contract.availableFunds()).toString()
            const proposalCounts = parseInt(await contract.nextProposalId())
            const quorum = parseInt(await contract.quorum())
            const admin = await contract.admin()

            setTotalShares(totalShares)
            setAvailableFunds(availableFunds)
            setProposalCounts(proposalCounts)
            setQuorum(quorum)
            setAdmin(admin)
        }
    }
    const copyToClipboard = async (e: React.MouseEvent) => {
        e.preventDefault()
        if ('clipboard' in navigator) {
            return await navigator.clipboard.writeText(admin);
        } else {
            return document.execCommand('copy', true, admin);
        }
    }

    useEffect(() => {
        getInfos()
    }, [contract])

    return (
        <Card sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 2, height: "100%", width: "100%" }}>
            <Typography variant="h4">Smart Contract Info</Typography>

            <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">Total shares: {totalShares}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">Available funds: {availableFunds}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">Proposal counts: {proposalCounts}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">Quorum: {quorum}</Typography>
                </Grid>
                <Grid item xs>
                    <Grid container>
                        <Typography variant="subtitle1">Contract admin: </Typography>
                        <Tooltip title="Copy to clipboard">
                            <Chip label={admin} onClick={e => copyToClipboard(e)} />
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
        </Card >
    )
}

export default InfoCard