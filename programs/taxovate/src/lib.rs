use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer as SplTransfer};

pub mod state;
pub mod instructions;
pub mod error;
pub mod slab;

use instructions::*;
use error::ErrorCode;
use state::*;

declare_id!("5FCuQ3GBv3d1GWropp9t1fW6yLSnqBdSKFU3yfSCjC63");

#[program]
pub mod taxovate {
    use crate::slab::get_tax_percentage;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;
      tax_account.authority = ctx.accounts.user.key();
      tax_account.tax_paid = 0;
      tax_account.taxed_income = 0;
      tax_account.claims_count = 0;
      Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, bump: u8) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;

      // Check if the signer is the owner of the tax account
      if ctx.accounts.user.key() != tax_account.authority {
        return Err(error!(ErrorCode::WithdrawlNotAuthorized));
      }

      if ctx.accounts.gov_ata.key().to_string() != String::from(GOV_POOL_ATA) {
        return Err(error!(ErrorCode::WrongPoolAccount));
      }

      let destination = &ctx.accounts.to_ata;
      let source = &ctx.accounts.from_ata;
      let token_program = &ctx.accounts.token_program;
      let authority = tax_account.clone();
      let seeds = &[b"user".as_ref(), &tax_account.authority.to_bytes(), &[bump]];
      let signer = &[&seeds[..]];

      // Accounts for transferring the withdrawl amount to the user
      let cpi_accounts_main = SplTransfer {
        from: source.to_account_info().clone(),
        to: destination.to_account_info().clone(),
        authority: authority.to_account_info().clone(),
      };

      // Accounts for transferring the tax amount to the government pool
      let cpi_accounts_tax = SplTransfer {
        from: source.to_account_info().clone(),
        to: ctx.accounts.gov_ata.to_account_info().clone(),
        authority: authority.to_account_info().clone(),
      };

      let total_taxable_income = tax_account.taxed_income + amount;
      let tax_percentage_applicable = get_tax_percentage(total_taxable_income);

      let total_tax_amount = (total_taxable_income * tax_percentage_applicable) / 100;

      let applicable_tax = if total_tax_amount == 0 {
        0
      } else {
        total_tax_amount - tax_account.tax_paid
      };

      let amount_main = amount - applicable_tax;
      let decimal_adjusted_amount = amount_main * 1_000_000; // 6 decimals of the token
      let decimal_adjusted_tax = applicable_tax * 1_000_000; // 6 decimals of the token

      let cpi_program = token_program.to_account_info();
      token::transfer(CpiContext::new_with_signer(cpi_program.clone(), cpi_accounts_tax, signer), decimal_adjusted_tax)?;
      token::transfer(CpiContext::new_with_signer(cpi_program.clone(), cpi_accounts_main, signer), decimal_adjusted_amount)?;

      msg!("Previously taxed income: {}", tax_account.taxed_income);
      msg!("Total taxable income now: {}", total_taxable_income);
      msg!("Tax percentage applicable: {}", tax_percentage_applicable);

      msg!("Total tax amount: {}", total_tax_amount);
      msg!("Tax paid before: {}", tax_account.tax_paid);

      msg!("Applicable tax now: {}", applicable_tax);
      msg!("Amount transferred: {}", amount_main);

      // Update the tax account according to the withdrawl
      tax_account.tax_paid += applicable_tax;
      tax_account.taxed_income += amount;

      Ok(())

    }

    pub fn create_claim(ctx: Context<CreateClaim>, id: u64, tax_code: String, claim_amount: u64, on_income_amount: u64, proof: String) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;

      if ctx.accounts.user.key() != tax_account.authority {
        return Err(error!(ErrorCode::ClaimCreationNotAuthorized));
      }

      if tax_account.claims_count > id {
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