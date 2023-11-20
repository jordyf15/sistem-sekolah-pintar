import { Stack } from '@mui/material';
import React from "react";
import { useNavigate } from 'react-router-dom';


export default function RegisterForm (){
  const [formData, setFormData] = React.useState(
    {
    nama: "",
    userId: "",
    password: "",
    confirmPassword: "",
    role: ""
        
    }
  
)
const navigate = useNavigate();

function handleChange(event) {
  //console.log(event.target)
  //const {name, value} = event.target
  setFormData(prevFormData => {
      return {
          ...prevFormData,
          [event.target.name]: event.target.value
      }
  })
}

function handleSubmit(event) {
  const {nama, userId, password, confirmPassword} =event.target
   event.preventDefault()
   if(nama.value.length === 0) console.log("nama tidak boleh kosong");
   if(userId.value.length === 0) console.log("id tidak boleh kosong");
   if(password.value.length === 0)console.log("pass tidak boleh kosong");
   if(confirmPassword.value !== password.value) console.log("password tidak sama");
   if(password.value === confirmPassword.value){
       console.log("commit to firebase")
   }else{
       console.log(password)
       console.log(confirmPassword)
       console.log("password is not same")
   }
}

  return(
    <Stack minHeight="100vh"
      bgcolor="#f2f2f2"
      alignItems="center"
      justifyContent="center"
      >
      <Stack
          border="1px solid #000000"
          width="80vw"
          bgcolor="background.paper"
          maxWidth="400px"
          p={2}
          alignItems="center"
          justifyContent="center"
          spacing={2}
          borderRadius="16px"
        >
        REGISTER
        <form 
      onSubmit={handleSubmit}>
        <input
        type="text"
        placeholder="Nama"
        onChange={handleChange}
        name="nama"
        value={formData.nama}
        />
        <br/>
        <input
        type="text"
        placeholder="UserId"
        onChange={handleChange}
        name="userId"
        value={formData.userId}
        />
        <br/>
        <input
        type="password"
        placeholder="Password"
        onChange={handleChange}
        name="password"
        value={formData.password}
        />
        <br/>
        <input
        type="password"
        placeholder="Confirm Password"
        onChange={handleChange}
        name="confirmPassword"
        value={formData.confirmPassword}
        />
        <fieldset>
        <legend>Guru atau Murid?</legend>
        <input 
        type="radio"
        id="Guru"
        name="role"
        value="Guru"
        checked={formData.role === "Guru"}
        onChange={handleChange}
        />
        <label htmlFor="Guru">Guru</label>
        <br />               
        <input 
        type="radio"
        id="Murid"
        name="role"
        value="Murid"
        checked={formData.role ==="Murid"}
        onChange={handleChange}
        />
        <label htmlFor="Murid">Murid</label>
        </fieldset>
        <br/>
        <button>Buat</button>
        </form>
        </Stack> '
        <br/>
        <br/>
        <button 
        justifyContent="center"
        alignItems="center"
        onClick={() => navigate("/login")}
        >Login Page</button>
        
    </Stack>
   
  )
} 