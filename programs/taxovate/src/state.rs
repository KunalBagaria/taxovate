use anchor_lang::prelude::*;
use std::mem::size_of;

#[account]
#[derive(Default)]
pub struct TaxAccount {
    pub tax_paid: u64,
    pub taxed_income: u64,
    pub claims_count: u64,
    pub authority: Pubkey,
}

impl TaxAccount {
  pub const LEN: usize = 8 + size_of::<Self>();
}

#[account]
#[derive(Default)]
pub struct Claim {
    pub id: u64,
    pub tax_account: Pubkey,
    pub tax_code: String,
    pub claim_amount: u64,
    pub on_income_amount: u64,
    pub proof: String,
    pub reviewed: bool,
    pub approval: String,
}

impl Claim {
  pub const LEN: usize = 8 + size_of::<Self>();
}


// Replace values with your own:

pub const GOV_ACCOUNTS: [&str; 1] = [
  "GpEetfasA7J3kbERkBAqqas8vTTfTTkyUdSrS4DKQrq2"
];

pub const GOV_POOL_ATA: &str = "2Nz4aviaNVnKmdE5aA5aYguK55FSDKCBbGLgGBnaFJGE";