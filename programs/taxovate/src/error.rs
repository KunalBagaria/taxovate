use crate::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Tax paid must be greater than the claim amount")]
  ClaimTooBig,

  #[msg("Claim amount must be greater than zero")]
  ClaimIsZero,
}