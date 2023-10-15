import { Taxovate } from "./taxovate";

export const IDL: Taxovate = {
  "version": "0.1.0",
  "name": "taxovate",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "taxAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "taxAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fromAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "toAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "govAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createClaim",
      "accounts": [
        {
          "name": "taxAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claim",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "taxCode",
          "type": "string"
        },
        {
          "name": "claimAmount",
          "type": "u64"
        },
        {
          "name": "onIncomeAmount",
          "type": "u64"
        },
        {
          "name": "proof",
          "type": "string"
        }
      ]
    },
    {
      "name": "reviewClaim",
      "accounts": [
        {
          "name": "taxAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claim",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "approve",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "taxAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taxPaid",
            "type": "u64"
          },
          {
            "name": "taxedIncome",
            "type": "u64"
          },
          {
            "name": "claimsCount",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "claim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "taxAccount",
            "type": "publicKey"
          },
          {
            "name": "taxCode",
            "type": "string"
          },
          {
            "name": "claimAmount",
            "type": "u64"
          },
          {
            "name": "onIncomeAmount",
            "type": "u64"
          },
          {
            "name": "proof",
            "type": "string"
          },
          {
            "name": "reviewed",
            "type": "bool"
          },
          {
            "name": "approval",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ClaimTooBig",
      "msg": "Tax paid must be greater than the claim amount"
    },
    {
      "code": 6001,
      "name": "ClaimedIncomeTooBig",
      "msg": "Taxed income must be greater than the claim amount"
    },
    {
      "code": 6002,
      "name": "ClaimCreationNotAuthorized",
      "msg": "Claim must be made by the owner of the tax account"
    },
    {
      "code": 6003,
      "name": "ClaimIdTooSmall",
      "msg": "Claim ID must be greater than existing claims count"
    },
    {
      "code": 6004,
      "name": "ClaimIsZero",
      "msg": "Claim amount must be greater than zero"
    },
    {
      "code": 6005,
      "name": "ClaimAlreadyReviewed",
      "msg": "Claim has already been reviewed"
    },
    {
      "code": 6006,
      "name": "ReviewerNotAuthorized",
      "msg": "Review must be approved by a government employee"
    },
    {
      "code": 6007,
      "name": "WithdrawlNotAuthorized",
      "msg": "Withdraw request must be made by the owner of the tax account"
    },
    {
      "code": 6008,
      "name": "WrongPoolAccount",
      "msg": "Government pool account must be the one specified in the program"
    }
  ]
}