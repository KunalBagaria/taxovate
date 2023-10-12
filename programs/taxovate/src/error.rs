use crate::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Tax paid must be greater than the claim amount")]
  ClaimTooBig,

  #[msg("Taxed income must be greater than the claim amount")]
  ClaimedIncomeTooBig,

  #[msg("Claim ID must be greater than existing claims count")]
  ClaimIdTooSmall,

  #[msg("Claim amount must be greater than zero")]
  ClaimIsZero,

  #[msg("Claim has already been reviewed")]
  ClaimAlreadyReviewed,

  #[msg("Review must be approved by a government employee")]
  ReviewerNotAuthorized,
}