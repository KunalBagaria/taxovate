use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("5FCuQ3GBv3d1GWropp9t1fW6yLSnqBdSKFU3yfSCjC63");

#[program]
pub mod taxovate {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      let tax_account = &mut ctx.accounts.tax_account;
      tax_account.tax_paid = 0;
      tax_account.taxed_income = 0;
      Ok(())
    }

}