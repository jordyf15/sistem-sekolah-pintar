import { SearchRounded } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";

const Searchbar = ({ ...props }) => {
  return (
    <TextField
      {...props}
      sx={{
        fieldSet: {
          border: "1px solid black",
          borderRadius: "4px",
        },
        input: {
          "&::placeholder": {
            opacity: 0.6,
          },
          py: 0.75,
          px: 1,
          pl: 0,
          fontWeight: 500,
          fontSize: "16px",
        },
        "& .MuiInputBase-root": {
          pl: 1,
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ p: 0 }}>
            <SearchRounded
              sx={{
                fontSize: "16px",
              }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default Searchbar;
