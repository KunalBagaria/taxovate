use crate::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Tax paid must be greater than the claim amount")]
  ClaimTooBig,

  #[msg("Taxed income must be greater than the claim amount")]
  ClaimedIncomeTooBig,

  #[msg("Claim must be made by the owner of the tax account")]
  ClaimCreationNotAuthorized,

  #[msg("Claim ID must be greater than existing claims count")]
  ClaimIdTooSmall,

  #[msg("Claim amount must be greater than zero")]
  ClaimIsZero,

  #[msg("Claim has already been reviewed")]
  ClaimAlreadyReviewed,

  #[msg("Review must be approved by a government employee")]
  ReviewerNotAuthorized,

  #[msg("Withdraw request must be made by the owner of the tax account")]
  WithdrawlNotAuthorized,

  #[msg("Government pool account must be the one specified in the program")]
  WrongPoolAccount,
}