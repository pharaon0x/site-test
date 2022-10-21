const ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_plan",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_referrer",
				"type": "address"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "launch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "launch_time",
				"type": "uint256"
			}
		],
		"name": "Launch",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "plan",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "open_time",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "close_time",
				"type": "uint256"
			}
		],
		"name": "NewDeposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "NewWithdraw",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "addr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reg_time",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			}
		],
		"name": "UserRegistration",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractStat",
		"outputs": [
			{
				"internalType": "bool",
				"name": "launched",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "launch_time",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "n_users",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "n_deposits",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "n_withdrawals",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "in_sum",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "out_sum",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ref_sum",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "userAccount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "reg_time",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "referrals",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "userStat",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "n_deposits",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "n_withdrawals",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "in_sum",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "out_sum",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ref_sum",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ref_payable",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "last_payout_time",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "userWithdrawable",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "withdrawable",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
