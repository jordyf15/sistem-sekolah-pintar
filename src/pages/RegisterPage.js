import { Stack } from '@mui/material';
import React from "react";

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
   console.log(nama)
   if(password.value == confirmPassword.value){
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
      
      > REGISTER
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
    </Stack>
   
  )
} 