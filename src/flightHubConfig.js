import React from 'react'
import basePage from './basePage.js'
import './css/styles.css'
import Form from 'react-bootstrap/Form'
import { Button } from 'react-bootstrap'

class FlightHubConfig extends basePage {
  constructor (props, usesSocketIO = false) {
    super(props)
    this.state = {
      errors: '',
      loading: false,
      error: null,
      infoMessage: null,
      token: ''
    }
  }

  renderTitle () {
    return 'Flight Hub Config'
  }
  changeHandler = event => {
    //form change handler
    const name = event.target.name;
    const value = event.target.value;

    this.setState({
      [name]: value
    });
  }

  componentDidMount () {
    fetch('/api/flighthubinfo').then(response => response.json()).then((state) => {
      console.log('state', state)
      this.setState(state)
      this.loadDone()
    })
  }
  handleConfigSubmit = event => {
    //user clicked start/stop NTRIP
    fetch('/api/flighthubinfo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: this.state.token
      })
    }).then(response => response.json()).then(state => { console.log(state)
       this.setState(state) });
  }
  renderContent () {
    return (
            <div>
                <h2>Configuration</h2>
                <Form style={{ width: 500 }}>
                    <div className="form-group row" style={{ marginBottom: '5px' }}>
                        <label className="col-sm-3 col-form-label">Device token</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control" name="token" disabled={this.state.active === true} onChange={this.changeHandler} value={this.state.token} />
                        </div>
                    </div>
                    <div className="form-group row" style={{ marginBottom: '5px' }}>
                        <div className="col-sm-10">
                            <Button onClick={this.handleConfigSubmit} className="btn btn-primary">Submit</Button>
                        </div>
                    </div>
                </Form>
            </div>
    )
  }
}

export default FlightHubConfig
