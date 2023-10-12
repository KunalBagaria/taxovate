use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod error;

use instructions::*;
use error::ErrorCode;
use state::*;

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

    pub fn create_claim(ctx: Context<CreateClaim>, id: u64, tax_code: String, claim_amount: u64, on_income_amount: u64, proof: String) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;

      if id > tax_account.claims_count {
        return Err(error!(ErrorCode::ClaimIdTooSmall));
      }

      // Update the global counter of claims
      tax_account.claims_count = id;

      // If claim amount if bigger than the taxes paid, return an error
      if claim_amount > tax_account.tax_paid {
        return Err(error!(ErrorCode::ClaimTooBig));
      }

      // If claimed income is bigger than the taxed income, return an error
      if on_income_amount > tax_account.taxed_income {
        return Err(error!(ErrorCode::ClaimedIncomeTooBig));
      }

      // If claim amount is zero, return an error
      if claim_amount == 0 {
        return Err(error!(ErrorCode::ClaimIsZero));
      }

      let claim_account = &mut ctx.accounts.claim;
      claim_account.id = id;
      claim_account.tax_account = *ctx.accounts.tax_account.to_account_info().key;
      claim_account.tax_code = tax_code;
      claim_account.claim_amount = claim_amount;
      claim_account.on_income_amount = on_income_amount;
      claim_account.proof = proof;
      claim_account.reviewed = false;
      claim_account.approval = "Not reviewed yet".to_string();

      Ok(())
    }

    pub fn review_claim(ctx: Context<ReviewClaim>, _id: u64, approve: bool) -> Result<()> {
      let claim_account = &mut ctx.accounts.claim;
      let tax_account = &mut ctx.accounts.tax_account;

      // If the claim has already been reviewed, return an error
      if claim_account.reviewed {
        return Err(error!(ErrorCode::ClaimAlreadyReviewed));
      }

      // If the signer is not a government employee, return an error
      if !GOV_ACCOUNTS.contains(&ctx.accounts.user.key().to_string().as_str()) {
        return Err(error!(ErrorCode::ReviewerNotAuthorized));
      }

      // If the claim is approved, update the tax account
      if approve {
        tax_account.tax_paid -= claim_account.claim_amount;
        tax_account.taxed_income -= claim_account.on_income_amount;
        claim_account.approval = "Approved: <Transferred>".to_string();

        // Transfer the claim amount to the user
        // Pending: Implement the transfer
      }

      if !approve {
        claim_account.approval = "Rejected: <Reason>".to_string();
      }

      // Mark the claim as reviewed
      claim_account.reviewed = true;

      Ok(())
    }



}