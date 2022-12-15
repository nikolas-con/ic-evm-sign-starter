import {
  DelegationChain,
  Ed25519KeyIdentity,
  DelegationIdentity,
} from "@dfinity/identity";

import { Principal } from "@dfinity/principal";

export const timeSinceShort = (date) => {
  const m = date.toLocaleString("default", { month: "short" });
  const y = date.getYear();

  const s = Math.floor((new Date() - date) / 1000);
  let i = s / 31536000;
  if (i > 1) {
    return `${m} ${y}`;
  }
  i = s / 86400;
  if (i > 1) {
    const x = Math.floor(i);
    return `${x}d ago`;
  }
  i = s / 3600;
  if (i > 1) {
    const x = Math.floor(i);
    return `${x}h ago`;
  }
  i = s / 60;
  if (i > 1) {
    const x = Math.floor(i);
    return `${x}m ago`;
  }
  return `now`;
};

export const getDelegationIdentity = () => {
  const identity = localStorage.getItem("identity");
  if (!identity) return;

  const _identity = JSON.parse(identity);

  const chain = DelegationChain.fromJSON(JSON.stringify(_identity._delegation));

  const _key = _identity._inner;
  const keyIdenity = Ed25519KeyIdentity.fromParsedJson(_key);

  const delegationIdentity = DelegationIdentity.fromDelegation(
    keyIdenity,
    chain
  );
  return delegationIdentity;
};

export const getHostFromUrl = (hostUrl) => {
  try {
    const url = new URL(hostUrl);
    return url.host;
  } catch (error) {
    return "";
  }
};

// https://forum.dfinity.org/t/where-can-i-find-the-list-of-all-official-canisters-and-what-they-are-used-for/12011
export const getPrincipalText = (i) =>
  Principal.fromUint8Array([0, 0, 0, 0, 0, 0, 0, i, 1, 1]).toText();
