import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { mainnets, testnets } from "../helpers/networks"


const NetworkModal = ({ onClose, isOpen, setNetwork }) => {

  const selectNetwork = (i, isMainnet) => {

    const network = isMainnet ? mainnets[i] : testnets[i]
    setNetwork(network)
    onClose()
    localStorage.setItem("chain-id", network.chainId);

  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="12px">
          <Tabs>
            <TabList justifyContent="center">
              <Tab>Mainnets</Tab>
              <Tab>Testnets</Tab>
            </TabList>
            <TabPanels overflow="scroll" height="280px">
              <TabPanel>
                {mainnets.map((n, i) => <Text key={i} onClick={() => selectNetwork(i, true)} _hover={{ bgColor: '#00000010', cursor: 'pointer' }} padding="8px" borderRadius="4px" textAlign="center">{n.name}</Text>)}
              </TabPanel>
              <TabPanel>
                {testnets.map((n, i) => <Text key={i} onClick={() => selectNetwork(i, false)} _hover={{ bgColor: '#00000010', cursor: 'pointer' }} padding="8px" borderRadius="4px" textAlign="center">{n.name}</Text>)}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default NetworkModal;