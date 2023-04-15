import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SuperAdminPage from './pages/SuperAdminPage';
import University from './components/University';
import EventCard from './components/EventCard';
import RsoPage from './pages/RsoPage';
import Requests from './pages/Requests';
import AdminHome from './pages/AdminHome';
import EventPage from './pages/EventPage';
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
                <Route path="/superadmin/rso" index element ={<RsoPage/>}/>
                <Route path="/superadmin/requests" index element ={<Requests/>}/>
                <Route path="/student" index element ={<HomePage/>}/>
                <Route path="/student/rso" index element ={<RsoPage/>}/>
                <Route path="/studentadmin" index element ={<AdminHome/>}/>
                <Route path="/superadmin/events" index element ={<EventPage/>}/>
            </Routes>
        </BrowserRouter>
        );
    }
}

export default App;
