import React from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'

const Dashboarduser = () => {
  useUserAuth()
  return (
    <div>Dashboarduser</div>
  )
}

export default Dashboarduser