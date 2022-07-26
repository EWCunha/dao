import React, { useState } from 'react'
import SharesCard from './SharesCard'
import ProposalCard from './ProposalCard'
import InfoCard from './InfoCard'
import { Web3 } from "../models"
import { Grid } from '@mui/material'

interface Props {
    account: string
    provider: undefined | Web3["provider"]
    contract: undefined | Web3["contract"]
    isAdmin: boolean
}

const Dashboard: React.FC<Props> = ({ account, provider, contract, isAdmin }) => {

    const [loading, setLoarding] = useState<boolean>(false)

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <SharesCard
                        contract={contract}
                        loading={loading}
                        setLoarding={setLoarding}
                        isAdmin={isAdmin}
                    />
                </Grid>
                <Grid item xs>
                    <ProposalCard
                        contract={contract}
                        loading={loading}
                        setLoarding={setLoarding}
                        isAdmin={isAdmin}
                    />
                </Grid>
            </Grid>
            <Grid container>
                <InfoCard
                    contract={contract}
                />
            </Grid>
        </>
    )
}

export default Dashboard