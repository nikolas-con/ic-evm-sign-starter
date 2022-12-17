
import { useState } from 'react';
import { Modal, ModalBody, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalFooter } from '@chakra-ui/react';
import { Flex, Button, Link, Text, Box, IconButton, useToast } from '@chakra-ui/react';

import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";

import { getAccountId } from "../helpers/account";
import { BACKEND_CANISTER_ID } from "../helpers/config";

const docsLink = 'https://github.com/dfinity/portal/blob/master/docs/developer-docs/integrations/t-ecdsa/t-ecdsa-how-it-works.md'

const TopupModal = ({ actor, caller, setCycles, onClose, isOpen }) => {

  const toast = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const topupCycles = async () => {
    toast({ title: "Top up...", variant: "subtle" });

    const res = await actor.convert_to_cycles();

    toast({ title: "Top up finish" });

    const _cycles = res.Ok;
    setCycles(_cycles);
  };

  const subAccount = getAccountId(BACKEND_CANISTER_ID, caller?.toString());

  const copyToClipboard = async () => {
    setHasCopied(true);

    await navigator.clipboard.writeText(subAccount);
    toast({ title: "Copied to clipboard", variant: "subtle" });

    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Top up with cycles</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex flexDir="column">
            <Text mb="12px">
              Signing transactions requires payment in cycles. Topup by sending ICP to the account bellow.
            </Text>
            <Box mb="12px" p="8px" bgColor="ButtonText" color="white" borderRadius="md">
              {subAccount}
              <IconButton
                onClick={copyToClipboard}
                ml="8px"
                fontSize="16px"
                size="xs"
                colorScheme="whiteAlpha"
                variant="ghost"
                icon={
                  hasCopied ? (
                    <HiOutlineClipboardDocumentCheck />
                  ) : (
                    <HiOutlineClipboardDocument />
                  )
                }
              />
            </Box>
            <Text>
              For more read on <Link href={docsLink} isExternal>dfinity/portal</Link>.
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose}>Close</Button>
          <Button onClick={topupCycles}>Notify</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TopupModal;