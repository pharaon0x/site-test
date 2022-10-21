const Web3 = window.Web3
const Web3Modal = window.Web3Modal.default
const WalletConnectProvider = window.WalletConnectProvider.default
const evmChains = window.evmChains

const CHAIN_DATA = evmChains.getChain(CHAIN_ID)

const PROVIDER_OPTIONS = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: RPC,
            chainId: CHAIN_ID,
            rpcUrl: RPC[CHAIN_ID]
        }
    }
}

const W3_MODAL = new Web3Modal({
    cacheProvider: false,
    providerOptions: PROVIDER_OPTIONS
})

const PUBLIC_PROVIDER = new Web3(RPC[CHAIN_ID])
const PUBLIC_CONTRACT = new PUBLIC_PROVIDER.eth.Contract(ABI, CONTRACT_ADDRESS)

var WALLET_ADDRESS = NaN
var PROVIDER = NaN

var BUTTON_CONNECT = NaN
var BUTTON_DEPOSIT = NaN
var INPUT_DEPOSIT_VALUE = NaN
var INPUT_DEPOSIT_DURATION = NaN

function get_short_address(address, tailsLength = 5) {
    return address.substring(0, tailsLength) + '...' + address.substring(address.length - tailsLength, address.length)
}

function copy_ref_link() {
    if (typeof ($('.ref_link').attr('address')) === 'string') {
        let value = 'https://' + DOMAIN + '/?ref=' + $('.ref_link').attr('address')
        var tmp = $("<textarea>")
        $("body").append(tmp)
        tmp.val(value).select()
        document.execCommand("copy")
        tmp.remove()

        $.notify(
            'Referral link copied!', "success",
            { position:'top right' }
        )
    }
}

function set_wallet_address() {
    WALLET_ADDRESS = PROVIDER.selectedAddress

    if (isNaN(WALLET_ADDRESS)) {
        WALLET_ADDRESS = PROVIDER.accounts[0]
    }
    
    if (!isNaN(WALLET_ADDRESS)) {
        BUTTON_CONNECT.text(get_short_address(WALLET_ADDRESS))
    }
}

