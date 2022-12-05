import React, { useCallback, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";

import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  Divider,
  Spinner,
  IconButton,
  useToast,
  useDisclosure
} from "@chakra-ui/react";

import SendFundsModal from "./modals/SendFundsModal";
import TransactionsModal from "./modals/TransactionsModal";
import NetworkModal from "./modals/NetworkModal";

import { getDelegationIdentity, getHostFromUrl } from "./helpers/utils";
import { getActor } from './helpers/actor'

import { ethers } from "ethers";

import { HiClock, HiPlusCircle, HiArrowLeftCircle, HiArrowDownOnSquareStack, HiCog6Tooth, HiArrowTopRightOnSquare, HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";

import { mainnets, testnets } from "./helpers/networks"

import { IC_URL, IDENTITY_CANISTER_ID, LOCAL_SIGNER } from './helpers/config'

const chainId = localStorage.getItem("chain-id") ?? 0
const defaultNetwork = [].concat(testnets, testnets).find(r => r.chainId === +chainId) ?? mainnets[0]

const actor = getActor()

const App = () => {

  const toast = useToast()

  const [authClient, setAuthClient] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [network, setNetwork] = useState(defaultNetwork);
  const [loggedIn, setLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const { isOpen: isSendOpen, onOpen: onSendOpen, onClose: onSendClose } = useDisclosure()
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure()
  const { isOpen: isNetworkOpen, onOpen: onNetworkOpen, onClose: onNetworkClose } = useDisclosure()

  const loadUser = useCallback(async (_provider) => {
    try {
      setBalance();
      const [caller] = await actor.get_caller_data(Number(network.chainId));
      if(caller) {
        const { address, transactions } = caller;
        setAddress(address);
        setTransactions(transactions.transactions.map(tx => ({...tx, timestamp: new Date(Number(tx.timestamp / 1000n / 1000n))})));
        const balance = await _provider.getBalance(address);
        console.log(ethers.utils.formatEther(balance))
        setBalance(ethers.utils.formatEther(balance));
      }

    } catch (error) {
      console.log(error);
      const message = error?.result?.reject_message ?? ''
      toast({ title: "Error", status: 'error', description: message, variant: "subtle" });
    }
  }, [network.chainId, toast])

  const onLogin = async () => {
    setLoggedIn(true);

    const identity = authClient.getIdentity()
    localStorage.setItem("identity", JSON.stringify(identity));
    localStorage.setItem("key", JSON.stringify(authClient._key));

    await loadUser(provider)
  };

  const onLogout = () => {
    setLoggedIn(false);

    localStorage.removeItem("identity");
    localStorage.removeItem("key");
  };

  const logout = useCallback(async () => {
    await authClient.logout();
    onLogout("");
  }, [authClient]);

  const loadProviderAndUser = useCallback(async () => {

    const rpcProvider = new ethers.providers.JsonRpcProvider(network.rpc[0]);
    setProvider(rpcProvider);

    const delegationIdentity = getDelegationIdentity()

    const _authClient = await AuthClient.create({ identity: delegationIdentity });
    setAuthClient(_authClient);

    if (delegationIdentity) {
      setLoggedIn(true);

      await loadUser(rpcProvider)
    }
  }, [loadUser, network.rpc]);

  useEffect(() => {
    loadProviderAndUser();
  }, [loadProviderAndUser, network]);

  const login = async () => {

    const isLocal = getHostFromUrl(IC_URL).startsWith('localhost')
    const identityProvider = isLocal ? `${IC_URL}?canisterId=${IDENTITY_CANISTER_ID}` : "https://identity.ic0.app/#authorize";
    const maxTimeToLive = 24n * 60n * 60n * 1000n * 1000n
    authClient.login({
      onSuccess: onLogin,
      identityProvider,
      maxTimeToLive,
    });
  };

  const handleTopUp = async () => {

    const isHardhat = network.chainId === 31337
    if (isHardhat) {
      const signer = await provider.getSigner(LOCAL_SIGNER);
      await signer.sendTransaction({value: ethers.utils.parseEther("10"), to: address,});
  
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    } else if (network.faucets.length > 0) {
      window.open(network.faucets[0], '_blank').focus()
    } else {
      toast({ title: "There is no faucet for this network", variant: "subtle" });
    }
    
  };

  const handleCreateEVMWallet = async () => {

    toast({ title: "Creating wallet...", variant: "subtle" });

    const res = await actor.create();

    toast({ title: "New wallet created" });

    const { address } = res.Ok;
    const balance = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(balance));
    setAddress(address);
  };

  const copyToClipboard = async () => {
    setHasCopied(true)

    await navigator.clipboard.writeText(address)
    toast({ title: "Copied to clipboard", variant: "subtle" });

    setTimeout(() => setHasCopied(false), 2000)
  }

  const goToExplorer = () => {
    if (network.explorers.length > 0) {
      window.open(`${network.explorers[0].url}/address/${address}`, '_blank').focus()
    } else {
      toast({ title: "There is no explorer for this network", variant: "subtle" });
    }
  }

  return (
    <Flex justifyContent={'center'} margin="auto">
      <Box minW="sm" minH="sm" borderWidth='1px' borderRadius='lg' overflow='hidden' padding="16px">
        <Flex justifyContent={'center'} flexDir="column" h="100%">
          <Heading as="h2" size="lg" mt="16px" textAlign={'center'}>No Key Wallet</Heading>

          <Flex justifyContent="center" mt="20px">
            <Button rightIcon={<HiCog6Tooth />} size="xs" variant='solid' onClick={onNetworkOpen}>
              {network?.name}
            </Button>
          </Flex>

          <Flex flexDirection={"column"} alignItems={"center"} h="100%">

            <Box mt="auto">
              {loggedIn ? (
                <Box>

                  {!address ? (
                    <Button onClick={handleCreateEVMWallet}>Create EVM Wallet</Button>
                  ) :
                    <>
                      <Flex mb="40px" justifyContent="center">
                        {balance ? <Text fontSize="3xl">{parseFloat(balance).toPrecision(3)} <Box as="span" fontSize="20px">{network.nativeCurrency.symbol}</Box></Text> : <Spinner />}
                      </Flex>
                      <Flex mb="12px">
                        {address && <Flex alignItems="center">
                          <Text>{address.slice(0, 10)}...{address.slice(-8)}</Text>
                          <IconButton onClick={copyToClipboard} ml="8px" fontSize="16px" size="xs" variant="ghost" icon={hasCopied ? <HiOutlineClipboardDocumentCheck /> : <HiOutlineClipboardDocument />} />
                          <IconButton onClick={goToExplorer} ml="4px" fontSize="16px" size="xs" variant="ghost" icon={<HiArrowTopRightOnSquare />} />
                        </Flex>}
                      </Flex>
                    </>
                  }
                </Box>
              ) : (
                <Button onClick={login} rightIcon={<img alt="logo" width={32} height={16} src={"./ic-logo.svg"} />}>
                  Login with
                </Button>
              )}
            </Box>

            <Divider mb="16px" mt="auto" />
            <Box>
              <Button variant="ghost" onClick={onHistoryOpen} leftIcon={<HiClock />} disabled={!loggedIn || !address}>History</Button>
              {balance > 0 ?
                <Button ml="8px" onClick={onSendOpen} leftIcon={<HiPlusCircle />} disabled={!loggedIn || !address}>Transfer</Button> :
                <Button ml="8px" onClick={handleTopUp} leftIcon={<HiArrowDownOnSquareStack />} disabled={!loggedIn || !address}>Top up</Button>
              }
              <Button variant="ghost" ml="8px" onClick={logout} leftIcon={<HiArrowLeftCircle />} disabled={!loggedIn}>Logout</Button>
            </Box>

            <SendFundsModal network={network} provider={provider} setTransactions={setTransactions} setBalance={setBalance} actor={actor} address={address} isOpen={isSendOpen} onClose={onSendClose} />
            <TransactionsModal network={network} actor={actor} setTransactions={setTransactions} transactions={transactions} isOpen={isHistoryOpen} onClose={onHistoryClose} />
            <NetworkModal setNetwork={setNetwork} isOpen={isNetworkOpen} onClose={onNetworkClose} />
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default App;
