import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayouts'
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import { Link, Navigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPath';
import uploadImage from '../../utils/UploadImage';


const SignUp = () => {
  const [profilePic,setProfilePic] = useState(null);
  const [fullName,setFullName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [adminInviteToken,setAdminInviteToken] = useState('')
  const [error,setError] = useState(null);

  const {updateUser}= useContext(UserContext)
  const navigate = useNavigate();

  const handleSignUp = async (e)=>{
    e.preventDefault();

    let profileImageUrl = ''

    if(!fullName){
      setError("Please enter full name.")
      return;
    }
    if(!validateEmail(email)){
      setError("Please enter a valid email address.")
      return;
    }
    if(!password){
      setError("Please enter the password")
      return;
    }

    setError("");
    // Call Sign Up API
    try{

      //Upload image if present
      if(profilePic){
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken
      });

      const {token,role}= response.data;

      if(token){
        localStorage.setItem("token",token);
        updateUser(response.data);

        //Redirect based on role
        if (role==="admin"){
          navigate("/admin/dashboard");
        }else{
          navigate("/user/dasboard")
        }
      }
    }catch(error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      }else{
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center items-center px-4'>
        <h3 className='text-xl font-semibold text-black mb-2'>Create an Account</h3>
        <p className='text-xs text-slate-700 mb-6'>
          Join us now by entering your details given below
        </p>

        <form onSubmit={handleSignUp} className='w-full max-w-md space-y-4'>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            value={fullName}
            onChange={({target})=>setFullName(target.value)}
            label="Full Name"
            placeholder="John Wick"
            type="text"
          />

          <Input
            value={email}
            onChange={({target})=>setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />

          <Input
            value={password}
            onChange={({target})=>setPassword(target.value)}
            label="Password"
            placeholder="Min 8 Characters"
            type="password"
          />
          <Input
            value={adminInviteToken}
            onChange={({target})=>setAdminInviteToken(target.value)}
            label="Admin Invite Token"
            placeholder="6 Digit Code"
            type="text"
          />
          </div>

          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
          <button type='submit' className='btn-primary w-full py-2'>SIGN UP</button>
          <p className='text-[13px] text-slate-800 mt-3'>
            Already an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>

          
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp;
