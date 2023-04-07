import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SuperAdminPage from './pages/SuperAdminPage';
import University from './components/University';
class App extends Component {
state = {
    data: null
  };

    componentDidMount() {
        this.callBackendAPI()
        .then(res => this.setState({ data: res.express }))
        .catch(err => console.log(err));
    }
    // fetching the GET route from the Express server which matches the GET route from server.js
    callBackendAPI = async () => {
        const response = await fetch('/api');
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message) 
        }
        return body;
    };

    render() {
        return (
        <BrowserRouter forceRefresh={true}>
            <Routes>
                <Route path="/" index element={<LoginPage/>} />
                
                <Route path="/superadmin" index element={<SuperAdminPage/>}/>
                <Route path="/superadmin/university" index element={<University/>}/>
            </Routes>
        </BrowserRouter>
        );
    }
}

export default App;
