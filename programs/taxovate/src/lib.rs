use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod error;

use instructions::*;
use error::ErrorCode;

declare_id!("5FCuQ3GBv3d1GWropp9t1fW6yLSnqBdSKFU3yfSCjC63");

#[program]
pub mod taxovate {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;
      tax_account.tax_paid = 0;
      tax_account.taxed_income = 0;
      tax_account.claims_count = 0;
      Ok(())
    }

    pub fn create_claim(ctx: Context<CreateClaim>, id: u64, tax_code: String, amount: u64, proof: String) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;

      // Update the global counter of claims
      tax_account.claims_count = id;

      // If claim amount if bigger than the taxes paid, return an error
      if amount > tax_account.tax_paid {
        return Err(error!(ErrorCode::ClaimTooBig));
      }

      // If claim amount is zero, return an error
      // if amount == 0 {
      //   return Err(error!(ErrorCode::ClaimIsZero));
      // }

      let claim_account = &mut ctx.accounts.claim;
      claim_account.tax_account = *ctx.accounts.tax_account.to_account_info().key;
      claim_account.tax_code = tax_code;
      claim_account.amount = amount;
      claim_account.proof = proof;
      claim_account.reviewed = false;

      Ok(())
    }

}