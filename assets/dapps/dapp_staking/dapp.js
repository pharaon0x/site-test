const Web3 = window.Web3
const Web3Modal = window.Web3Modal.default
const WalletConnectProvider = window.WalletConnectProvider.default
const evmChains = window.evmChains

const PROVIDER_OPTIONS = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: RPC,
            chainId: CHAIN_ID
        }
    }
}

const W3_MODAL = new Web3Modal({
    cacheProvider: false,
    providerOptions: PROVIDER_OPTIONS
})

var WALLET_ADDRESS = NaN
var PROVIDER = NaN

var BUTTON_CONNECT = NaN
var LINK_REF = NaN
var INPUT_DEPOSIT_DURATION = NaN
var INPUT_DEPOSIT_AMOUNT = NaN

function get_short_address(address, tailsLength = 5) {
    return address.substring(0, tailsLength) + '...' + address.substring(address.length - tailsLength, address.length)
}

function set_wallet_address() {
    WALLET_ADDRESS = PROVIDER.selectedAddress
    BUTTON_CONNECT.text(get_short_address(WALLET_ADDRESS))
}

async function wallet_connect() {
    if (await web3check()) {
        return true
    }

    console.log('Opening a dialog', web3Modal)
    try {
        PROVIDER = await web3Modal.connect()
        set_wallet_address()
        return true
    } catch (e) {
        console.log('Could not get a wallet connection', e)
        return false
    }
}

async function check_wallet_connect() {
    try {
        PROVIDER = web3.currentProvider
    } catch (e) {
        console.log('Could find web3 provider', e)
        return false
    }
    if (typeof (PROVIDER.selectedAddress) == 'string') {
        set_wallet_address()
        return true
    } else {
        return false
    }
}

$(function () {
    BUTTON_CONNECT = $('.btn-connect')

    BUTTON_CONNECT.on('click', wallet_connect)

    setTimeout(() => {
        web3check()
    }, 500)
})

