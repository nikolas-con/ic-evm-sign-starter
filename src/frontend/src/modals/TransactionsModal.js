import {useToast, Modal, ModalBody, ModalCloseButton, ModalOverlay, ModalContent, ModalHeader, ModalFooter} from "@chakra-ui/react"
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react"
import { Button, IconButton  } from "@chakra-ui/react"
import {  HiArrowTopRightOnSquare } from "react-icons/hi2";

import { timeSinceShort } from '../helpers/utils'
import { ethers } from "ethers"


const TransactionsModal = ({ onClose, isOpen, actor, transactions, setTransactions, network }) => {

  const toast = useToast()

  const handleClearTxHistory = async () => {

    toast({ title: "Clearing history...", variant: "subtle" });
    onClose()

    await actor.clear_caller_history(Number(network.chainId));
    setTransactions([]);

    toast({ title: "History cleared" });
  };

  const goToExplorer = (txId) => {
    if (network.explorers.length > 0) {
      window.open(`${network.explorers[0].url}/tx/${txId}`, '_blank').focus()
    } else {
      toast({ title: "There is no explorer for this network", variant: "subtle" });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transaction History</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {transactions.length > 0 ?
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>Transaction Id</Th>
                    <Th>Value</Th>
                    <Th>Created</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((tx, index) => (
                    <Tr key={index}>
                      <Td>
                        {ethers.utils.parseTransaction(tx.data).hash.slice(0, 8)}...{ethers.utils.parseTransaction(tx.data).hash.slice(-6)}
                        <IconButton onClick={() => goToExplorer(ethers.utils.parseTransaction(tx.data).hash)} ml="4px" fontSize="16px" size="xs" variant="ghost" icon={<HiArrowTopRightOnSquare />} />
                      </Td>
                      <Td>{ethers.utils.formatEther(ethers.utils.parseTransaction(tx.data).value)}</Td>
                      <Td>{timeSinceShort(tx.timestamp)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer> :
            'No transactions yet'}
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={'auto'} onClick={handleClearTxHistory} disabled={transactions.length === 0}>Clear History</Button>
          <Button type="submit" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TransactionsModal;