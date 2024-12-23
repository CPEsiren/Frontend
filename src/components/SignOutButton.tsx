import { Button } from "@mui/material";

export const SignOutButton = () => {
  return (
    <Button
      color="secondary"
      sx={{
        m: 0,
        marginLeft: "10px",
        fontSize: 13,
        fontWeight: 300,
        "&:focus": {
          outline: "none",
          color: "#F25A28",
        },
        "&:hover": {
          color: "#F25A28",
        },
      }}
    >
      Sign out
    </Button>
  );
};
