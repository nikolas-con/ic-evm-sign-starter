import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IC_URL, BACKEND_CANISTER_ID } from "./config";

const idleServiceOptions = (IDL) => {
  const transactions = IDL.Record({
    data: IDL.Vec(IDL.Nat8),
    timestamp: IDL.Nat64,
  });
  const chainData = IDL.Record({
    nonce: IDL.Nat64,
    transactions: IDL.Vec(transactions),
  });
  const create_address_response = IDL.Record({
    address: IDL.Text,
  });
  const sign_tx_response = IDL.Record({
    sign_tx: IDL.Vec(IDL.Nat8),
  });

  const caller_response = IDL.Record({
    address: IDL.Text,
    transactions: chainData,
    cycles_balance: IDL.Nat,
  });

  return {
    create_address: IDL.Func(
      [],
      [IDL.Variant({ Ok: create_address_response, Err: IDL.Text })],
      ["update"]
    ),
    sign_evm_tx: IDL.Func(
      [IDL.Vec(IDL.Nat8), IDL.Nat64],
      [IDL.Variant({ Ok: sign_tx_response, Err: IDL.Text })],
      ["update"]
    ),
    clear_caller_history: IDL.Func(
      [IDL.Nat64],
      [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })],
      ["update"]
    ),
    get_caller_data: IDL.Func(
      [IDL.Nat64],
      [IDL.Opt(caller_response)],
      ["query"]
    ),
    convert_to_cycles: IDL.Func(
      [],
      [IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })],
      ["update"]
    ),
  };
};

const idlFactory = ({ IDL }) => IDL.Service(idleServiceOptions(IDL));

export const getActor = (identity) => {
  const backendCanisterId = Principal.fromText(BACKEND_CANISTER_ID);
  const agent = new HttpAgent({ host: IC_URL, identity });
  agent.fetchRootKey();
  const createActorOptions = { agent, canisterId: backendCanisterId, identity };
  const _actor = Actor.createActor(idlFactory, createActorOptions);
  return _actor;
};
