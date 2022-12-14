use ic_cdk::export::{candid::CandidType, serde::Deserialize, Principal};
use ic_cdk_macros::*;
use ic_evm_sign;
use ic_evm_sign::state::{Environment, State, TransactionChainData, STATE};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(Debug, CandidType)]
struct CreateAddressResponse {
    address: String,
}
#[derive(Debug, CandidType)]
struct SignTransactionResponse {
    sign_tx: Vec<u8>,
}

#[derive(Debug, CandidType)]
struct DeployEVMContractResponse {
    tx: Vec<u8>,
}
#[derive(Debug, CandidType)]
struct UserResponse {
    address: String,
    transactions: TransactionChainData,
    cycles_balance: u64,
}

#[derive(Default, CandidType, Deserialize, Debug, Clone)]
pub struct CanisterState {
    pub user_balances: HashMap<Principal, u64>,
}
#[derive(CandidType, Deserialize)]
struct StableState {
    canister_state: CanisterState,
    state: State,
}

thread_local! {
    pub static CANISTER_STATE: RefCell<CanisterState> = RefCell::new(CanisterState::default());
}

#[ic_cdk_macros::init]
fn init(evn_opt: Option<Environment>) {
    ic_evm_sign::init(evn_opt);
}

#[update]
async fn create_address() -> Result<CreateAddressResponse, String> {
    let principal = ic_cdk::caller();

    let res = ic_evm_sign::create_address(principal)
        .await
        .map_err(|e| format!("Failed to call ecdsa_public_key {}", e))
        .unwrap();

    Ok(CreateAddressResponse {
        address: res.address,
    })
}

#[update]
async fn sign_evm_tx(
    hex_raw_tx: Vec<u8>,
    chain_id: u64,
) -> Result<SignTransactionResponse, String> {
    let principal = ic_cdk::caller();
    // let user_balances = CANISTER_STATE.with(|s| s.borrow().clone());
    // if state.user_balances.get(&principal)
    let res = ic_evm_sign::sign_transaction(hex_raw_tx, chain_id, principal)
        .await
        .map_err(|e| format!("Failed to call sign_with_ecdsa {}", e))
        .unwrap();

    Ok(SignTransactionResponse {
        sign_tx: res.sign_tx,
    })
}

#[update]
fn clear_caller_history(chain_id: u64) -> Result<(), String> {
    let principal = ic_cdk::caller();

    let res = ic_evm_sign::clear_caller_history(principal, chain_id)
        .map_err(|e| format!("Failed to call clear_caller_history {}", e))
        .unwrap();

    Ok(res)
}

#[update]
fn convert_to_cycles() -> u64 {
    let principal = ic_cdk::caller();
    // user_cycles_balance
    let config = STATE.with(|s| s.borrow().config.clone());
    let cycles_fees;

    if config.env == Environment::Development {
        cycles_fees = 10_000_000_000;
    } else {
        cycles_fees = config.sign_cycles;
    }

    update_user_cycles(principal, cycles_fees)
}

#[query]
fn get_caller_data(chain_id: u64) -> Option<UserResponse> {
    let principal = ic_cdk::caller();
    let state = CANISTER_STATE.with(|s| s.borrow().clone());

    let cycles_balance = state.user_balances.get(&principal).unwrap_or(&0);

    let res = ic_evm_sign::get_caller_data(principal, chain_id);

    if let Some(caller) = res {
        Some(UserResponse {
            address: caller.address,
            transactions: caller.transactions,
            cycles_balance: cycles_balance.to_owned(),
        })
    } else {
        None
    }
}

fn update_user_cycles(user: Principal, cycles: u64) -> u64 {
    CANISTER_STATE.with(|s| {
        let mut state = s.borrow_mut();

        if let Some(user_cycles) = state.user_balances.get_mut(&user) {
            *user_cycles = *user_cycles + cycles;

            user_cycles.to_owned()
        } else {
            state.user_balances.insert(user, cycles);

            cycles
        }
    })
}

candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}

#[ic_cdk_macros::pre_upgrade]
fn pre_upgrade() {
    let state = STATE.with(|s| s.borrow().clone());
    let canister_state = CANISTER_STATE.with(|s| s.borrow().clone());
    let stable_state = StableState {
        state,
        canister_state,
    };

    ic_cdk::storage::stable_save((stable_state,)).unwrap();
}

#[ic_cdk_macros::post_upgrade]
fn post_upgrade() {
    let (s_prev,): (StableState,) = ic_cdk::storage::stable_restore().unwrap();

    CANISTER_STATE.with(|s| {
        *s.borrow_mut() = s_prev.canister_state;
    });

    STATE.with(|s| {
        *s.borrow_mut() = s_prev.state;
    });
}
