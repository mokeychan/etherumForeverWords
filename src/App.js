import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
// animate
import { StyleSheet, css } from 'aphrodite';
import { spaceInLeft, spaceOutRight } from 'react-magic';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

// animate style
const styles = StyleSheet.create({
    in: {
        animationName: spaceInLeft,
        animationDuration: '2s'
    },
    out: {
        animationName: spaceOutRight,
        animationDuration: '2s'
    }
});

const contractAddress = "0x39e5196750dcddb1aaf6dda7d6e8dbb633482905" // 合约地址(以太坊测试网络)
var simpleStorageInstance // 合约实例

class App extends Component {
  // 初始化构造
  constructor(props) {
    super(props)
    this.state = {
        word: null,
        from: null,
        timestamp: null,
        random: 0,
        count: 0,
        input: '',
        web3: null,
        emptyTip: "还没有留言，快来创建全世界第一条留言吧~",
        firstTimeLoad: true,
        loading: false,
        loadingTip: "留言正在写入，请耐心等待~",
        waitingTip: "留言正在写入，请耐心等待~",
        successTip: "留言成功",
        animate: "",
        in: css(styles.in),
        out: css(styles.out)
    }
  }

  // 获取Web3实例
  componentWillMount() {
    // Get network provider and web3 instance.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  // 获取合约实例
  instantiateContract() {
     /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.at(contractAddress).then(instance => {
        simpleStorageInstance = instance

        /*simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance // 部署本地Ganache*/
        console.log("合约实例获取成功")
      })
      .then(result => {
        return simpleStorageInstance.getRandomWord(this.state.random)
      })
      .then(result => {
                console.log("读取成功", result)
                if(result[1]!=this.setState.word){
                    this.setState({
                        animate: this.state.out
                    })
                    setTimeout(() => {
                        this.setState({
                            count: result[0].c[0],
                            word: result[1],
                            from: result[2],
                            timestamp: result[3],
                            animate: this.state.in,
                            firstTimeLoad: false
                        })
                    }, 2000)
                }else{
                    this.setState({
                        firstTimeLoad: false
                    })
                }
        this.randerWord()
      })

    })
  }

  // 循环从区块上随机读取留言
  randerWord() {
    setInterval(() => {
      let random_num = Math.random() * (this.state.count? this.state.count: 0)
      this.setState({
        random: parseInt(random_num)
      })
      console.log("setInterval读取", this.state.random)
      simpleStorageInstance.getRandomWord(this.state.random)
      .then(result => {
                console.log("setInterval读取成功", result)
                if(result[1]!=this.setState.word){
                    this.setState({
                        animate: this.state.out
                    })
                    setTimeout(() => {
                        this.setState({
                            count: result[0].c[0],
                            word: result[1],
                            from: result[2],
                            timestamp: result[3],
                            animate: this.state.in
                        })
                    }, 2000)
                }
      })
    }, 10000)
  }

  render() {
    return (
      <div className="container">
        <header className="header">“以太坊区块链上永存的留言”</header>
        <main>
          <div className="main-container">
            <div className="showword">
                            <div className={this.state.magic}>
                                {
                                    (simpleStorageInstance && !this.state.firstTimeLoad)
                                    ? <span className={this.state.animate}>{this.state.word || this.state.emptyTip}</span>
                                    : <img src={require("../public/loading/loading-bubbles.svg")} width="64" height="64"/>
                                }
                            </div>
                            <p className={this.state.animate}>
                                <span>{this.state.word? "来源："+this.state.from: ""}</span>
                                <span>{this.state.word? "时间："+this.formatTime(this.state.timestamp): ""}</span>
                            </p>
                        </div>
            <div className="setword">
              <input type="text" value={this.state.input} onChange={e => this.inputWord(e)}/>
              <button onClick={() => this.setWord()}>写入</button>
            </div>
            <div className="tips">
               
            </div>
          </div>
        </main>
        <footer>By <a href="https://www.ldsun.com" target="_blank">Ludis</a></footer>
                <div className={this.state.loading? "loading show": "loading"}>
                    <img src={require("../public/loading/loading-bubbles.svg")} width="128" height="128"/>
                    <p>Matemask 钱包确认支付后开始写入留言</p>
                    <p>{this.state.loadingTip}</p>
                </div>
      </div>
    );
  }
  inputWord(e){
    this.setState({
      input: e.target.value
    })
    }
    // 写入区块链
  setWord(){
        if(!this.state.input) return
        this.setState({
            loading: true
        })
    let timestamp = new Date().getTime()
    simpleStorageInstance.setWord(this.state.input, String(timestamp), {from: this.state.web3.eth.accounts[0]})
    .then(result => {
            this.setState({
                loadingTip: this.state.successTip
            })
            setTimeout(() => {
                this.setState({
                    loading: false,
                    input: '',
                    loadingTip: this.state.waitingTip
                })
            }, 1500)
      
        })
        .catch(e => {
            // 拒绝支付
            this.setState({
                loading: false
            })
        })
  }
    // 时间戳转义
    formatTime(timestamp) {
        let date = new Date(Number(timestamp))
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hour = date.getHours()
        let minute = date.getMinutes()
        let second = date.getSeconds()
        let fDate = [year, month, day, ].map(this.formatNumber)
        return fDate[0] + '年' + fDate[1] + '月' + fDate[2] + '日' + ' ' + [hour, minute, second].map(this.formatNumber).join(':') 
    }
    /** 小于10的数字前面加0 */
    formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }
}

export default App
