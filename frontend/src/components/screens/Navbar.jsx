import React,{useInsertionEffect, useState} from 'react';
import {AppBar, Toolbar,Avatar, Box, ListItemIcon, Tooltip, Menu, MenuItem,Divider,IconButton,Typography} from '@mui/material';
import {PersonAdd, Settings, Logout} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";
import { useEffect } from 'react';
import api from "../../api.js";

const Navbar=()=>{
    const [user,setuser]=useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate= useNavigate();
  useEffect(()=>{
    const fetchuserdata=async()=>{
         try {
          const res=await api.get("/me",{withCredentials:true});
          setuser(res.data.user);
         } catch (error) {
          console.error("Failed to fetch user",error);
          navigate("/login");
         }
    };
    fetchuserdata();

  },[navigate]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
 const handleNavigate=(path)=>{
    handleClose();
    navigate(path);
 }
 const handlelogout=async()=>{
     try{
      await api.post("/logout",{},{withCredentials:true});
      setuser(null);
      navigate("/login");
     }catch(error){
      console.error("Logout failed",error);
     }
 };
 
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        Algohub
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => navigate("/homepage")}
        >
          AlgoHub
        </Typography>

        {/* Avatar Menu */}
        {user && (
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.fname?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
        )}

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* User info */}
          <MenuItem disabled>
            <Avatar /> <strong>{user?.fname} {user?.lname}</strong> ({user?.role})
          </MenuItem>
          <Divider />

          {/* Menu actions */}
          <MenuItem onClick={() => handleNavigate("/homepage")}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Home
          </MenuItem>
          <MenuItem onClick={() => handleNavigate("/update-profile")}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Update Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigate("/update-email")}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Update Email
          </MenuItem>
          <MenuItem onClick={() => handleNavigate("/change-password")}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Change password
          </MenuItem>
          <MenuItem onClick={handlelogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