async function update_contract_stat() {
    var contract_stat = await PUBLIC_CONTRACT.methods.contractStat().call()

    var launch_time = new Date(contract_stat.launch_time * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (contract_stat.launched) {
        $('.launched').text('Активен')
    } else {
        $('.launched').text('Неактивен')
    }
    $('.launch_date').text(launch_time.getDate() + ' ' + months[launch_time.getMonth()] + ' ' + launch_time.getFullYear())
    $('.n_users').text(contract_stat.n_users)
    $('.n_deposits').text(contract_stat.n_deposits)
    $('.n_withdrawals').text(contract_stat.n_withdrawals)
    $('.in_sum').text(Math.round(Web3.utils.fromWei(contract_stat.in_sum, 'ether')*10**6)/10**6)
    $('.out_sum').text(Math.round(Web3.utils.fromWei(contract_stat.out_sum, 'ether')*10**6)/10**6)
    $('.ref_sum').text(Math.round(Web3.utils.fromWei(contract_stat.ref_sum, 'ether')*10**6)/10**6)
}

async function update_user_stat(_user) {
    var user_info = await PUBLIC_CONTRACT.methods.userAccount(_user).call()
    var user_stat = await PUBLIC_CONTRACT.methods.userStat(_user).call()
    var user_withdrawable = await PUBLIC_CONTRACT.methods.userWithdrawable(_user).call()

    var reg_time = new Date(user_info.reg_time * 1000);
    var last_payout_time = new Date(user_stat.last_payout_time * 1000)
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    $('.user_id').text(user_info.id)
    $('.user_reg_time').text(reg_time.getDate() + ' ' + months[reg_time.getMonth()] + ' ' + reg_time.getFullYear())
    $('.user_referrer').text(get_short_address(user_info.referrer))
    $('.user_n_deposits').text(user_stat.n_deposits)
    $('.user_n_withdrawals').text(user_stat.n_withdrawals)
    $('.user_in_sum').text(Math.round(Web3.utils.fromWei(user_stat.in_sum, 'ether')*10**6)/10**6)
    $('.user_out_sum').text(Math.round(Web3.utils.fromWei(user_stat.out_sum, 'ether')*10**6)/10**6)
    $('.user_ref_sum').text(Math.round(Web3.utils.fromWei(user_stat.ref_sum, 'ether')*10**6)/10**6)
    $('.user_ref_payable').text(Math.round(Web3.utils.fromWei(user_stat.ref_payable, 'ether')*10**6)/10**6)
    $('.user_withdrawable').text(Math.round(Web3.utils.fromWei(user_withdrawable, 'ether')*10**6)/10**6)
    $('.user_last_payout_time').text(last_payout_time.getDate() + ' ' + months[last_payout_time.getMonth()] + ' ' + last_payout_time.getFullYear() + ' ' + last_payout_time.getHours() + ':' + last_payout_time.getMinutes())

    for (let i = 0; i < user_info.referrals.length; i++) {
        $('.n_ref_' + (i + 1).toString()).text(user_info.referrals[i])
    }

    $('.ref_link').text(get_short_address(_user))
    $('.ref_link').attr('address', _user)
    $('.ref_link').on('click', copy_ref_link)
}

async function update_private() {
    set_wallet_address()
    update_user_stat(WALLET_ADDRESS)
}

async function update_public() {
    update_contract_stat()
}

async function wallet_connect() {
    setTimeout(() => {
        BUTTON_CONNECT.blur()
    }, 250)

    if (await check_wallet_connect()) {
        return true
    }

    console.log('Opening a dialog', W3_MODAL)

    try {
        PROVIDER = await W3_MODAL.connect()
        update_private()
        return true
    } catch (e) {
        console.log('Could not get a wallet connection', e)
        return false
    }
}

async function check_wallet_connect() {
    try {
        PROVIDER = await web3.currentProvider
    } catch (e) {
        console.log('Could find web3 provider', e)
        return false
    }

    if (typeof (PROVIDER.selectedAddress) === 'string') {
        update_private()
        return true
    } else {
        return false
    }
}

async function deposit() {
    setTimeout(() => {
        BUTTON_DEPOSIT.blur()
    }, 250)

    const providerWrapper = new ethers.providers.Web3Provider(PROVIDER)
    const signer = providerWrapper.getSigner()

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

    var value = INPUT_DEPOSIT_VALUE.val()

    const accountBalance = await providerWrapper.getBalance(WALLET_ADDRESS)
    const balance = parseFloat(ethers.utils.formatEther(accountBalance))

    if (value < MIN_DEPOSIT_VALUE) {
        minDepNotif()
        return
    }

    if (value > MAX_DEPOSIT_VALUE) {
        minDepNotif()
        return
    }

    if (value > balance) {
        notEnoughNotif()
        return
    }

    value = ethers.utils.parseEther(value)

    await contract.deposit(Number(INPUT_DEPOSIT_DURATION.val()), WALLET_ADDRESS, {
        value
    })
}

async function calc_profit() {
    var value = INPUT_DEPOSIT_VALUE.val()
    var duration = INPUT_DEPOSIT_DURATION.find('option:selected').attr('precent')

    $('.dep_profit').text(Math.round(Number(value)*Number(duration)*10**6)/10**6)
}

$(function () {
    BUTTON_CONNECT = $('.btn_connect')
    BUTTON_DEPOSIT = $('.btn_deposit')

    INPUT_DEPOSIT_VALUE = $('.dep_value')
    INPUT_DEPOSIT_DURATION = $('.dep_duration')

    BUTTON_CONNECT.on('click', wallet_connect)
    BUTTON_DEPOSIT.on('click', deposit)

    INPUT_DEPOSIT_VALUE.on('input', calc_profit)
    INPUT_DEPOSIT_DURATION.on('input', calc_profit)

    setTimeout(() => {
        update_public()
        update_user_stat('0x598930b6Bd4819756A395609C33BFED92358A24f')
    }, 250)

    setTimeout(() => {
        check_wallet_connect()
    }, 500)
})

