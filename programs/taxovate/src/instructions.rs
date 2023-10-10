use anchor_lang::prelude::*;
use crate::state::TaxAccount;

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

// #[derive(Accounts)]
// pub struct SubmitClaim<'info> {
//     pub tax_account: Account<'info, TaxAccount>,
//     #[account(
//       init,
//       payer = user,
//       seeds = [b"user".as_ref()],
//       bump,
//       space = Claim::LEN
//     )]
//     pub claim: Account<'info, Claim>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub rent: Sysvar<'info, Rent>,
//     pub system_program: Program<'info, System>,
// }