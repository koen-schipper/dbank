import { Tabs, Tab } from 'react-bootstrap';
import dBank from '../abis/dBank.json';
import React, { Component, useEffect } from 'react';
import Token from '../abis/Token.json';
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    //check if MetaMask exists
    //assign to values to variables: web3, netId, accounts
    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();

      //check if account is detected, then load balance & setStates, else push alert
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with MetaMask')
      }
      //create new instance of the contracts
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address);
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address);
        const dBankAddress = dBank.networks[netId].address;
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress});
      } catch (e) {
        console.log('Error', e);
        window.alert('Contracts not deployed to the current network');
      }
    } else {
      //if MetaMask not exists push alert
      window.alert(`Hi! This is a blockchain powered website. Please install MetaMask. For more information, please visit metamask.io.`)
    }
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(this.state.dbank !== "undefined") {
      //in try block call dBank deposit();
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    e.preventDefault()
    if(this.state.dbank !== "undefined") {
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  async checkInterest(e) {
    e.preventDefault()

    const token = this.state.token;
    if(this.state.dbank !== "undefined") {
      try{
        const tokenBalance = await token.methods.balanceOf(this.state.account).call()
        this.setState({ interest: tokenBalance });
      } catch(e) {
        console.log('Error, interest ', e)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      interest: ''
    }
  }

  render() {
    return (
        <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://koenschipper.com"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br/>
          <h1>Welcome to dBank</h1>
          <h4>{this.state.account}</h4>
          <br/>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="deposit" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <br/>
                    How much do you want to deposit?
                    <br/>
                    (min. amount is 0.01 ETH)
                    <br/>
                    (1 deposit is possible at the time)
                    <br/>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className="form-group mr-sm-2">
                        <br/>
                        <input
                          id="depositAmount"
                          step="0.01"
                          type="number"
                          className="form-control form-control-md"
                          placeholder="amount..."
                          required
                          ref={(input) => { this.depositAmount = input }}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">DEPOSIT</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                  <div>
                    <br/>
                    Do you want to withdraw + take interest?
                    <br/>
                    <br/>
                    <button
                        type='submit'
                        className='btn btn-primary'
                        onClick={(e) => this.withdraw(e)}
                    >
                      WITHDRAW
                    </button>
                  </div>
                </Tab>
                <Tab eventKey="interest" title="Check Interest">
                  <div>
                    <br/>
                    Do you want to check your interest?
                    <br/>
                    <br/>
                    <button
                        type='submit'
                        className='btn btn-primary'
                        onClick={(e) => this.checkInterest(e)}
                    >
                      CHECK INTEREST
                    </button>
                    <h5>Your interest is: {this.state.interest}</h5>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;