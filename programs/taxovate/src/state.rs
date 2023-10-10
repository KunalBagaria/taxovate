use anchor_lang::prelude::*;
use std::mem::size_of;

#[account]
#[derive(Default)]
pub struct TaxAccount {
    pub tax_paid: u64,
    pub taxed_income: u64,
}

impl TaxAccount {
  pub const LEN: usize = 8 + size_of::<Self>();
}

#[account]
#[derive(Default)]
pub struct Claim {
    pub tax_account: Pubkey,
    pub tax_code: String,
    pub amount: u64,
    pub proof: String,
}

impl Claim {
  pub const LEN: usize = 8 + size_of::<Self>();
}