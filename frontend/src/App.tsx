import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { Web3 } from "./models"

function App() {

  const [account, setAccount] = useState<string>("")
  const [provider, setProvider] = useState<undefined | Web3["provider"]>(undefined)
  const [contract, setContract] = useState<undefined | Web3["contract"]>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  return (
    <div className="App">
      <Header
        account={account}
        setAccount={setAccount}
        setProvider={setProvider}
        setContract={setContract}
        setIsAdmin={setIsAdmin}
        contract={contract}
        provider={provider}
      />

      <Dashboard
        account={account}
        provider={provider}
        contract={contract}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default App;
