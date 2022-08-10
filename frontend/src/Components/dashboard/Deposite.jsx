import React, { useEffect, useState } from 'react'
import HeaderDashboard from './HeaderDashboard'
import SidebarDashboard from './SidebarDashboard'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import axios from 'axios';
import config from '../../config'
// import Web3 from 'web3';

const columns = [
  { field: 'date', headerName: 'Date', width: 170 },
  { field: 'id', headerName: 'Id no.', width: 170 },
  { field: 'billing_name', headerName: 'Billing Name', width: 170 },
  { field: 'amount', headerName: 'Amount', width: 170 },
  { field: 'payment_status', headerName: 'Payment Status', width: 170 },
];


function Deposite() {

  const userState = useSelector(selectUser)

  const [plans, setplans] = useState([])
  const [history, sethistory] = useState([])
  const [selectPlan, setSelectPlan] = useState("")
  const [planPrice, setPlanPrice] = useState("")
  const [wallet, setwallet] = useState("")
  const [rows, setrows] = useState([])
  const [walletBtn, setwalletBtn] = useState("Connect Wallet")
  const [error, seterror] = useState({
    state: false,
    text: "",
    variant: "",
  })

  useEffect(() => {
    plans.forEach(element => {
      if (element.id == selectPlan) {
        setPlanPrice(element.amount)
      }
    });
  }, [selectPlan])


  const getPlans = async () => {
    axios.post(`${config.baseURL}/plans.php`, {
      token: userState.token,
    }).then(async (response) => {
      setplans(await response.data)
      setSelectPlan(await response.data[0].id)
      setPlanPrice(await response.data[0].amount)
    })
  }
  const getHistory = async () => {
    sethistory([])
    axios.post(`${config.baseURL}/get-history.php`, {
      token: userState.token,
      email: userState.email,
    }).then(async (response) => {
      let response_data = response.data
      let tempArr = []
      response_data.forEach(element => {
        tempArr.push(
          { date: element.history.created_at, id: "#" + element.history.id, billing_name: element.user.name, amount: element.plan.amount, payment_status: element.history.status == 1 ? "Payed" : "Canceled" },
        )
      });
      sethistory(tempArr)
    })
  }


  // Metamask
  let web3;

  const formSubmit = async () => {
    if (!ethereum.selectedAddress) {
      if (typeof window.ethereum !== 'undefined') {
        await ethereum.request({
          method: 'eth_requestAccounts'
        });
        web3 = new Web3(window.web3.currentProvider)
        setwalletBtn("Checkout")
        showAlert(false)
        detectChain()
      } else {
        alert("Please Install Meta Mask")
      }
    } else {
      web3 = new Web3(window.web3.currentProvider)
      let amount
      plans.forEach(element => {
        if (element.id = selectPlan) {
          amount = element.amount
        }
      });
      if (ethereum.networkVersion == '1' || 1) {

        web3.eth.sendTransaction({
          to: '0x2b58713E4d56eAB77826279CfAcFF2216C049103',
          from: ethereum.selectedAddress,
          value: web3.toWei(amount, 'tether'),
          chainId: '0x1',

        }, async (err, result) => {
          if (err) {
            showAlert(true, 'danger', 'Transaction Failed')
          }
          if (result) {
            showAlert(true, 'info', `Please Wait ...`)
            axios.post(`${config.baseURL}/buy-plan.php`, {
              token: userState.token,
              email: userState.email,
              plan_id: selectPlan,
            }).then((result) => {
              showAlert(true, 'success', 'Transaction Success')
              getHistory()
            }).catch((error) => {
              showAlert(true, 'danger', error)
            })
          }
        })
      } else {
        detectChain()
      }
    }
  }


  window.onload = () => {
    if (ethereum.selectedAddress) {
      setwalletBtn("Checkout ")
      showAlert(false)
    }
    detectChain()
  }

  ethereum.on('accountsChanged', (account) => {
    if (account.length == 0) {
      showAlert(true, 'warning', 'Wallet disconnected !')
      setwalletBtn("Connect Wallet")
    }
  });

  ethereum.on('chainChanged', (chainId) => {
    if (chainId != '0x1') {
      showAlert(true, 'danger', 'Change your network to Mainnet')
    } else {
      showAlert(false)
    }
  });

  const detectChain = (chain = null) => {
    if (ethereum.networkVersion != '1') {
      showAlert(true, 'danger', 'Change your network to Mainnet')
    } else {
      showAlert(false)
    }
  }


  const showAlert = (state, variant = "", text = "",) => {
    seterror({
      state,
      variant,
      text,
    })
  }

  useEffect(() => {
    getPlans()
    getHistory()
  }, [])

  return (
    <>
      <div class="dashboard-body">
        <div className='ws-nav-bg'>
          <img src="/assets/images/bg-effect.png" alt="" />
        </div>
        <div className="ws-nav">
          <HeaderDashboard />
        </div>
        <div className="container ws-container dashboard-main">
          <div className="w-100 px-lg-0 px-3 d-flex flex-lg-row flex-column">
            <div className="ws-side-col pt-lg-0 pt-4">
              <SidebarDashboard />
            </div>
            <div className="ws-side-main">
              <div className="ps-lg-4">
                <div className="d-flex align-items-center justify-content-between pt-3 pb-4">
                  <span className='fs-6 fw-500 text-light'>DEPOSITS</span>
                  <span className='fs-7 text-light '> <Link to="dashboard" className='text-light text-faded text-decoration-none'>Dashboard </Link>   <span className='text-faded fs-8'>/</span>  <Link to="deposit" className='text-light text-faded text-decoration-none'>Deposits</Link></span>
                </div>
                <div className="w-100">
                  <div className="card ws-card mb-4" bis_skin_checked={1}>
                    <div className="card-body p-4" bis_skin_checked={1}>
                      <h4 className="mb-3 text-dark text-faded">New Deposits</h4>
                      <div>
                        <h5 className="mb-3 text-dark text-faded">Account Information</h5>
                        {
                          error.state && < div class={"alert alert-" + error.variant} role="alert">{error.text}</div>
                        }
                        <div className="row" bis_skin_checked={1}>
                          <div className="col-md-12 mb-3" bis_skin_checked={1}>
                            <label className="form-label">Select Plan</label>
                            <select onChange={(e) => setSelectPlan(e.target.value)} className="form-control select2 select2-hidden-accessible" data-select2-id={1} tabIndex={-1} aria-hidden="true">
                              {
                                plans.map((element, index) => {
                                  return (
                                    <option value={element.id} >{element.title} {element.amount} USDT</option>
                                  )
                                })
                              }
                            </select>
                          </div>
                          <div className="col-md-12" bis_skin_checked={1}>
                            <div className="mb-3" bis_skin_checked={1}>
                              <label className="form-label">Amount</label>
                              <input className="form-control" required type="text" disabled value={planPrice} />
                            </div>
                          </div>
                        </div>
                        {/* <div className="row" bis_skin_checked={1}>
                          <div className="col-md-12" bis_skin_checked={1}>
                            <div className="mb-3" bis_skin_checked={1}>
                              <label className="form-label">Wallet Address</label>
                              <input onChange={(e) => setwallet(e.target.value)} className="form-control" required type="text" name placeholder="Enter USDT Wallet Address" />
                            </div>
                          </div>
                        </div> */}
                        <div className="row" bis_skin_checked={1}>
                          <div className="col-md-6" bis_skin_checked={1}>
                            <button onClick={() => formSubmit()} className="btn btn-success waves-effect waves-light ws-btn-1">{walletBtn}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card ws-card mb-4" bis_skin_checked={1}>
                    <div className="card-body p-4" bis_skin_checked={1}>
                      <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                          rows={history}
                          columns={columns}
                          pageSize={5}
                          rowsPerPageOptions={[5]}
                          disableSelectionOnClick
                        />
                      </Box>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Deposite