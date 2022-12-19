import { useState } from "react";
import {
  useToast,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Flex,
  Input,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { ethers } from "ethers";

const SendFundsModal = ({
  provider,
  network,
  setTransactions,
  setBalance,
  setCycles,
  setWaiting,
  actor,
  address,
  onClose,
  isOpen,
}) => {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const toast = useToast();

  const handleSignTx = async (e) => {
    e.preventDefault();

    onClose();

    setWaiting(true);

    const nonce = await provider.getTransactionCount(address);
    const gasPrice = await provider.getGasPrice().then((s) => s.toHexString());
    const value = ethers.utils.parseEther(amount).toHexString();
    const data = "0x00";
    const gasLimit = ethers.BigNumber.from("24000").toHexString();
    const transaction = {
      nonce,
      gasPrice,
      gasLimit,
      to: destination,
      value,
      data,
    };

    const serializeTx = Buffer.from(
      ethers.utils.serializeTransaction(transaction).slice(2) + "808080",
      "hex"
    );

    toast({ title: "Signing transaction...", variant: "subtle" });

    const res = await actor.sign_evm_tx(
      [...serializeTx],
      Number(network.chainId)
    );
    if (res.Err) {
      const message = res.Err ?? "";
      toast({
        title: "Error",
        description: message,
        status: "error",
        variant: "subtle",
      });
      return;
    }
    const signedTx = Buffer.from(res.Ok.sign_tx, "hex");

    toast({ title: "Sending transaction...", variant: "subtle" });

    const { hash } = await provider.sendTransaction(
      "0x" + signedTx.toString("hex")
    );

    await provider.waitForTransaction(hash);
    toast({ title: `Transfered ${amount} ${network.nativeCurrency.symbol}` });

    setWaiting(false);

    const balance = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(balance));

    setTransactions((txs) => [
      ...txs,
      { data: signedTx, timestamp: new Date() },
    ]);
    setCycles((e) => e - res.Ok.sign_cycles);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transfer Funds</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex>
            <Input
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination (Address)"
            />
            <Input
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              type="number"
              ml="10px"
              width="120px"
            />
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSignTx} disabled={!amount || amount === "0"}>
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SendFundsModal;
