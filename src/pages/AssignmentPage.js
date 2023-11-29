import { Box, Stack } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Header from "../components/Header";

const AssignmentPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  return(
  <Stack>Assignment Page
    <Header />
    <Stack
    bgcolor={blue[100]}
    >

    <Box  mt="2vh" ml="2vw">
    <BackButton onClick={()=>{navigate("/")}}/>
    </Box>
    {user.role ==="teacher" && (<button>test</button>)} 
    assignment list
    </Stack>
  </Stack>
  ); 
};

export default AssignmentPage;
