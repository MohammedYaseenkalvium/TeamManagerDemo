import React, { useContext } from 'react'
import{
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom"
import SignUp from './pages/Auth/SignUp'
import Login from './pages/Auth/Login'
import PrivateRoutes from './routes/PrivateRoutes'
import Dashboard from './pages/Admin/Dashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'
import Dashboarduser from './pages/User/Dashboarduser'
import MyTasks from './pages/User/MyTasks'
import ViewTaskDetails from './pages/User/ViewTaskDetails'
import UserProvider, { UserContext } from './context/UserContext'

const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signUp" element={<SignUp/>}/>
          {/* Admin Route */}
          <Route element={<PrivateRoutes allowedRoles={["admin"]}/>}>
            <Route path="/admin/dashboard" element={<Dashboard/>}/>
            <Route path="/admin/tasks" element={<ManageTasks/>}/>
            <Route path="/admin/create-task" element={<CreateTask/>}/>
            <Route path="/admin/users" element={<ManageUsers/>}/>
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoutes allowedRoles={["admin"]}/>}>
            <Route path="/user/dashboard" element={<Dashboarduser/>}/>
            <Route path="/user/my-tasks" element={<MyTasks/>}/>
            <Route path="/user/tasks-details/:id" element={<ViewTaskDetails/>}/>
            
            
          </Route>
          {/* Default Route */}
          <Route path='/' element={<Root/>}/>
        </Routes>
      </Router>
    </div>
    </UserProvider>
  )
}

export default App

const Root=()=>{
  const {user,loading} = useContext(UserContext);

  if(loading) return <Outlet/>
  if(!user){
    return <Navigate to="/login"/>

  }

  return user.role === "admin" ? <Navigate to="/admin/dasboard" />:<Navigate to="/user/dashboard" />;
}