use crate::state::{Claim, TaxAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        seeds = [b"user".as_ref()],
        bump,
        space = TaxAccount::LEN
    )]
    pub tax_account: Account<'info, TaxAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64, tax_code: String, amount: u64, proof: String)]
pub struct CreateClaim<'info> {
    #[account(mut, seeds = [b"user".as_ref()], bump)]
    pub tax_account: Account<'info, TaxAccount>,

    #[account(
        init,
        payer = user,
        seeds = [
          b"claim".as_ref(),
          tax_account.key().as_ref(),
          &id.to_le_bytes()
        ],
        bump,
        space = Claim::LEN
    )]
    pub claim: Account<'info, Claim>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
