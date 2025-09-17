import React, { useContext } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/UserContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Dashboard = () => {
  useUserAuth();

  const {user} = useContext(UserContext)
  return (
    <DashboardLayout>Dashboard
    {JSON.stringify(user)}
    </DashboardLayout>
  )
}

export default Dashboard