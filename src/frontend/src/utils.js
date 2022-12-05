import { DelegationChain, Ed25519KeyIdentity, DelegationIdentity } from "@dfinity/identity";


export const timeSinceShort = (date) => {

  const m = date.toLocaleString('default', { month: 'short' })
  const y = date.getYear()

  const s = Math.floor((new Date() - date) / 1000)
  let i = s / 31536000
  if (i > 1) { return `${m} ${y}` }
  i = s / 86400
  if (i > 1) { const x = Math.floor(i); return `${x}d ago` }
  i = s / 3600
  if (i > 1) { const x = Math.floor(i); return `${x}h ago` }
  i = s / 60
  if (i > 1) { const x = Math.floor(i); return `${x}m ago` }
  return `now`
}

export const getDelegationIdentity = () => {
  const identity = localStorage.getItem("identity");
  const key = localStorage.getItem("key");

  if (!identity || !key) return

  const _identity = JSON.parse(identity);
  const chain = DelegationChain.fromDelegations(_identity._delegation.delegations, _identity._delegation.publicKey)

  const _key = JSON.parse(key);
  const keyIdenity = Ed25519KeyIdentity.fromParsedJson(_key)

  const delegationIdentity = DelegationIdentity.fromDelegation(keyIdenity, chain)
  return delegationIdentity
}


export const getHostFromUrl = (hostUrl) => {
  try {
      const url = new URL(hostUrl)
      return url.host
  } catch (error) {
      return ''
  }
}